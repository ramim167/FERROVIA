export async function createBooking(connection, booking) {
  const result = await connection.query(
    `INSERT INTO BOOKINGS
      (PNR_NUMBER, USER_ID, TRIP_ID, SOURCE_STATION_ID, DESTINATION_STATION_ID,
       CLASS_ID, TOTAL_FARE, BOOKING_STATUS)
     VALUES
      ($1, $2, $3, $4, $5, $6, $7, 'PENDING')
     RETURNING BOOKING_ID`,
    [booking.pnr, booking.userId, booking.tripId, booking.sourceStationId, booking.destinationStationId, booking.classId, booking.totalFare]
  )
  return result.rows[0].BOOKING_ID
}

export async function createPassenger(connection, bookingId, passenger) {
  const result = await connection.query(
    `INSERT INTO PASSENGERS (BOOKING_ID, PASSENGER_NAME, AGE, GENDER)
     VALUES ($1, $2, $3, $4)
     RETURNING PASSENGER_ID`,
    [bookingId, passenger.name, passenger.age, passenger.gender]
  )
  return result.rows[0].PASSENGER_ID
}

export async function createHeldReservation(connection, data) {
  const result = await connection.query(
    `INSERT INTO SEAT_RESERVATIONS
      (BOOKING_ID, PASSENGER_ID, TRIP_SEAT_ID, SOURCE_STATION_ID,
       DESTINATION_STATION_ID, SOURCE_STOP_SEQUENCE, DESTINATION_STOP_SEQUENCE,
       RESERVATION_STATUS, HELD_AT, HOLD_EXPIRES_AT)
     VALUES
      ($1, $2, $3, $4, $5, $6, $7, 'HELD', CURRENT_TIMESTAMP,
       CURRENT_TIMESTAMP + ($8 * interval '1 minute'))
     RETURNING RESERVATION_ID`,
    [data.bookingId, data.passengerId, data.tripSeatId, data.sourceStationId, data.destinationStationId, data.sourceSeq, data.destSeq, data.holdMinutes]
  )
  return result.rows[0].RESERVATION_ID
}

export async function createTicket(connection, { passengerId, reservationId, fare }) {
  const result = await connection.query(
    `INSERT INTO TICKETS (PASSENGER_ID, RESERVATION_ID, TICKET_FARE, TICKET_STATUS)
     VALUES ($1, $2, $3, 'CONFIRMED')
     RETURNING TICKET_ID`,
    [passengerId, reservationId, fare]
  )
  return result.rows[0].TICKET_ID
}

export async function getBookingForUpdate(connection, pnr, userId) {
  const result = await connection.query(
    `SELECT * FROM BOOKINGS
      WHERE PNR_NUMBER = $1 AND USER_ID = $2
      FOR UPDATE`,
    [pnr, userId]
  )
  return result.rows[0] || null
}

export async function getHeldReservations(connection, bookingId) {
  const result = await connection.query(
    `SELECT SR.RESERVATION_ID, SR.PASSENGER_ID, SR.HOLD_EXPIRES_AT
       FROM SEAT_RESERVATIONS SR
      WHERE SR.BOOKING_ID = $1
        AND SR.RESERVATION_STATUS = 'HELD'
      ORDER BY SR.RESERVATION_ID
      FOR UPDATE`,
    [bookingId]
  )
  return result.rows
}

export async function confirmBookingAndReservations(connection, bookingId) {
  await connection.query(
    `UPDATE BOOKINGS SET BOOKING_STATUS = 'CONFIRMED' WHERE BOOKING_ID = $1`,
    [bookingId]
  )
  await connection.query(
    `UPDATE SEAT_RESERVATIONS SET RESERVATION_STATUS = 'BOOKED', BOOKED_AT = CURRENT_TIMESTAMP
      WHERE BOOKING_ID = $1 AND RESERVATION_STATUS = 'HELD'`,
    [bookingId]
  )
}

export async function createPayment(connection, { bookingId, transactionId, amount, method, status }) {
  const result = await connection.query(
    `INSERT INTO PAYMENTS (BOOKING_ID, TRANSACTION_ID, PAYMENT_AMOUNT, PAYMENT_METHOD, PAYMENT_STATUS)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING PAYMENT_ID`,
    [bookingId, transactionId, amount, method, status]
  )
  return result.rows[0].PAYMENT_ID
}

export async function getBookingByPnr(connection, pnr, userId = null) {
  const result = await connection.query(
    `SELECT B.BOOKING_ID, B.PNR_NUMBER, B.USER_ID, B.TRIP_ID, B.BOOKING_TIME,
            B.TOTAL_FARE, B.BOOKING_STATUS,
            TR.TRAIN_NAME, TR.TRAIN_CODE, R.DIRECTION,
            SRC.STATION_NAME AS SOURCE_STATION, DST.STATION_NAME AS DESTINATION_STATION,
            T.SCHEDULED_DEPARTURE, T.SCHEDULED_ARRIVAL, CT.CLASS_NAME
       FROM BOOKINGS B
       JOIN TRIPS T ON T.TRIP_ID = B.TRIP_ID
       JOIN TRAINS TR ON TR.TRAIN_ID = T.TRAIN_ID
       JOIN ROUTES R ON R.ROUTE_ID = T.ROUTE_ID
       JOIN STATIONS SRC ON SRC.STATION_ID = B.SOURCE_STATION_ID
       JOIN STATIONS DST ON DST.STATION_ID = B.DESTINATION_STATION_ID
       JOIN CLASS_TYPES CT ON CT.CLASS_ID = B.CLASS_ID
      WHERE B.PNR_NUMBER = $1
        AND ($2::int IS NULL OR B.USER_ID = $2::int)`,
    [pnr, userId]
  )
  const booking = result.rows[0]
  if (!booking) return null

  const passengers = await connection.query(
    `SELECT P.PASSENGER_ID, P.PASSENGER_NAME, P.AGE, P.GENDER,
            C.COACH_CODE, S.SEAT_NUMBER, SR.RESERVATION_ID, SR.RESERVATION_STATUS,
            SR.HOLD_EXPIRES_AT, TK.TICKET_ID, TK.TICKET_STATUS, TK.TICKET_FARE,
            RF.REFUND_ID, RF.REFUND_AMOUNT, RF.REFUND_STATUS
       FROM PASSENGERS P
       LEFT JOIN SEAT_RESERVATIONS SR ON SR.PASSENGER_ID = P.PASSENGER_ID
       LEFT JOIN TRIP_SEATS TS ON TS.TRIP_SEAT_ID = SR.TRIP_SEAT_ID
       LEFT JOIN SEATS S ON S.SEAT_ID = TS.SEAT_ID
       LEFT JOIN COACHES C ON C.COACH_ID = S.COACH_ID
       LEFT JOIN TICKETS TK ON TK.PASSENGER_ID = P.PASSENGER_ID
       LEFT JOIN REFUNDS RF ON RF.TICKET_ID = TK.TICKET_ID
      WHERE P.BOOKING_ID = $1
      ORDER BY P.PASSENGER_ID`,
    [booking.BOOKING_ID]
  )

  booking.PASSENGERS = passengers.rows
  return booking
}

export async function listUserBookings(connection, userId) {
  const result = await connection.query(
    `SELECT B.PNR_NUMBER, B.BOOKING_TIME, B.TOTAL_FARE, B.BOOKING_STATUS,
            TR.TRAIN_NAME, R.DIRECTION,
            SRC.STATION_NAME AS SOURCE_STATION, DST.STATION_NAME AS DESTINATION_STATION,
            T.SCHEDULED_DEPARTURE, T.SCHEDULED_ARRIVAL
       FROM BOOKINGS B
       JOIN TRIPS T ON T.TRIP_ID = B.TRIP_ID
       JOIN TRAINS TR ON TR.TRAIN_ID = T.TRAIN_ID
       JOIN ROUTES R ON R.ROUTE_ID = T.ROUTE_ID
       JOIN STATIONS SRC ON SRC.STATION_ID = B.SOURCE_STATION_ID
       JOIN STATIONS DST ON DST.STATION_ID = B.DESTINATION_STATION_ID
      WHERE B.USER_ID = $1
      ORDER BY T.SCHEDULED_DEPARTURE DESC`,
    [userId]
  )
  return result.rows
}

export async function cancelBooking(connection, bookingId) {
  await connection.query(
    `UPDATE BOOKINGS SET BOOKING_STATUS = 'CANCELLED'
      WHERE BOOKING_ID = $1 AND BOOKING_STATUS IN ('PENDING','CONFIRMED')`,
    [bookingId]
  )
  await connection.query(
    `UPDATE SEAT_RESERVATIONS SET RESERVATION_STATUS = 'CANCELLED'
      WHERE BOOKING_ID = $1 AND RESERVATION_STATUS IN ('HELD','BOOKED')`,
    [bookingId]
  )
  await connection.query(
    `UPDATE TICKETS SET TICKET_STATUS = 'CANCELLED'
      WHERE PASSENGER_ID IN (SELECT PASSENGER_ID FROM PASSENGERS WHERE BOOKING_ID = $1)
        AND TICKET_STATUS = 'CONFIRMED'`,
    [bookingId]
  )
}

export async function createNotification(connection, { userId, bookingId = null, tripId = null, title, message }) {
  await connection.query(
    `INSERT INTO NOTIFICATIONS (USER_ID, BOOKING_ID, TRIP_ID, TITLE, MESSAGE)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, bookingId, tripId, title, message]
  )
}

export async function createRefundRequests(connection, bookingId) {
  const result = await connection.query(
    `SELECT P.PAYMENT_ID, P.PAYMENT_AMOUNT, TK.TICKET_ID
       FROM PAYMENTS P
       JOIN PASSENGERS PS ON PS.BOOKING_ID = P.BOOKING_ID
       JOIN TICKETS TK ON TK.PASSENGER_ID = PS.PASSENGER_ID
       LEFT JOIN REFUNDS R ON R.TICKET_ID = TK.TICKET_ID
      WHERE P.BOOKING_ID = $1
        AND P.PAYMENT_STATUS = 'SUCCESSFUL'
        AND TK.TICKET_STATUS = 'CONFIRMED'
        AND R.REFUND_ID IS NULL`,
    [bookingId]
  )

  if (!result.rows.length) return
  const amount = Math.round((Number(result.rows[0].PAYMENT_AMOUNT) / result.rows.length) * 100) / 100

  for (const row of result.rows) {
    await connection.query(
      `INSERT INTO REFUNDS (PAYMENT_ID, TICKET_ID, REFUND_AMOUNT, REFUND_STATUS)
       VALUES ($1, $2, $3, 'REQUESTED')`,
      [row.PAYMENT_ID, row.TICKET_ID, amount]
    )
  }
}
