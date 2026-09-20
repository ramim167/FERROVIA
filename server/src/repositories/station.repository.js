export async function listStations(connection) {
  const result = await connection.query(
    `SELECT STATION_ID, STATION_NAME, STATION_CODE, CITY
       FROM STATIONS
      WHERE IS_ACTIVE = 1
      ORDER BY STATION_NAME`
  )
  return result.rows
}