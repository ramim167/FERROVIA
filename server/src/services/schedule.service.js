import { getDatabaseMode, withConnection, withTransaction } from '../config/database.js'
import {
  cancelBooking,
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

  return withConnection(async connection => {
    const before = await countUpcomingRows(connection, days)

    await connection.query(
      `
      DO $$
      DECLARE
          v_date DATE;
          v_route RECORD;
          v_stop RECORD;
          v_trip_id INT;
          v_day_code VARCHAR(3);
          v_sched_dep TIMESTAMP;
          v_sched_arr TIMESTAMP;
          v_stop_arr TIMESTAMP;
          v_stop_dep TIMESTAMP;
          v_window_start TIMESTAMP;
          v_window_end TIMESTAMP;
      BEGIN
          v_window_start :=
              CASE
                  WHEN CURRENT_TIME < TIME '${String(OPERATING_DAY_START_HOUR).padStart(2, '0')}:00'
                  THEN CURRENT_DATE - INTERVAL '1 day' + INTERVAL '${OPERATING_DAY_START_HOUR} hours'
                  ELSE CURRENT_DATE + INTERVAL '${OPERATING_DAY_START_HOUR} hours'
              END;
          v_window_end := v_window_start + INTERVAL '${days} days';

          FOR i IN 0..${days} LOOP
              v_date := CURRENT_DATE + i;
              v_day_code := UPPER(TRIM(TO_CHAR(v_date, 'Dy')));

              FOR v_route IN (
                  SELECT r.ROUTE_ID, r.TRAIN_ID, rd.DEPARTURE_MINUTE
                  FROM ROUTES r
                  JOIN TRAIN_RUNNING_DAYS rd ON r.ROUTE_ID = rd.ROUTE_ID
                  WHERE r.IS_ACTIVE = 1
                    AND rd.DAY_CODE = v_day_code
              ) LOOP
                  v_sched_dep := v_date + (v_route.DEPARTURE_MINUTE || ' minutes')::INTERVAL;

                  IF v_sched_dep < v_window_start OR v_sched_dep >= v_window_end THEN
                      CONTINUE;
                  END IF;

                  SELECT v_sched_dep + (MAX(COALESCE(ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN)) || ' minutes')::INTERVAL
                  INTO v_sched_arr
                  FROM ROUTE_STOPS
                  WHERE ROUTE_ID = v_route.ROUTE_ID;

                  v_trip_id := NULL;

                  INSERT INTO TRIPS
                      (TRAIN_ID, ROUTE_ID, JOURNEY_DATE, SCHEDULED_DEPARTURE, SCHEDULED_ARRIVAL, TRIP_STATUS)
                  VALUES
                      (v_route.TRAIN_ID, v_route.ROUTE_ID, DATE(v_sched_dep), v_sched_dep, v_sched_arr, 'SCHEDULED')
                  ON CONFLICT ON CONSTRAINT UQ_TRIP_ROUTE_DEPARTURE DO NOTHING
                  RETURNING TRIP_ID INTO v_trip_id;

                  IF v_trip_id IS NULL THEN
                      SELECT TRIP_ID
                      INTO v_trip_id
                      FROM TRIPS
                      WHERE ROUTE_ID = v_route.ROUTE_ID
                        AND SCHEDULED_DEPARTURE = v_sched_dep;
                  END IF;

                  FOR v_stop IN (
                      SELECT ROUTE_STOP_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN
                      FROM ROUTE_STOPS
                      WHERE ROUTE_ID = v_route.ROUTE_ID
                      ORDER BY STOP_SEQUENCE
                  ) LOOP
                      IF v_stop.ARRIVAL_OFFSET_MIN IS NOT NULL THEN
                          v_stop_arr := v_sched_dep + (v_stop.ARRIVAL_OFFSET_MIN || ' minutes')::INTERVAL;
                      ELSE
                          v_stop_arr := NULL;
                      END IF;

                      IF v_stop.DEPARTURE_OFFSET_MIN IS NOT NULL THEN
                          v_stop_dep := v_sched_dep + (v_stop.DEPARTURE_OFFSET_MIN || ' minutes')::INTERVAL;
                      ELSE
                          v_stop_dep := NULL;
                      END IF;

                      INSERT INTO TRIP_STOPS
                          (TRIP_ID, ROUTE_STOP_ID, STATION_ID, STOP_SEQUENCE,
                           SCHEDULED_ARRIVAL, SCHEDULED_DEPARTURE, STOP_STATUS)
                      VALUES
                          (v_trip_id, v_stop.ROUTE_STOP_ID, v_stop.STATION_ID, v_stop.STOP_SEQUENCE,
                           v_stop_arr, v_stop_dep, 'UPCOMING')
                      ON CONFLICT (TRIP_ID, STOP_SEQUENCE) DO NOTHING;
                  END LOOP;

                  INSERT INTO TRIP_SEATS (TRIP_ID, SEAT_ID, SEAT_STATUS)
                  SELECT v_trip_id, s.SEAT_ID, 'AVAILABLE'
                  FROM SEATS s
                  JOIN COACHES c ON c.COACH_ID = s.COACH_ID
                  WHERE c.TRAIN_ID = v_route.TRAIN_ID
                    AND s.IS_ACTIVE = 1
                  ON CONFLICT (TRIP_ID, SEAT_ID) DO NOTHING;
              END LOOP;
          END LOOP;
      END $$;
      `
    )

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
    if (booking.BOOKING_STATUS === 'CONFIRMED') {
      await createRefundRequests(connection, booking.BOOKING_ID)
    }
    const refundsAfter = await refundCountForBooking(connection, booking.BOOKING_ID)
    refundCount += refundsAfter - refundsBefore

    await cancelBooking(connection, booking.BOOKING_ID)
    bookingCount += 1

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
    const generation = await ensureUpcomingTrips()
    return { cancellations, generation }
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
