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
            'cancel_booking_workflow',
            'validate_no_overlapping_reservation'
          )`
    )
    const routineKinds = new Map(routines.rows.map(row => [row.proname, row.prokind]))
    assert.equal(routineKinds.get('calculate_ticket_fare'), 'f')
    assert.equal(routineKinds.get('cancel_booking_workflow'), 'p')
    assert.equal(routineKinds.get('validate_no_overlapping_reservation'), 'f')

    const trigger = await connection.query(
      `SELECT 1
         FROM PG_TRIGGER
        WHERE TGNAME = 'trg_no_overlapping_reservation'
          AND NOT TGISINTERNAL`
    )
    assert.equal(trigger.rowCount, 1)

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

    const suffix = `${Date.now()}-${crypto.randomBytes(3).toString('hex')}`
    const userResult = await connection.query(
      `INSERT INTO USERS
        (FULL_NAME, EMAIL, PASSWORD_HASH, ROLE, ACCOUNT_STATUS)
       VALUES ($1, $2, $3, 'PASSENGER', 'ACTIVE')
       RETURNING USER_ID`,
      ['Postgres Regression User', `postgres-regression-${suffix}@ferrovia.test`, 'test-only-hash']
    )
    const userId = userResult.rows[0].user_id

    const bookingResult = await connection.query(
      `INSERT INTO BOOKINGS
        (PNR_NUMBER, USER_ID, TRIP_ID, SOURCE_STATION_ID, DESTINATION_STATION_ID,
         CLASS_ID, TOTAL_FARE, BOOKING_STATUS)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'CONFIRMED')
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
    const bookingId = bookingResult.rows[0].booking_id

    const passengerResult = await connection.query(
      `INSERT INTO PASSENGERS (BOOKING_ID, PASSENGER_NAME, AGE, GENDER)
       VALUES ($1, 'Postgres Regression Passenger', 30, 'OTHER')
       RETURNING PASSENGER_ID`,
      [bookingId]
    )
    const passengerId = passengerResult.rows[0].passenger_id

    const reservationResult = await connection.query(
      `INSERT INTO SEAT_RESERVATIONS
        (BOOKING_ID, PASSENGER_ID, TRIP_SEAT_ID, SOURCE_STATION_ID,
         DESTINATION_STATION_ID, SOURCE_STOP_SEQUENCE, DESTINATION_STOP_SEQUENCE,
         RESERVATION_STATUS, BOOKED_AT)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'BOOKED', CURRENT_TIMESTAMP)
       RETURNING RESERVATION_ID`,
      [
        bookingId,
        passengerId,
        fixture.trip_seat_id,
        fixture.source_station_id,
        fixture.destination_station_id,
        fixture.source_stop_sequence,
        fixture.destination_stop_sequence,
      ]
    )
    const reservationId = reservationResult.rows[0].reservation_id

    const paymentResult = await connection.query(
      `INSERT INTO PAYMENTS
        (BOOKING_ID, TRANSACTION_ID, PAYMENT_AMOUNT, PAYMENT_METHOD, PAYMENT_STATUS)
       VALUES ($1, $2, $3, 'CARD', 'SUCCESSFUL')
       RETURNING PAYMENT_ID`,
      [bookingId, `PG-TXN-${suffix}`, fare]
    )
    const paymentId = paymentResult.rows[0].payment_id

    await connection.query(
      `INSERT INTO TICKETS
        (PASSENGER_ID, RESERVATION_ID, TICKET_FARE, TICKET_STATUS)
       VALUES ($1, $2, $3, 'CONFIRMED')`,
      [passengerId, reservationId, fare]
    )

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

    await connection.query('CALL cancel_booking_workflow($1)', [bookingId])

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
    assert.equal(Number(workflowResult.rows[0].refund_amount), fare)
  } finally {
    try {
      await connection.query('ROLLBACK')
    } finally {
      connection.release()
      await pool.end()
    }
  }
})
