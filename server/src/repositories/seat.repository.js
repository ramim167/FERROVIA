export async function getTripSegment(connection, tripId, sourceStationId, destinationStationId) {
  const result = await connection.query(
    `SELECT SRC.STOP_SEQUENCE AS SOURCE_SEQ,
            DST.STOP_SEQUENCE AS DEST_SEQ,
            RSRC.DISTANCE_FROM_SOURCE_KM AS SOURCE_DISTANCE_KM,
            RDST.DISTANCE_FROM_SOURCE_KM AS DEST_DISTANCE_KM,
            T.TRAIN_ID,
            T.ROUTE_ID
       FROM TRIP_STOPS SRC
       JOIN TRIP_STOPS DST ON DST.TRIP_ID = SRC.TRIP_ID
       JOIN ROUTE_STOPS RSRC ON RSRC.ROUTE_STOP_ID = SRC.ROUTE_STOP_ID
       JOIN ROUTE_STOPS RDST ON RDST.ROUTE_STOP_ID = DST.ROUTE_STOP_ID
       JOIN TRIPS T ON T.TRIP_ID = SRC.TRIP_ID
      WHERE SRC.TRIP_ID = $1
        AND SRC.STATION_ID = $2
        AND DST.STATION_ID = $3
        AND SRC.STOP_SEQUENCE < DST.STOP_SEQUENCE`,
    [tripId, sourceStationId, destinationStationId]
  )
  return result.rows[0] || null
}

export async function getFareRule(connection, trainId, classId) {
  const result = await connection.query(
    `SELECT RATE_PER_KM, BASE_FARE
       FROM FARE_RULES
      WHERE TRAIN_ID = $1 AND CLASS_ID = $2`,
    [trainId, classId]
  )
  return result.rows[0] || null
}

export async function listAvailableSeats(connection, { tripId, sourceStationId, destinationStationId, classId }) {
  const segment = await getTripSegment(connection, tripId, sourceStationId, destinationStationId)
  if (!segment) return { segment: null, seats: [] }

  const result = await connection.query(
    `SELECT TS.TRIP_SEAT_ID, S.SEAT_ID, S.SEAT_NUMBER, S.SEAT_TYPE,
            C.COACH_ID, C.COACH_CODE, CT.CLASS_ID, CT.CLASS_NAME, CT.CLASS_CODE,
            CASE WHEN COUNT(SR.RESERVATION_ID) > 0 THEN 0 ELSE 1 END AS IS_AVAILABLE
       FROM TRIP_SEATS TS
       JOIN SEATS S ON S.SEAT_ID = TS.SEAT_ID
       JOIN COACHES C ON C.COACH_ID = S.COACH_ID
       JOIN CLASS_TYPES CT ON CT.CLASS_ID = C.CLASS_ID
       LEFT JOIN SEAT_RESERVATIONS SR
         ON SR.TRIP_SEAT_ID = TS.TRIP_SEAT_ID
        AND SR.RESERVATION_STATUS IN ('BOOKED','HELD')
        AND (SR.RESERVATION_STATUS <> 'HELD' OR SR.HOLD_EXPIRES_AT > CURRENT_TIMESTAMP)
        AND $1 < SR.DESTINATION_STOP_SEQUENCE
        AND $2 > SR.SOURCE_STOP_SEQUENCE
      WHERE TS.TRIP_ID = $3
        AND TS.SEAT_STATUS = 'AVAILABLE'
        AND S.IS_ACTIVE = 1
        AND ($4::int IS NULL OR CT.CLASS_ID = $4::int)
      GROUP BY TS.TRIP_SEAT_ID, S.SEAT_ID, S.SEAT_NUMBER, S.SEAT_TYPE,
               C.COACH_ID, C.COACH_CODE, C.COACH_ORDER,
               CT.CLASS_ID, CT.CLASS_NAME, CT.CLASS_CODE
      ORDER BY C.COACH_ORDER, S.SEAT_NUMBER`,
    [segment.SOURCE_SEQ, segment.DEST_SEQ, tripId, classId || null]
  )
  return { segment, seats: result.rows }
}

export async function lockTripSeat(connection, tripSeatId) {
  const result = await connection.query(
    `SELECT TS.TRIP_SEAT_ID, TS.TRIP_ID, TS.SEAT_ID, TS.SEAT_STATUS,
            C.CLASS_ID, C.COACH_ID, C.COACH_CODE, S.SEAT_NUMBER
       FROM TRIP_SEATS TS
       JOIN SEATS S ON S.SEAT_ID = TS.SEAT_ID
       JOIN COACHES C ON C.COACH_ID = S.COACH_ID
      WHERE TS.TRIP_SEAT_ID = $1
      FOR UPDATE`,
    [tripSeatId]
  )
  return result.rows[0] || null
}

export async function hasOverlap(connection, { tripSeatId, sourceSeq, destSeq }) {
  const result = await connection.query(
    `SELECT COUNT(*) AS CNT
       FROM SEAT_RESERVATIONS
      WHERE TRIP_SEAT_ID = $1
        AND RESERVATION_STATUS IN ('BOOKED','HELD')
        AND (RESERVATION_STATUS <> 'HELD' OR HOLD_EXPIRES_AT > CURRENT_TIMESTAMP)
        AND $2 < DESTINATION_STOP_SEQUENCE
        AND $3 > SOURCE_STOP_SEQUENCE`,
    [tripSeatId, sourceSeq, destSeq]
  )
  return Number(result.rows[0].CNT) > 0
}
