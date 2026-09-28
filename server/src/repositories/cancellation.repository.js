export async function getCancellationTiming(connection, bookingId) {
  const result = await connection.query(
    `SELECT
       EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - B.BOOKING_TIME)) / 3600 AS HOURS_SINCE_BOOKING,
       EXTRACT(EPOCH FROM (T.SCHEDULED_DEPARTURE - CURRENT_TIMESTAMP)) / 3600 AS HOURS_UNTIL_DEPARTURE
     FROM BOOKINGS B
     JOIN TRIPS T ON T.TRIP_ID = B.TRIP_ID
     WHERE B.BOOKING_ID = $1`,
    [bookingId]
  )
  return result.rows[0] || null
}

export async function hasPendingCancellationRequest(connection, bookingId) {
  const result = await connection.query(
    `SELECT 1
       FROM CANCELLATION_REQUESTS
      WHERE BOOKING_ID = $1
        AND REQUEST_STATUS = 'REQUESTED'
      LIMIT 1`,
    [bookingId]
  )
  return result.rows.length > 0
}

export async function createCancellationRequest(connection, { bookingId, userId, refundPercent }) {
  const tickets = await connection.query(
    `SELECT TK.TICKET_FARE
       FROM PASSENGERS P
       JOIN TICKETS TK ON TK.PASSENGER_ID = P.PASSENGER_ID
      WHERE P.BOOKING_ID = $1
        AND TK.TICKET_STATUS = 'CONFIRMED'`,
    [bookingId]
  )
  if (!tickets.rows.length) return null

  const refundAmount = tickets.rows.reduce(
    (total, ticket) => total + Math.round(Number(ticket.TICKET_FARE) * refundPercent) / 100,
    0
  )

  const result = await connection.query(
    `INSERT INTO CANCELLATION_REQUESTS
      (BOOKING_ID, REQUESTED_BY, REQUEST_STATUS, REFUND_PERCENT, REFUND_AMOUNT)
    VALUES ($1, $2, 'REQUESTED', $3, $4)
     RETURNING CANCELLATION_REQUEST_ID, REFUND_PERCENT, REFUND_AMOUNT, REQUESTED_AT`,
      [bookingId, userId, refundPercent, Math.round(refundAmount * 100) / 100]
  )
  return result.rows[0] || null
}

export async function listPendingCancellationRequests(connection) {
  const result = await connection.query(
    `SELECT CR.CANCELLATION_REQUEST_ID, CR.BOOKING_ID, CR.REQUESTED_BY,
            CR.REFUND_PERCENT, CR.REFUND_AMOUNT, CR.REQUESTED_AT,
            B.PNR_NUMBER, B.BOOKING_TIME, B.TOTAL_FARE,
            U.FULL_NAME AS PASSENGER_NAME, U.EMAIL AS PASSENGER_EMAIL,
            T.SCHEDULED_DEPARTURE, TR.TRAIN_NAME, TR.TRAIN_CODE,
            SRC.STATION_NAME AS SOURCE_STATION, DST.STATION_NAME AS DESTINATION_STATION
       FROM CANCELLATION_REQUESTS CR
       JOIN BOOKINGS B ON B.BOOKING_ID = CR.BOOKING_ID
       JOIN USERS U ON U.USER_ID = CR.REQUESTED_BY
       JOIN TRIPS T ON T.TRIP_ID = B.TRIP_ID
       JOIN TRAINS TR ON TR.TRAIN_ID = T.TRAIN_ID
       JOIN STATIONS SRC ON SRC.STATION_ID = B.SOURCE_STATION_ID
       JOIN STATIONS DST ON DST.STATION_ID = B.DESTINATION_STATION_ID
      WHERE CR.REQUEST_STATUS = 'REQUESTED'
      ORDER BY CR.REQUESTED_AT, CR.CANCELLATION_REQUEST_ID`
  )
  return result.rows
}

export async function getCancellationRequestForUpdate(connection, requestId) {
  const result = await connection.query(
    `SELECT *
       FROM CANCELLATION_REQUESTS
      WHERE CANCELLATION_REQUEST_ID = $1
      FOR UPDATE`,
    [requestId]
  )
  return result.rows[0] || null
}

export async function getCancellationBookingForUpdate(connection, bookingId) {
  const result = await connection.query(
    `SELECT BOOKING_ID, USER_ID, TRIP_ID, PNR_NUMBER, BOOKING_STATUS
       FROM BOOKINGS
      WHERE BOOKING_ID = $1
      FOR UPDATE`,
    [bookingId]
  )
  return result.rows[0] || null
}

export async function createApprovedRefunds(connection, requestId) {
  const result = await connection.query(
    `SELECT P.PAYMENT_ID, TK.TICKET_ID, TK.TICKET_FARE, CR.REFUND_PERCENT
       FROM CANCELLATION_REQUESTS CR
       JOIN BOOKINGS B ON B.BOOKING_ID = CR.BOOKING_ID
       JOIN PAYMENTS P ON P.BOOKING_ID = B.BOOKING_ID
                     AND P.PAYMENT_STATUS = 'SUCCESSFUL'
       JOIN PASSENGERS PS ON PS.BOOKING_ID = B.BOOKING_ID
       JOIN TICKETS TK ON TK.PASSENGER_ID = PS.PASSENGER_ID
      WHERE CR.CANCELLATION_REQUEST_ID = $1
        AND CR.REFUND_PERCENT > 0
        AND TK.TICKET_STATUS = 'CONFIRMED'`,
    [requestId]
  )

  for (const row of result.rows) {
    const amount = Math.round(Number(row.TICKET_FARE) * Number(row.REFUND_PERCENT)) / 100
    if (amount <= 0) continue

    await connection.query(
      `INSERT INTO REFUNDS (PAYMENT_ID, TICKET_ID, REFUND_AMOUNT, REFUND_STATUS)
       VALUES ($1, $2, $3, 'PROCESSING')`,
      [row.PAYMENT_ID, row.TICKET_ID, amount]
    )
  }
}

export async function decideCancellationRequest(connection, { requestId, adminUserId, status }) {
  const result = await connection.query(
    `UPDATE CANCELLATION_REQUESTS
        SET REQUEST_STATUS = $3,
            DECIDED_BY = $2,
            DECIDED_AT = CURRENT_TIMESTAMP
      WHERE CANCELLATION_REQUEST_ID = $1
        AND REQUEST_STATUS = 'REQUESTED'
      RETURNING CANCELLATION_REQUEST_ID, BOOKING_ID, REQUESTED_BY,
                REFUND_PERCENT, REFUND_AMOUNT, REQUEST_STATUS`,
    [requestId, adminUserId, status]
  )
  return result.rows[0] || null
}