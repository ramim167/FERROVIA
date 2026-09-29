import { getDatabaseMode, withTransaction } from '../config/database.js'
import {
  cancelBooking,
  cancelBookingWorkflow,
  createNotification,
  createRefundRequests,
} from '../repositories/booking.repository.js'

const DEFAULT_GENERATION_DAYS = 7
const DEFAULT_MAINTENANCE_INTERVAL_MS = 60_000
const OPERATING_DAY_START_HOUR = 8

let maintenanceTimer
let maintenanceRun

function generationDays() {
  const parsed = Number(process.env.TRIP_GENERATION_DAYS || DEFAULT_GENERATION_DAYS)
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_GENERATION_DAYS
  return Math.floor(parsed)
}

function maintenanceIntervalMs() {
  const parsed = Number(process.env.SCHEDULE_MAINTENANCE_INTERVAL_MS || DEFAULT_MAINTENANCE_INTERVAL_MS)
  if (!Number.isFinite(parsed) || parsed < 1000) return DEFAULT_MAINTENANCE_INTERVAL_MS
  return Math.floor(parsed)
}

export async function ensureUpcomingTrips(days = generationDays()) {
  if (getDatabaseMode() !== 'postgres') {
    return { skipped: true, reason: 'non-postgres database mode' }
  }

  return withTransaction(async connection => {
    const before = await countUpcomingRows(connection, days)

    await connection.query('CALL generate_scheduled_trips($1)', [days])

    const after = await countUpcomingRows(connection, days)
    return {
      skipped: false,
      days,
      operatingDayStartHour: OPERATING_DAY_START_HOUR,
      tripsAdded: after.trips - before.trips,
      tripStopsAdded: after.tripStops - before.tripStops,
      tripSeatsAdded: after.tripSeats - before.tripSeats,
      upcomingTrips: after.trips,
    }
  })
}

async function countUpcomingRows(connection, days) {
  const result = await connection.query(
    `
    WITH operating_window AS (
      SELECT
        CASE
          WHEN CURRENT_TIME < TIME '${String(OPERATING_DAY_START_HOUR).padStart(2, '0')}:00'
          THEN CURRENT_DATE - INTERVAL '1 day' + INTERVAL '${OPERATING_DAY_START_HOUR} hours'
          ELSE CURRENT_DATE + INTERVAL '${OPERATING_DAY_START_HOUR} hours'
        END AS window_start
    ),
    target_trips AS (
      SELECT TRIP_ID
      FROM TRIPS
      CROSS JOIN operating_window ow
      WHERE SCHEDULED_DEPARTURE >= ow.window_start
        AND SCHEDULED_DEPARTURE < ow.window_start + ($1::INT * INTERVAL '1 day')
    )
    SELECT
      (SELECT COUNT(*)::INT FROM target_trips) AS trips,
      (SELECT COUNT(*)::INT FROM TRIP_STOPS ts JOIN target_trips tt ON tt.TRIP_ID = ts.TRIP_ID) AS trip_stops,
      (SELECT COUNT(*)::INT FROM TRIP_SEATS ts JOIN target_trips tt ON tt.TRIP_ID = ts.TRIP_ID) AS trip_seats
    `,
    [days]
  )

  const row = result.rows[0]
  return {
    trips: Number(row.TRIPS || 0),
    tripStops: Number(row.TRIP_STOPS || 0),
    tripSeats: Number(row.TRIP_SEATS || 0),
  }
}

async function expireStaleSeatHolds() {
  if (getDatabaseMode() !== 'postgres') return 0

  return withTransaction(async connection => {
    const expired = await connection.query(
      `SELECT COUNT(*)::INT AS EXPIRED_COUNT
         FROM SEAT_RESERVATIONS
        WHERE RESERVATION_STATUS = 'HELD'
          AND HOLD_EXPIRES_AT <= CURRENT_TIMESTAMP`
    )
    await connection.query('CALL expire_stale_seat_holds()')
    return Number(expired.rows[0]?.EXPIRED_COUNT || 0)
  })
}

export async function autoCancelUnassignedTrips() {
  const totals = {
    cancelledTrips: 0,
    cancelledBookings: 0,
    refundRequests: 0,
  }

  // PostgreSQL processes one trip per transaction. The previous implementation
  // locked every overdue trip while all bookings and refunds were processed,
  // which made an admin assignment wait indefinitely behind the maintenance job.
  if (getDatabaseMode() === 'postgres') {
    while (true) {
      const result = await cancelNextDueTrip()
      if (!result) break
      totals.cancelledTrips += result.cancelledTrips
      totals.cancelledBookings += result.cancelledBookings
      totals.refundRequests += result.refundRequests
    }
    return totals
  }

  // pg-mem does not support PostgreSQL's SKIP LOCKED clause. Keeping the
  // compatible path here also makes the integration test database deterministic.
  return withTransaction(async connection => {
    const dueTrips = await connection.query(
      `SELECT TRIP_ID
         FROM TRIPS
        WHERE OPERATOR_USER_ID IS NULL
          AND SCHEDULED_DEPARTURE <= CURRENT_TIMESTAMP
          AND TRIP_STATUS IN ('SCHEDULED','BOARDING')`
    )

    for (const trip of dueTrips.rows) {
      const result = await cancelTripAndBookings(connection, trip.TRIP_ID)
      totals.cancelledTrips += result.cancelledTrips
      totals.cancelledBookings += result.cancelledBookings
      totals.refundRequests += result.refundRequests
    }

    return totals
  })
}

async function cancelNextDueTrip() {
  return withTransaction(async connection => {
    const dueTrip = await connection.query(
      `SELECT TRIP_ID
         FROM TRIPS
        WHERE OPERATOR_USER_ID IS NULL
          AND SCHEDULED_DEPARTURE <= CURRENT_TIMESTAMP
          AND TRIP_STATUS IN ('SCHEDULED','BOARDING')
        ORDER BY SCHEDULED_DEPARTURE, TRIP_ID
        LIMIT 1
        FOR UPDATE SKIP LOCKED`
    )

    if (!dueTrip.rows.length) return null
    return cancelTripAndBookings(connection, dueTrip.rows[0].TRIP_ID)
  })
}

async function cancelTripAndBookings(connection, tripId) {
  const cancelledTrip = await connection.query(
    `UPDATE TRIPS
        SET TRIP_STATUS = 'CANCELLED'
      WHERE TRIP_ID = $1
        AND OPERATOR_USER_ID IS NULL
        AND TRIP_STATUS IN ('SCHEDULED','BOARDING')
      RETURNING TRIP_ID`,
    [tripId]
  )

  if (!cancelledTrip.rows.length) {
    return { cancelledTrips: 0, cancelledBookings: 0, refundRequests: 0 }
  }

  const bookings = await connection.query(
    `SELECT BOOKING_ID, USER_ID, PNR_NUMBER, BOOKING_STATUS
       FROM BOOKINGS
      WHERE TRIP_ID = $1
        AND BOOKING_STATUS IN ('PENDING','CONFIRMED')
      FOR UPDATE`,
    [tripId]
  )

  let bookingCount = 0
  let refundCount = 0

  for (const booking of bookings.rows) {
    const refundsBefore = await refundCountForBooking(connection, booking.BOOKING_ID)
    if (getDatabaseMode() === 'postgres') {
      await cancelBookingWorkflow(connection, booking.BOOKING_ID)
    } else {
      if (booking.BOOKING_STATUS === 'CONFIRMED') {
        await createRefundRequests(connection, booking.BOOKING_ID)
      }
      await cancelBooking(connection, booking.BOOKING_ID)
    }
    const refundsAfter = await refundCountForBooking(connection, booking.BOOKING_ID)
    refundCount += refundsAfter - refundsBefore
    bookingCount += 1

    if (getDatabaseMode() !== 'postgres') {
      await createNotification(connection, {
        userId: booking.USER_ID,
        bookingId: booking.BOOKING_ID,
        tripId,
        title: 'Trip cancelled',
        message: booking.BOOKING_STATUS === 'CONFIRMED'
          ? `Trip #${tripId} was cancelled because no operator was assigned before departure. Refund processing has been started for booking ${booking.PNR_NUMBER}.`
          : `Trip #${tripId} was cancelled because no operator was assigned before departure. Pending booking ${booking.PNR_NUMBER} was released.`,
      })
    }
  }

  return {
    cancelledTrips: 1,
    cancelledBookings: bookingCount,
    refundRequests: refundCount,
  }
}

async function refundCountForBooking(connection, bookingId) {
  const result = await connection.query(
    `SELECT COUNT(*)::INT AS REFUND_COUNT
       FROM REFUNDS RF
       JOIN TICKETS TK ON TK.TICKET_ID = RF.TICKET_ID
       JOIN PASSENGERS P ON P.PASSENGER_ID = TK.PASSENGER_ID
      WHERE P.BOOKING_ID = $1`,
    [bookingId]
  )

  return Number(result.rows[0]?.REFUND_COUNT || 0)
}

export function runScheduleMaintenance() {
  if (maintenanceRun) return maintenanceRun

  maintenanceRun = (async () => {
    const cancellations = await autoCancelUnassignedTrips()
    const expiredSeatHolds = await expireStaleSeatHolds()
    const generation = await ensureUpcomingTrips()
    return { cancellations, expiredSeatHolds, generation }
  })().finally(() => {
    maintenanceRun = undefined
  })

  return maintenanceRun
}

export function startScheduleMaintenance(logger = console) {
  if (maintenanceTimer || process.env.SCHEDULE_MAINTENANCE === 'false') {
    return maintenanceTimer
  }

  maintenanceTimer = setInterval(async () => {
    try {
      const result = await runScheduleMaintenance()
      if (result.cancellations.cancelledTrips) {
        logger.log(
          `Cancelled ${result.cancellations.cancelledTrips} unassigned departed trip(s); ` +
          `${result.cancellations.refundRequests} refund request(s) created`
        )
      }
    } catch (error) {
      logger.error('Schedule maintenance failed:', error)
    }
  }, maintenanceIntervalMs())

  return maintenanceTimer
}

export function stopScheduleMaintenance() {
  if (!maintenanceTimer) return
  clearInterval(maintenanceTimer)
  maintenanceTimer = undefined
}
