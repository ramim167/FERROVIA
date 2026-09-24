export async function listRoutes(connection) {
  const result = await connection.query(
    `SELECT R.ROUTE_ID, R.ROUTE_CODE, R.DIRECTION, R.TRAIN_ID, T.TRAIN_NAME, T.TRAIN_CODE,
            R.SOURCE_STATION_ID, SRC.STATION_NAME AS SOURCE_STATION,
            R.DESTINATION_STATION_ID, DST.STATION_NAME AS DESTINATION_STATION,
            R.IS_ACTIVE
       FROM ROUTES R
       JOIN TRAINS T ON T.TRAIN_ID = R.TRAIN_ID
       JOIN STATIONS SRC ON SRC.STATION_ID = R.SOURCE_STATION_ID
       JOIN STATIONS DST ON DST.STATION_ID = R.DESTINATION_STATION_ID
      ORDER BY T.TRAIN_NAME, R.DIRECTION`
  )
  return result.rows
}

export async function getRoute(connection, routeId) {
  const result = await connection.query(
    `SELECT R.ROUTE_ID, R.TRAIN_ID, R.ROUTE_CODE, R.TRAIN_NUMBER, R.DIRECTION,
            R.SOURCE_STATION_ID, R.DESTINATION_STATION_ID, R.IS_ACTIVE,
            MAX(GREATEST(COALESCE(RS.ARRIVAL_OFFSET_MIN,0), COALESCE(RS.DEPARTURE_OFFSET_MIN,0))) AS DURATION_MIN
       FROM ROUTES R
       JOIN ROUTE_STOPS RS ON RS.ROUTE_ID = R.ROUTE_ID
      WHERE R.ROUTE_ID = $1
      GROUP BY R.ROUTE_ID, R.TRAIN_ID, R.ROUTE_CODE, R.TRAIN_NUMBER, R.DIRECTION,
               R.SOURCE_STATION_ID, R.DESTINATION_STATION_ID, R.IS_ACTIVE`,
    [routeId]
  )
  return result.rows[0] || null
}

export async function materializeTripStops(connection, tripId) {
  await connection.query(
    `INSERT INTO TRIP_STOPS
      (TRIP_ID, ROUTE_STOP_ID, STATION_ID, STOP_SEQUENCE,
       SCHEDULED_ARRIVAL, SCHEDULED_DEPARTURE)
     SELECT T.TRIP_ID, RS.ROUTE_STOP_ID, RS.STATION_ID, RS.STOP_SEQUENCE,
            CASE WHEN RS.ARRIVAL_OFFSET_MIN IS NULL THEN NULL
                 ELSE T.SCHEDULED_DEPARTURE + (RS.ARRIVAL_OFFSET_MIN * interval '1 minute') END,
            CASE WHEN RS.DEPARTURE_OFFSET_MIN IS NULL THEN NULL
                 ELSE T.SCHEDULED_DEPARTURE + (RS.DEPARTURE_OFFSET_MIN * interval '1 minute') END
       FROM TRIPS T
       JOIN ROUTE_STOPS RS ON RS.ROUTE_ID = T.ROUTE_ID
      WHERE T.TRIP_ID = $1`,
    [tripId]
  )
}

export async function materializeTripSeats(connection, tripId) {
  await connection.query(
    `INSERT INTO TRIP_SEATS (TRIP_ID, SEAT_ID, SEAT_STATUS)
     SELECT T.TRIP_ID, S.SEAT_ID, 'AVAILABLE'
       FROM TRIPS T
       JOIN COACHES C ON C.TRAIN_ID = T.TRAIN_ID
       JOIN SEATS S ON S.COACH_ID = C.COACH_ID
      WHERE T.TRIP_ID = $1
        AND S.IS_ACTIVE = 1`,
    [tripId]
  )
}

export async function assignOperator(connection, tripId, operatorUserId) {
  await connection.query(
    `UPDATE TRIPS SET OPERATOR_USER_ID = $2 WHERE TRIP_ID = $1`,
    [tripId, operatorUserId]
  )
}

export async function getOperator(connection, userId) {
  const result = await connection.query(
    `SELECT USER_ID, ROLE, ACCOUNT_STATUS FROM USERS WHERE USER_ID = $1`,
    [userId]
  )
  return result.rows[0] || null
}

export async function listOperators(connection) {
  const result = await connection.query(
    `SELECT USER_ID, FULL_NAME, EMAIL, PHONE, ROLE, ACCOUNT_STATUS
       FROM USERS
      WHERE ROLE = 'OPERATOR'
        AND ACCOUNT_STATUS = 'ACTIVE'
      ORDER BY FULL_NAME`
  )
  return result.rows
}

export async function listAdminTrips(connection, date = null) {
  const result = await connection.query(
    `SELECT T.TRIP_ID, T.JOURNEY_DATE, T.SCHEDULED_DEPARTURE, T.SCHEDULED_ARRIVAL,
            T.TRIP_STATUS, T.OPERATOR_USER_ID,
            TR.TRAIN_ID, TR.TRAIN_NAME, TR.TRAIN_CODE,
            R.ROUTE_ID, R.ROUTE_CODE, R.DIRECTION,
            R.SOURCE_STATION_ID, SRC.STATION_NAME AS SOURCE_STATION,
            R.DESTINATION_STATION_ID, DST.STATION_NAME AS DESTINATION_STATION,
            U.FULL_NAME AS OPERATOR_NAME,
            TA.TRAINSET_ID AS ASSIGNED_TRAINSET_ID,
            ATS.TRAINSET_CODE AS ASSIGNED_TRAINSET_CODE,
            TA.ASSIGNMENT_STATUS AS TRAINSET_ASSIGNMENT_STATUS,
            COALESCE(L.CURRENT_DELAY_MINUTES,0) AS CURRENT_DELAY_MINUTES,
            L.LAST_LEFT_STATION, L.NEXT_STATION
       FROM TRIPS T
       JOIN TRAINS TR ON TR.TRAIN_ID = T.TRAIN_ID
       JOIN ROUTES R ON R.ROUTE_ID = T.ROUTE_ID
       JOIN STATIONS SRC ON SRC.STATION_ID = R.SOURCE_STATION_ID
       JOIN STATIONS DST ON DST.STATION_ID = R.DESTINATION_STATION_ID
       LEFT JOIN USERS U ON U.USER_ID = T.OPERATOR_USER_ID
       LEFT JOIN TRAINSET_ASSIGNMENTS TA
         ON TA.TRIP_ID = T.TRIP_ID
        AND TA.ASSIGNMENT_STATUS IN ('RESERVED','ACTIVE')
       LEFT JOIN TRAINSETS ATS ON ATS.TRAINSET_ID = TA.TRAINSET_ID
       LEFT JOIN VW_LIVE_TRAIN_STATUS L ON L.TRIP_ID = T.TRIP_ID
      WHERE ($1::date IS NULL OR DATE(T.JOURNEY_DATE) = $1::date)
      ORDER BY T.SCHEDULED_DEPARTURE`,
    [date || null]
  )
  return result.rows
}

export async function listTrainFormStations(connection) {
  const result = await connection.query(
    `SELECT STATION_ID, STATION_NAME, CITY, STATION_CODE
       FROM STATIONS
      WHERE IS_ACTIVE = 1
      ORDER BY STATION_NAME`
  )
  return result.rows
}

export async function listClassTypes(connection) {
  const result = await connection.query(
    `SELECT CLASS_ID, CLASS_NAME, CLASS_CODE
       FROM CLASS_TYPES
      ORDER BY CLASS_NAME`
  )
  return result.rows
}

export async function findExistingTrain(connection, trainName, trainCode) {
  const result = await connection.query(
    `SELECT TRAIN_ID, TRAIN_NAME, TRAIN_CODE
       FROM TRAINS
      WHERE UPPER(TRIM(TRAIN_NAME)) = UPPER(TRIM($1))
         OR UPPER(TRIM(TRAIN_CODE)) = UPPER(TRIM($2))
      LIMIT 1`,
    [trainName, trainCode]
  )
  return result.rows[0] || null
}

export async function createTrainServiceRow(
  connection,
  { trainName, trainType, trainCode, trainStatus, spareTriggerDelayMin }
) {
  const result = await connection.query(
    `INSERT INTO TRAINS
       (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
     VALUES
       ($1, $2, $3, $4, $5)
     RETURNING TRAIN_ID`,
    [trainName, trainType, trainCode, trainStatus, spareTriggerDelayMin]
  )
  return result.rows[0].TRAIN_ID
}

export async function createRouteDefinition(
  connection,
  { trainId, routeCode, trainNumber, direction, sourceStationId, destinationStationId }
) {
  const result = await connection.query(
    `INSERT INTO ROUTES
       (TRAIN_ID, ROUTE_CODE, TRAIN_NUMBER, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
     VALUES
       ($1, $2, $3, $4, $5, $6, 1)
     RETURNING ROUTE_ID`,
    [trainId, routeCode, trainNumber, direction, sourceStationId, destinationStationId]
  )
  return result.rows[0].ROUTE_ID
}

export async function createRouteStopDefinition(
  connection,
  { routeId, stationId, stopSequence, arrivalOffsetMin, departureOffsetMin, distanceKm }
) {
  await connection.query(
    `INSERT INTO ROUTE_STOPS
       (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM)
     VALUES
       ($1, $2, $3, $4, $5, $6)`,
    [routeId, stationId, stopSequence, arrivalOffsetMin, departureOffsetMin, distanceKm]
  )
}

export async function createRunningDayDefinition(
  connection,
  { routeId, dayCode, departureMinute }
) {
  await connection.query(
    `INSERT INTO TRAIN_RUNNING_DAYS
       (ROUTE_ID, DAY_CODE, DEPARTURE_MINUTE)
     VALUES
       ($1, $2, $3)`,
    [routeId, dayCode, departureMinute]
  )
}

export async function createTrainsetDefinition(
  connection,
  { trainId, trainsetCode, status, currentStationId }
) {
  await connection.query(
    `INSERT INTO TRAINSETS
       (TRAIN_ID, TRAINSET_CODE, STATUS, CURRENT_STATION_ID)
     VALUES
       ($1, $2, $3, $4)`,
    [trainId, trainsetCode, status, currentStationId]
  )
}

export async function createFareRuleDefinition(
  connection,
  { trainId, classId, ratePerKm, baseFare }
) {
  await connection.query(
    `INSERT INTO FARE_RULES
       (TRAIN_ID, CLASS_ID, RATE_PER_KM, BASE_FARE)
     VALUES
       ($1, $2, $3, $4)`,
    [trainId, classId, ratePerKm, baseFare]
  )
}

export async function createCoachDefinition(
  connection,
  { trainId, classId, coachCode, coachOrder }
) {
  const result = await connection.query(
    `INSERT INTO COACHES
       (TRAIN_ID, CLASS_ID, COACH_CODE, COACH_ORDER)
     VALUES
       ($1, $2, $3, $4)
     RETURNING COACH_ID`,
    [trainId, classId, coachCode, coachOrder]
  )
  return result.rows[0].COACH_ID
}

export async function createSeatDefinition(
  connection,
  { coachId, seatNumber, seatType }
) {
  await connection.query(
    `INSERT INTO SEATS
       (COACH_ID, SEAT_NUMBER, SEAT_TYPE, IS_ACTIVE)
     VALUES
       ($1, $2, $3, 1)`,
    [coachId, seatNumber, seatType]
  )
}

export async function listTrainServices(connection) {
  const result = await connection.query(
    `SELECT
        TRAIN_ID, TRAIN_NAME, TRAIN_CODE, TRAIN_TYPE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN
     FROM TRAINS
     ORDER BY TRAIN_NAME`
  )
  return result.rows
}

export async function getTrainServiceDetails(connection, trainId) {
  const trainResult = await connection.query(
    `SELECT
        TRAIN_ID, TRAIN_NAME, TRAIN_CODE, TRAIN_TYPE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN
     FROM TRAINS
     WHERE TRAIN_ID = $1`,
    [trainId]
  )

  if (!trainResult.rows.length) return null

  const routesResult = await connection.query(
    `SELECT
        R.ROUTE_ID, R.ROUTE_CODE, R.TRAIN_NUMBER, R.DIRECTION,
        R.SOURCE_STATION_ID, SRC.STATION_NAME AS SOURCE_STATION,
        R.DESTINATION_STATION_ID, DST.STATION_NAME AS DESTINATION_STATION, R.IS_ACTIVE
     FROM ROUTES R
     JOIN STATIONS SRC ON SRC.STATION_ID = R.SOURCE_STATION_ID
     JOIN STATIONS DST ON DST.STATION_ID = R.DESTINATION_STATION_ID
     WHERE R.TRAIN_ID = $1
     ORDER BY R.DIRECTION`,
    [trainId]
  )

  const routeStopsResult = await connection.query(
    `SELECT
        RS.ROUTE_STOP_ID, RS.ROUTE_ID, RS.STATION_ID, S.STATION_NAME,
        RS.STOP_SEQUENCE, RS.ARRIVAL_OFFSET_MIN, RS.DEPARTURE_OFFSET_MIN, RS.DISTANCE_FROM_SOURCE_KM
     FROM ROUTE_STOPS RS
     JOIN ROUTES R ON R.ROUTE_ID = RS.ROUTE_ID
     JOIN STATIONS S ON S.STATION_ID = RS.STATION_ID
     WHERE R.TRAIN_ID = $1
     ORDER BY RS.ROUTE_ID, RS.STOP_SEQUENCE`,
    [trainId]
  )

  const runningDaysResult = await connection.query(
    `SELECT
        TRD.RUNNING_DAY_ID, TRD.ROUTE_ID, TRD.DAY_CODE, TRD.DEPARTURE_MINUTE
     FROM TRAIN_RUNNING_DAYS TRD
     JOIN ROUTES R ON R.ROUTE_ID = TRD.ROUTE_ID
     WHERE R.TRAIN_ID = $1
     ORDER BY TRD.ROUTE_ID, TRD.DAY_CODE`,
    [trainId]
  )

  const trainsetsResult = await connection.query(
    `SELECT
        TS.TRAINSET_ID, TS.TRAINSET_CODE, TS.STATUS, TS.CURRENT_STATION_ID, S.STATION_NAME AS CURRENT_STATION
     FROM TRAINSETS TS
     LEFT JOIN STATIONS S ON S.STATION_ID = TS.CURRENT_STATION_ID
     WHERE TS.TRAIN_ID = $1
     ORDER BY TS.TRAINSET_CODE`,
    [trainId]
  )

  const faresResult = await connection.query(
    `SELECT
        F.FARE_RULE_ID, F.CLASS_ID, C.CLASS_NAME, C.CLASS_CODE, F.RATE_PER_KM, F.BASE_FARE
     FROM FARE_RULES F
     JOIN CLASS_TYPES C ON C.CLASS_ID = F.CLASS_ID
     WHERE F.TRAIN_ID = $1
     ORDER BY C.CLASS_NAME`,
    [trainId]
  )

  const coachesResult = await connection.query(
    `SELECT
        C.COACH_ID, C.CLASS_ID, CT.CLASS_NAME, CT.CLASS_CODE, C.COACH_CODE, C.COACH_ORDER,
        COUNT(CASE WHEN S.IS_ACTIVE = 1 THEN 1 END) AS SEAT_COUNT
     FROM COACHES C
     JOIN CLASS_TYPES CT ON CT.CLASS_ID = C.CLASS_ID
     LEFT JOIN SEATS S ON S.COACH_ID = C.COACH_ID
     WHERE C.TRAIN_ID = $1
     GROUP BY C.COACH_ID, C.CLASS_ID, CT.CLASS_NAME, CT.CLASS_CODE, C.COACH_CODE, C.COACH_ORDER
     ORDER BY C.COACH_ORDER`,
    [trainId]
  )

  const classesResult = await connection.query(
    `SELECT CLASS_ID, CLASS_NAME, CLASS_CODE FROM CLASS_TYPES ORDER BY CLASS_NAME`
  )

  return {
    train: trainResult.rows[0],
    routes: routesResult.rows,
    routeStops: routeStopsResult.rows,
    runningDays: runningDaysResult.rows,
    trainsets: trainsetsResult.rows,
    fares: faresResult.rows,
    coaches: coachesResult.rows,
    classes: classesResult.rows,
  }
}

export async function updateTrainBasicInfo(connection, {
  trainId, trainName, trainCode, trainType, trainStatus, spareTriggerDelayMin,
}) {
  const result = await connection.query(
    `UPDATE TRAINS
        SET TRAIN_NAME = $2, TRAIN_CODE = $3, TRAIN_TYPE = $4,
            TRAIN_STATUS = $5, SPARE_TRIGGER_DELAY_MIN = $6
      WHERE TRAIN_ID = $1`,
    [trainId, trainName, trainCode, trainType, trainStatus, spareTriggerDelayMin]
  )
  return result.rowCount
}

export async function updateRouteBasicInfo(connection, {
  routeId, trainNumber, routeCode, isActive,
}) {
  const result = await connection.query(
    `UPDATE ROUTES
        SET TRAIN_NUMBER = $2, ROUTE_CODE = $3, IS_ACTIVE = $4
      WHERE ROUTE_ID = $1`,
    [routeId, trainNumber, routeCode, isActive]
  )
  return result.rowCount
}
