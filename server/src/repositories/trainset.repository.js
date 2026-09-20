export async function getActiveAssignment(connection, tripId) {
  const result = await connection.query(
    `SELECT A.ASSIGNMENT_ID, A.TRIP_ID, A.TRAINSET_ID, A.TRAIN_ID,
            A.ASSIGNMENT_TYPE, A.ASSIGNMENT_STATUS, TS.TRAINSET_CODE
       FROM TRAINSET_ASSIGNMENTS A
       JOIN TRAINSETS TS ON TS.TRAINSET_ID = A.TRAINSET_ID
      WHERE A.TRIP_ID = $1
        AND A.ASSIGNMENT_STATUS IN ('ACTIVE','RESERVED')
      ORDER BY CASE A.ASSIGNMENT_STATUS WHEN 'ACTIVE' THEN 1 ELSE 2 END,
               A.ASSIGNED_AT DESC
      LIMIT 1`,
    [tripId]
  )
  return result.rows[0] || null
}

export async function activateAssignment(connection, assignmentId) {
  await connection.query(
    `UPDATE TRAINSET_ASSIGNMENTS
        SET ASSIGNMENT_STATUS = 'ACTIVE', ACTIVATED_AT = COALESCE(ACTIVATED_AT, CURRENT_TIMESTAMP)
      WHERE ASSIGNMENT_ID = $1`,
    [assignmentId]
  )
}

export async function completeAssignment(connection, assignmentId) {
  await connection.query(
    `UPDATE TRAINSET_ASSIGNMENTS
        SET ASSIGNMENT_STATUS = 'COMPLETED', COMPLETED_AT = CURRENT_TIMESTAMP
      WHERE ASSIGNMENT_ID = $1`,
    [assignmentId]
  )
}

export async function setTrainsetStatus(connection, trainsetId, status, stationId = null) {
  await connection.query(
    `UPDATE TRAINSETS
        SET STATUS = $2, CURRENT_STATION_ID = $3, STATUS_UPDATED_AT = CURRENT_TIMESTAMP
      WHERE TRAINSET_ID = $1`,
    [trainsetId, status, stationId]
  )
}

export async function findDestinationSpare(connection, trainId, stationId) {
  const result = await connection.query(
    `SELECT TRAINSET_ID, TRAINSET_CODE
       FROM TRAINSETS
      WHERE TRAINSET_ID = (
            SELECT TRAINSET_ID
              FROM TRAINSETS
             WHERE TRAIN_ID = $1
               AND CURRENT_STATION_ID = $2
               AND STATUS = 'SPARE'
             ORDER BY TRAINSET_ID
             LIMIT 1
      )
      FOR UPDATE SKIP LOCKED`,
    [trainId, stationId]
  )
  return result.rows[0] || null
}

export async function getReservedAssignmentForTrip(connection, tripId) {
  const result = await connection.query(
    `SELECT ASSIGNMENT_ID, TRAINSET_ID, ASSIGNMENT_TYPE, ASSIGNMENT_STATUS
       FROM TRAINSET_ASSIGNMENTS
      WHERE TRIP_ID = $1
        AND ASSIGNMENT_STATUS = 'RESERVED'
      ORDER BY ASSIGNED_AT DESC
      LIMIT 1`,
    [tripId]
  )
  return result.rows[0] || null
}

export async function cancelAssignment(connection, assignmentId, reason) {
  await connection.query(
    `UPDATE TRAINSET_ASSIGNMENTS
        SET ASSIGNMENT_STATUS = 'CANCELLED',
            REASON = CASE WHEN REASON IS NULL THEN $2 ELSE REASON || '; ' || $2 END
      WHERE ASSIGNMENT_ID = $1`,
    [assignmentId, reason]
  )
}

export async function createAssignment(connection, { tripId, trainsetId, trainId, type, status = 'RESERVED', reason }) {
  await connection.query(
    `INSERT INTO TRAINSET_ASSIGNMENTS
      (TRIP_ID, TRAINSET_ID, TRAIN_ID, ASSIGNMENT_TYPE, ASSIGNMENT_STATUS, REASON)
     VALUES
      ($1, $2, $3, $4, $5, $6)`,
    [tripId, trainsetId, trainId, type, status, reason || null]
  )
}

export async function listTrainsets(connection, trainId = null) {
  const sql = trainId
    ? `SELECT * FROM VW_TRAINSET_STATUS WHERE TRAIN_ID = $1 ORDER BY TRAINSET_CODE`
    : `SELECT * FROM VW_TRAINSET_STATUS ORDER BY TRAIN_NAME, TRAINSET_CODE`
  const params = trainId ? [trainId] : []
  const result = await connection.query(sql, params)
  return result.rows
}