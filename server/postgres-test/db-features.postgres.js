import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import test from 'node:test'
import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

test('PostgreSQL function, trigger and procedure work together', { timeout: 30_000 }, async () => {
  assert.ok(
    process.env.PG_CONNECTION_STRING,
    'PG_CONNECTION_STRING is required for the PostgreSQL regression test'
  )

  const pool = new Pool({
    connectionString: process.env.PG_CONNECTION_STRING,
    max: 1,
  })
  const connection = await pool.connect()

  try {
    await connection.query('BEGIN')
    await connection.query("SET LOCAL TIME ZONE 'Asia/Dhaka'")

    const routines = await connection.query(
      `SELECT P.PRONAME, P.PROKIND
         FROM PG_PROC P
         JOIN PG_NAMESPACE N ON N.OID = P.PRONAMESPACE
        WHERE N.NSPNAME = 'public'
          AND P.PRONAME IN (
            'calculate_ticket_fare',
            'get_available_seats_for_segment',
            'calculate_cancellation_refund',
            'get_ticket_details_by_pnr',
            'create_booking_with_seat_hold',
            'expire_stale_seat_holds',
            'generate_scheduled_trips',
            'process_cancellation_request',
            'cancel_booking_workflow',
            'validate_no_overlapping_reservation'
          )`
    )
    const routineKinds = new Map(routines.rows.map(row => [row.proname, row.prokind]))
    assert.equal(routineKinds.get('calculate_ticket_fare'), 'f')
    assert.equal(routineKinds.get('get_available_seats_for_segment'), 'f')
    assert.equal(routineKinds.get('calculate_cancellation_refund'), 'f')
    assert.equal(routineKinds.get('get_ticket_details_by_pnr'), 'f')
    assert.equal(routineKinds.get('create_booking_with_seat_hold'), 'p')
    assert.equal(routineKinds.get('expire_stale_seat_holds'), 'p')
    assert.equal(routineKinds.get('generate_scheduled_trips'), 'p')
    assert.equal(routineKinds.get('process_cancellation_request'), 'p')
    assert.equal(routineKinds.get('cancel_booking_workflow'), 'p')
    assert.equal(routineKinds.get('validate_no_overlapping_reservation'), 'f')

    const triggers = await connection.query(
      `SELECT TGNAME
         FROM PG_TRIGGER
        WHERE TGNAME = ANY($1::TEXT[])
          AND NOT TGISINTERNAL`,
      [[
        'trg_no_overlapping_reservation',
        'trg_users_updated_at',
        'trg_trainsets_status_updated_at',
        'trg_payment_issue_tickets',
        'trg_booking_status_notification',
        'trg_trip_status_notification',
        'trg_sync_trip_stop_operations',
      ]]
    )
    assert.equal(triggers.rowCount, 7)

    const fixtureResult = await connection.query(
      `SELECT
          T.TRIP_ID,
          T.TRAIN_ID,
          SRC.STATION_ID AS SOURCE_STATION_ID,
          SRC.STOP_SEQUENCE AS SOURCE_STOP_SEQUENCE,
          DST.STATION_ID AS DESTINATION_STATION_ID,
          DST.STOP_SEQUENCE AS DESTINATION_STOP_SEQUENCE,
          C.CLASS_ID,
          TS.TRIP_SEAT_ID
       FROM TRIPS T
       JOIN LATERAL (
         SELECT STATION_ID, STOP_SEQUENCE
           FROM TRIP_STOPS
          WHERE TRIP_ID = T.TRIP_ID
          ORDER BY STOP_SEQUENCE
          LIMIT 1
       ) SRC ON TRUE
       JOIN LATERAL (
         SELECT STATION_ID, STOP_SEQUENCE
           FROM TRIP_STOPS
          WHERE TRIP_ID = T.TRIP_ID
          ORDER BY STOP_SEQUENCE DESC
          LIMIT 1
       ) DST ON TRUE
       JOIN TRIP_SEATS TS ON TS.TRIP_ID = T.TRIP_ID
       JOIN SEATS S ON S.SEAT_ID = TS.SEAT_ID
       JOIN COACHES C ON C.COACH_ID = S.COACH_ID
       JOIN FARE_RULES FR
         ON FR.TRAIN_ID = T.TRAIN_ID
        AND FR.CLASS_ID = C.CLASS_ID
      WHERE SRC.STOP_SEQUENCE < DST.STOP_SEQUENCE
        AND TS.SEAT_STATUS = 'AVAILABLE'
        AND NOT EXISTS (
          SELECT 1
            FROM SEAT_RESERVATIONS SR
           WHERE SR.TRIP_SEAT_ID = TS.TRIP_SEAT_ID
             AND SR.RESERVATION_STATUS IN ('HELD','BOOKED')
             AND (SR.RESERVATION_STATUS <> 'HELD'
                  OR SR.HOLD_EXPIRES_AT > CURRENT_TIMESTAMP)
             AND SRC.STOP_SEQUENCE < SR.DESTINATION_STOP_SEQUENCE
             AND DST.STOP_SEQUENCE > SR.SOURCE_STOP_SEQUENCE
        )
      ORDER BY T.SCHEDULED_DEPARTURE DESC, TS.TRIP_SEAT_ID
      LIMIT 1`
    )
    assert.ok(fixtureResult.rows[0], 'No available trip seat exists for the regression fixture')
    const fixture = fixtureResult.rows[0]

    const fareResult = await connection.query(
      `SELECT calculate_ticket_fare($1, $2, $3, $4) AS FARE`,
      [
        fixture.trip_id,
        fixture.source_station_id,
        fixture.destination_station_id,
        fixture.class_id,
      ]
    )
    const fare = Number(fareResult.rows[0].fare)
    assert.ok(Number.isFinite(fare) && fare > 0)

    const availableSeats = await connection.query(
      `SELECT TRIP_SEAT_ID
         FROM get_available_seats_for_segment($1, $2, $3, $4)
        WHERE TRIP_SEAT_ID = $5`,
      [
        fixture.trip_id,
        fixture.source_station_id,
        fixture.destination_station_id,
        fixture.class_id,
        fixture.trip_seat_id,
      ]
    )
    assert.equal(availableSeats.rowCount, 1)

    const suffix = `${Date.now()}-${crypto.randomBytes(3).toString('hex')}`
    const userResult = await connection.query(
      `INSERT INTO USERS
        (FULL_NAME, EMAIL, PASSWORD_HASH, ROLE, ACCOUNT_STATUS)
       VALUES ($1, $2, $3, 'PASSENGER', 'ACTIVE')
       RETURNING USER_ID`,
      ['Postgres Regression User', `postgres-regression-${suffix}@ferrovia.test`, 'test-only-hash']
    )
    const userId = userResult.rows[0].user_id

    const pnr = `PG${crypto.randomBytes(5).toString('hex').toUpperCase()}`
    await connection.query(
      `CALL create_booking_with_seat_hold($1, $2, $3, $4, $5, $6, $7::jsonb, $8)`,
      [
        userId,
        pnr,
        fixture.trip_id,
        fixture.source_station_id,
        fixture.destination_station_id,
        fixture.class_id,
        JSON.stringify([{
          name: 'Postgres Regression Passenger',
          age: 30,
          gender: 'OTHER',
          tripSeatId: fixture.trip_seat_id,
        }]),
        10,
      ]
    )
    const bookingResult = await connection.query(
      `SELECT B.BOOKING_ID, P.PASSENGER_ID, SR.RESERVATION_ID
         FROM BOOKINGS B
         JOIN PASSENGERS P ON P.BOOKING_ID = B.BOOKING_ID
         JOIN SEAT_RESERVATIONS SR ON SR.PASSENGER_ID = P.PASSENGER_ID
        WHERE B.PNR_NUMBER = $1`,
      [pnr]
    )
    const { booking_id: bookingId, passenger_id: passengerId,
      reservation_id: reservationId } = bookingResult.rows[0]

    const heldSeat = await connection.query(
      `SELECT IS_AVAILABLE
         FROM get_available_seats_for_segment($1, $2, $3, $4)
        WHERE TRIP_SEAT_ID = $5`,
      [
        fixture.trip_id,
        fixture.source_station_id,
        fixture.destination_station_id,
        fixture.class_id,
        fixture.trip_seat_id,
      ]
    )
    assert.equal(heldSeat.rowCount, 1, 'Held seat disappeared from the seat map')
    assert.equal(Number(heldSeat.rows[0].is_available), 0, 'Held seat must be non-selectable')

    const paymentResult = await connection.query(
      `INSERT INTO PAYMENTS
        (BOOKING_ID, TRANSACTION_ID, PAYMENT_AMOUNT, PAYMENT_METHOD, PAYMENT_STATUS)
       VALUES ($1, $2, $3, 'CARD', 'SUCCESSFUL')
       RETURNING PAYMENT_ID`,
      [bookingId, `PG-TXN-${suffix}`, fare]
    )
    const paymentId = paymentResult.rows[0].payment_id

    const issuedTicket = await connection.query(
      `SELECT TICKET_ID FROM TICKETS WHERE PASSENGER_ID = $1 AND RESERVATION_ID = $2`,
      [passengerId, reservationId]
    )
    assert.equal(issuedTicket.rowCount, 1, 'Successful payment did not issue a ticket')

    const ticketDetails = await connection.query(
      `SELECT * FROM get_ticket_details_by_pnr($1)`,
      [pnr]
    )
    assert.equal(ticketDetails.rowCount, 1)
    assert.equal(ticketDetails.rows[0].pnr_number, pnr)

    const secondBookingResult = await connection.query(
      `INSERT INTO BOOKINGS
        (PNR_NUMBER, USER_ID, TRIP_ID, SOURCE_STATION_ID, DESTINATION_STATION_ID,
         CLASS_ID, TOTAL_FARE, BOOKING_STATUS)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING')
       RETURNING BOOKING_ID`,
      [
        `PG${crypto.randomBytes(5).toString('hex').toUpperCase()}`,
        userId,
        fixture.trip_id,
        fixture.source_station_id,
        fixture.destination_station_id,
        fixture.class_id,
        fare,
      ]
    )
    const secondPassengerResult = await connection.query(
      `INSERT INTO PASSENGERS (BOOKING_ID, PASSENGER_NAME, AGE, GENDER)
       VALUES ($1, 'Overlap Probe Passenger', 31, 'OTHER')
       RETURNING PASSENGER_ID`,
      [secondBookingResult.rows[0].booking_id]
    )
    const staleHoldSeat = await connection.query(
      `SELECT TS.TRIP_SEAT_ID
         FROM TRIP_SEATS TS
         JOIN SEATS S ON S.SEAT_ID = TS.SEAT_ID
         JOIN COACHES C ON C.COACH_ID = S.COACH_ID
        WHERE TS.TRIP_ID = $1
          AND C.CLASS_ID = $2
          AND TS.TRIP_SEAT_ID <> $3
          AND TS.SEAT_STATUS = 'AVAILABLE'
          AND NOT EXISTS (
            SELECT 1 FROM SEAT_RESERVATIONS SR
            WHERE SR.TRIP_SEAT_ID = TS.TRIP_SEAT_ID
              AND SR.RESERVATION_STATUS IN ('HELD','BOOKED')
              AND (SR.RESERVATION_STATUS <> 'HELD'
                   OR SR.HOLD_EXPIRES_AT > CURRENT_TIMESTAMP)
              AND $4 < SR.DESTINATION_STOP_SEQUENCE
              AND $5 > SR.SOURCE_STOP_SEQUENCE
          )
        ORDER BY TS.TRIP_SEAT_ID
        LIMIT 1`,
      [
        fixture.trip_id,
        fixture.class_id,
        fixture.trip_seat_id,
        fixture.source_stop_sequence,
        fixture.destination_stop_sequence,
      ]
    )
    assert.ok(staleHoldSeat.rows[0], 'No second seat exists for the stale-hold fixture')

    await connection.query('SAVEPOINT overlap_probe')
    let overlapError = null
    try {
      await connection.query(
        `INSERT INTO SEAT_RESERVATIONS
          (BOOKING_ID, PASSENGER_ID, TRIP_SEAT_ID, SOURCE_STATION_ID,
           DESTINATION_STATION_ID, SOURCE_STOP_SEQUENCE, DESTINATION_STOP_SEQUENCE,
           RESERVATION_STATUS, BOOKED_AT)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'BOOKED', CURRENT_TIMESTAMP)`,
        [
          secondBookingResult.rows[0].booking_id,
          secondPassengerResult.rows[0].passenger_id,
          fixture.trip_seat_id,
          fixture.source_station_id,
          fixture.destination_station_id,
          fixture.source_stop_sequence,
          fixture.destination_stop_sequence,
        ]
      )
    } catch (error) {
      overlapError = error
    }
    await connection.query('ROLLBACK TO SAVEPOINT overlap_probe')
    assert.ok(overlapError, 'The overlap trigger accepted a conflicting reservation')
    assert.match(overlapError.message, /overlapping route segment/i)

    await connection.query(
      `INSERT INTO SEAT_RESERVATIONS
        (BOOKING_ID, PASSENGER_ID, TRIP_SEAT_ID, SOURCE_STATION_ID,
         DESTINATION_STATION_ID, SOURCE_STOP_SEQUENCE, DESTINATION_STOP_SEQUENCE,
         RESERVATION_STATUS, HELD_AT, HOLD_EXPIRES_AT)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'HELD',
               CURRENT_TIMESTAMP - INTERVAL '20 minutes',
               CURRENT_TIMESTAMP - INTERVAL '10 minutes')`,
      [
        secondBookingResult.rows[0].booking_id,
        secondPassengerResult.rows[0].passenger_id,
        staleHoldSeat.rows[0].trip_seat_id,
        fixture.source_station_id,
        fixture.destination_station_id,
        fixture.source_stop_sequence,
        fixture.destination_stop_sequence,
      ]
    )
    await connection.query('CALL expire_stale_seat_holds()')
    const expiredBooking = await connection.query(
      `SELECT B.BOOKING_STATUS, SR.RESERVATION_STATUS
         FROM BOOKINGS B
         JOIN SEAT_RESERVATIONS SR ON SR.BOOKING_ID = B.BOOKING_ID
        WHERE B.BOOKING_ID = $1`,
      [secondBookingResult.rows[0].booking_id]
    )
    assert.equal(expiredBooking.rows[0].booking_status, 'CANCELLED')
    assert.equal(expiredBooking.rows[0].reservation_status, 'EXPIRED')

    const operationResult = await connection.query(
      `SELECT T.TRIP_ID, A.TRAINSET_ID, FIRST_STOP.TRIP_STOP_ID AS FIRST_STOP_ID,
              LAST_STOP.TRIP_STOP_ID AS LAST_STOP_ID,
              LAST_STOP.STATION_ID AS DESTINATION_STATION_ID
         FROM TRIPS T
         JOIN ROUTES R ON R.ROUTE_ID = T.ROUTE_ID
         JOIN TRAINSET_ASSIGNMENTS A ON A.TRIP_ID = T.TRIP_ID
           AND A.ASSIGNMENT_STATUS = 'RESERVED'
         JOIN LATERAL (
           SELECT TRIP_STOP_ID FROM TRIP_STOPS
            WHERE TRIP_ID = T.TRIP_ID ORDER BY STOP_SEQUENCE LIMIT 1
         ) FIRST_STOP ON TRUE
         JOIN LATERAL (
           SELECT TRIP_STOP_ID, STATION_ID FROM TRIP_STOPS
            WHERE TRIP_ID = T.TRIP_ID ORDER BY STOP_SEQUENCE DESC LIMIT 1
         ) LAST_STOP ON TRUE
        WHERE R.ROUTE_CODE = 'SUB-UP'
        ORDER BY T.SCHEDULED_DEPARTURE DESC
        LIMIT 1`
    )
    assert.ok(operationResult.rows[0], 'No assigned UP trip exists for the operation trigger fixture')
    const operation = operationResult.rows[0]
    await connection.query(
      `UPDATE TRIP_STOPS
          SET STOP_STATUS = 'DEPARTED',
              ACTUAL_DEPARTURE = SCHEDULED_DEPARTURE + INTERVAL '60 minutes'
        WHERE TRIP_STOP_ID = $1`,
      [operation.first_stop_id]
    )

    const delayedTrip = await connection.query(
      `SELECT TRIP_STATUS, SPARE_TRIGGERED_AT FROM TRIPS WHERE TRIP_ID = $1`,
      [operation.trip_id]
    )
    assert.equal(delayedTrip.rows[0].trip_status, 'DELAYED')
    assert.ok(delayedTrip.rows[0].spare_triggered_at)

    const spareAssignment = await connection.query(
      `SELECT A.ASSIGNMENT_TYPE, A.ASSIGNMENT_STATUS, TS.STATUS
         FROM TRIPS CURRENT_TRIP
         JOIN ROUTES CURRENT_ROUTE ON CURRENT_ROUTE.ROUTE_ID = CURRENT_TRIP.ROUTE_ID
         JOIN TRIPS NEXT_TRIP ON NEXT_TRIP.TRAIN_ID = CURRENT_TRIP.TRAIN_ID
         JOIN ROUTES NEXT_ROUTE ON NEXT_ROUTE.ROUTE_ID = NEXT_TRIP.ROUTE_ID
         JOIN TRAINSET_ASSIGNMENTS A ON A.TRIP_ID = NEXT_TRIP.TRIP_ID
         JOIN TRAINSETS TS ON TS.TRAINSET_ID = A.TRAINSET_ID
        WHERE CURRENT_TRIP.TRIP_ID = $1
          AND NEXT_ROUTE.DIRECTION <> CURRENT_ROUTE.DIRECTION
          AND NEXT_ROUTE.SOURCE_STATION_ID = CURRENT_ROUTE.DESTINATION_STATION_ID
          AND NEXT_TRIP.SCHEDULED_DEPARTURE > CURRENT_TRIP.SCHEDULED_DEPARTURE
        ORDER BY NEXT_TRIP.SCHEDULED_DEPARTURE
        LIMIT 1`,
      [operation.trip_id]
    )
    assert.equal(spareAssignment.rows[0]?.assignment_type, 'SPARE_REPLACEMENT')
    assert.equal(spareAssignment.rows[0]?.assignment_status, 'RESERVED')
    assert.equal(spareAssignment.rows[0]?.status, 'RESERVED')

    await connection.query(
      `UPDATE TRIP_STOPS
          SET STOP_STATUS = 'ARRIVED', ACTUAL_ARRIVAL = SCHEDULED_ARRIVAL
        WHERE TRIP_STOP_ID = $1`,
      [operation.last_stop_id]
    )
    const completedTrip = await connection.query(
      `SELECT T.TRIP_STATUS, A.ASSIGNMENT_STATUS, TS.STATUS, TS.CURRENT_STATION_ID
         FROM TRIPS T
         JOIN TRAINSET_ASSIGNMENTS A ON A.TRIP_ID = T.TRIP_ID
         JOIN TRAINSETS TS ON TS.TRAINSET_ID = A.TRAINSET_ID
        WHERE T.TRIP_ID = $1 AND A.ASSIGNMENT_TYPE = 'NORMAL'`,
      [operation.trip_id]
    )
    assert.equal(completedTrip.rows[0].trip_status, 'COMPLETED')
    assert.equal(completedTrip.rows[0].assignment_status, 'COMPLETED')
    assert.equal(completedTrip.rows[0].status, 'SPARE')
    assert.equal(Number(completedTrip.rows[0].current_station_id), Number(operation.destination_station_id))

    const requestResult = await connection.query(
      `INSERT INTO CANCELLATION_REQUESTS
        (BOOKING_ID, REQUESTED_BY, REQUEST_STATUS, REFUND_PERCENT, REFUND_AMOUNT)
       VALUES ($1, $2, 'REQUESTED', 50, ROUND($3::NUMERIC / 2, 2))
       RETURNING CANCELLATION_REQUEST_ID`,
      [bookingId, userId, fare]
    )
    await connection.query(
      `CALL process_cancellation_request($1, $2, 'APPROVED')`,
      [requestResult.rows[0].cancellation_request_id, userId]
    )

    const workflowResult = await connection.query(
      `SELECT
          B.BOOKING_STATUS,
          SR.RESERVATION_STATUS,
          TK.TICKET_STATUS,
          RF.REFUND_STATUS,
          RF.REFUND_AMOUNT
       FROM BOOKINGS B
       JOIN SEAT_RESERVATIONS SR ON SR.BOOKING_ID = B.BOOKING_ID
       JOIN TICKETS TK ON TK.RESERVATION_ID = SR.RESERVATION_ID
       JOIN REFUNDS RF
         ON RF.TICKET_ID = TK.TICKET_ID
        AND RF.PAYMENT_ID = $2
      WHERE B.BOOKING_ID = $1`,
      [bookingId, paymentId]
    )
    assert.equal(workflowResult.rowCount, 1)
    assert.equal(workflowResult.rows[0].booking_status, 'CANCELLED')
    assert.equal(workflowResult.rows[0].reservation_status, 'CANCELLED')
    assert.equal(workflowResult.rows[0].ticket_status, 'CANCELLED')
    assert.equal(workflowResult.rows[0].refund_status, 'REQUESTED')
    assert.equal(Number(workflowResult.rows[0].refund_amount), Math.round(fare * 50) / 100)
  } finally {
    try {
      await connection.query('ROLLBACK')
    } finally {
      connection.release()
      await pool.end()
    }
  }
})
