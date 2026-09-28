export async function listUpcomingTrips(connection, limit = 8) {
  const result = await connection.query(
    `SELECT T.TRIP_ID, TR.TRAIN_NAME, TR.TRAIN_CODE, TR.TRAIN_TYPE,
            R.DIRECTION,
            SRC.STATION_NAME AS SOURCE_STATION,
            DST.STATION_NAME AS DESTINATION_STATION,
            T.SCHEDULED_DEPARTURE, T.SCHEDULED_ARRIVAL, T.TRIP_STATUS,
            COALESCE(L.CURRENT_DELAY_MINUTES, 0) AS CURRENT_DELAY_MINUTES,
            L.LAST_LEFT_STATION, L.NEXT_STATION
       FROM TRIPS T
       JOIN TRAINS TR ON TR.TRAIN_ID = T.TRAIN_ID
       JOIN ROUTES R ON R.ROUTE_ID = T.ROUTE_ID
       JOIN STATIONS SRC ON SRC.STATION_ID = R.SOURCE_STATION_ID
       JOIN STATIONS DST ON DST.STATION_ID = R.DESTINATION_STATION_ID
       LEFT JOIN VW_LIVE_TRAIN_STATUS L ON L.TRIP_ID = T.TRIP_ID
      WHERE T.TRIP_STATUS <> 'CANCELLED'
        AND T.SCHEDULED_DEPARTURE >= CURRENT_TIMESTAMP
      ORDER BY T.SCHEDULED_DEPARTURE
      LIMIT $1`,
    [limit]
  )
  return result.rows
}

export async function listTrainRunningSchedules(connection) {
  const result = await connection.query(
    `SELECT TR.TRAIN_ID, TR.TRAIN_NAME, TR.TRAIN_CODE, TR.TRAIN_TYPE,
            R.ROUTE_ID, R.DIRECTION,
            SRC.STATION_NAME AS SOURCE_STATION,
            DST.STATION_NAME AS DESTINATION_STATION,
            RD.DAY_CODE, RD.DEPARTURE_MINUTE
       FROM TRAINS TR
       JOIN ROUTES R ON R.TRAIN_ID = TR.TRAIN_ID
       JOIN STATIONS SRC ON SRC.STATION_ID = R.SOURCE_STATION_ID
       JOIN STATIONS DST ON DST.STATION_ID = R.DESTINATION_STATION_ID
       LEFT JOIN TRAIN_RUNNING_DAYS RD ON RD.ROUTE_ID = R.ROUTE_ID
      WHERE TR.TRAIN_STATUS = 'ACTIVE'
        AND LOWER(R.IS_ACTIVE::text) IN ('1','true','t')
      ORDER BY TR.TRAIN_NAME, R.DIRECTION, RD.DEPARTURE_MINUTE, RD.DAY_CODE`
  )
  return result.rows
}

export async function getTrainProfile(connection, trainId) {
  const trainResult = await connection.query(
    `SELECT TRAIN_ID, TRAIN_NAME, TRAIN_CODE, TRAIN_TYPE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN
       FROM TRAINS
      WHERE TRAIN_ID = $1`,
    [trainId]
  )
  const train = trainResult.rows[0] || null
  if (!train) return null

  const routes = await connection.query(
    `SELECT R.ROUTE_ID, R.ROUTE_CODE, R.DIRECTION,
            SRC.STATION_NAME AS SOURCE_STATION,
            DST.STATION_NAME AS DESTINATION_STATION
       FROM ROUTES R
       JOIN STATIONS SRC ON SRC.STATION_ID = R.SOURCE_STATION_ID
       JOIN STATIONS DST ON DST.STATION_ID = R.DESTINATION_STATION_ID
      WHERE R.TRAIN_ID = $1 AND LOWER(R.IS_ACTIVE::text) IN ('1','true','t')
      ORDER BY R.DIRECTION`,
    [trainId]
  )

  const stops = await connection.query(
    `SELECT R.ROUTE_ID, R.DIRECTION,
            S.STATION_NAME, S.STATION_CODE,
            RS.STOP_SEQUENCE, RS.ARRIVAL_OFFSET_MIN, RS.DEPARTURE_OFFSET_MIN,
            RS.DISTANCE_FROM_SOURCE_KM
       FROM ROUTES R
       JOIN ROUTE_STOPS RS ON RS.ROUTE_ID = R.ROUTE_ID
       JOIN STATIONS S ON S.STATION_ID = RS.STATION_ID
      WHERE R.TRAIN_ID = $1 AND LOWER(R.IS_ACTIVE::text) IN ('1','true','t')
      ORDER BY R.DIRECTION, RS.STOP_SEQUENCE`,
    [trainId]
  )

  const runningDays = await connection.query(
    `SELECT R.ROUTE_ID, R.DIRECTION, RD.DAY_CODE, RD.DEPARTURE_MINUTE
       FROM ROUTES R
       JOIN TRAIN_RUNNING_DAYS RD ON RD.ROUTE_ID = R.ROUTE_ID
      WHERE R.TRAIN_ID = $1 AND LOWER(R.IS_ACTIVE::text) IN ('1','true','t')
      ORDER BY R.DIRECTION, RD.DAY_CODE`,
    [trainId]
  )

  const fares = await connection.query(
    `SELECT CT.CLASS_NAME, CT.CLASS_CODE, FR.BASE_FARE, FR.RATE_PER_KM
       FROM FARE_RULES FR
       JOIN CLASS_TYPES CT ON CT.CLASS_ID = FR.CLASS_ID
      WHERE FR.TRAIN_ID = $1
      ORDER BY CT.CLASS_NAME`,
    [trainId]
  )

  const upcomingTrips = await connection.query(
    `SELECT T.TRIP_ID, R.DIRECTION,
            SRC.STATION_NAME AS SOURCE_STATION,
            DST.STATION_NAME AS DESTINATION_STATION,
            T.JOURNEY_DATE, T.SCHEDULED_DEPARTURE, T.SCHEDULED_ARRIVAL,
            T.TRIP_STATUS,
            COALESCE(L.CURRENT_DELAY_MINUTES, 0) AS CURRENT_DELAY_MINUTES,
            L.LAST_LEFT_STATION, L.NEXT_STATION
       FROM TRIPS T
       JOIN ROUTES R ON R.ROUTE_ID = T.ROUTE_ID
       JOIN STATIONS SRC ON SRC.STATION_ID = R.SOURCE_STATION_ID
       JOIN STATIONS DST ON DST.STATION_ID = R.DESTINATION_STATION_ID
       LEFT JOIN VW_LIVE_TRAIN_STATUS L ON L.TRIP_ID = T.TRIP_ID
      WHERE T.TRAIN_ID = $1
        AND T.TRIP_STATUS <> 'CANCELLED'
        AND T.SCHEDULED_DEPARTURE >= CURRENT_TIMESTAMP
      ORDER BY T.SCHEDULED_DEPARTURE
      LIMIT 8`,
    [trainId]
  )

  const liveStatus = await connection.query(
    `SELECT *
       FROM VW_LIVE_TRAIN_STATUS
      WHERE TRAIN_ID = $1
        AND TRIP_STATUS IN ('BOARDING','RUNNING','DELAYED')
      ORDER BY SCHEDULED_DEPARTURE DESC
      LIMIT 1`,
    [trainId]
  )

  return {
    train,
    routes: routes.rows,
    stops: stops.rows,
    runningDays: runningDays.rows,
    fares: fares.rows,
    upcomingTrips: upcomingTrips.rows,
    liveStatus: liveStatus.rows[0] || null,
  }
}
