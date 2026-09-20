export async function searchTrips(connection, { from, to, date }) {
  const result = await connection.query(
    `SELECT
        T.TRIP_ID, TR.TRAIN_ID, TR.TRAIN_NAME, TR.TRAIN_CODE, TR.TRAIN_TYPE,
        R.ROUTE_ID, R.DIRECTION,
        SF.STATION_ID AS SOURCE_STATION_ID, SF.STATION_NAME AS SOURCE_STATION,
        ST.STATION_ID AS DESTINATION_STATION_ID, ST.STATION_NAME AS DESTINATION_STATION,
        TSF.SCHEDULED_DEPARTURE, TST.SCHEDULED_ARRIVAL, T.TRIP_STATUS,
        COALESCE(LIVE.CURRENT_DELAY_MINUTES, 0) AS CURRENT_DELAY_MINUTES,
        LIVE.LAST_LEFT_STATION, LIVE.LAST_LEFT_AT
     FROM TRIPS T
     JOIN TRAINS TR ON TR.TRAIN_ID = T.TRAIN_ID
     JOIN ROUTES R ON R.ROUTE_ID = T.ROUTE_ID
     JOIN TRIP_STOPS TSF ON TSF.TRIP_ID = T.TRIP_ID
     JOIN STATIONS SF ON SF.STATION_ID = TSF.STATION_ID
     JOIN TRIP_STOPS TST ON TST.TRIP_ID = T.TRIP_ID
     JOIN STATIONS ST ON ST.STATION_ID = TST.STATION_ID
     LEFT JOIN VW_LIVE_TRAIN_STATUS LIVE ON LIVE.TRIP_ID = T.TRIP_ID
     WHERE LOWER(SF.STATION_NAME) = LOWER($1)
       AND LOWER(ST.STATION_NAME) = LOWER($2)
       AND TSF.STOP_SEQUENCE < TST.STOP_SEQUENCE
       AND DATE(T.JOURNEY_DATE) = $3::date
       AND T.TRIP_STATUS <> 'CANCELLED'
     ORDER BY TSF.SCHEDULED_DEPARTURE`,
    [from, to, date]
  )
  return result.rows
}

export async function getTrainServices(connection) {
  const result = await connection.query(
    `SELECT TRAIN_ID, TRAIN_NAME, TRAIN_CODE, TRAIN_TYPE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN
       FROM TRAINS
      ORDER BY TRAIN_NAME`
  )
  return result.rows
}

export async function getLiveStatusByTrainCode(connection, trainCode) {
  const active = await connection.query(
    `SELECT *
       FROM VW_LIVE_TRAIN_STATUS
      WHERE UPPER(TRAIN_CODE) = UPPER($1)
        AND TRIP_STATUS IN ('BOARDING','RUNNING','DELAYED')
      ORDER BY SCHEDULED_DEPARTURE DESC
      LIMIT 1`,
    [trainCode]
  )
  if (active.rows[0]) return active.rows[0]

  const scheduled = await connection.query(
    `SELECT *
       FROM VW_LIVE_TRAIN_STATUS
      WHERE UPPER(TRAIN_CODE) = UPPER($1)
        AND TRIP_STATUS = 'SCHEDULED'
        AND SCHEDULED_DEPARTURE >= CURRENT_TIMESTAMP
      ORDER BY SCHEDULED_DEPARTURE
      LIMIT 1`,
    [trainCode]
  )
  return scheduled.rows[0] || null
}