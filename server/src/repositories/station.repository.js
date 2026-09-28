export async function listStations(connection) {
  const result = await connection.query(
    `SELECT STATION_ID, STATION_NAME, STATION_CODE, CITY
       FROM STATIONS
      WHERE LOWER(IS_ACTIVE::text) IN ('1','true','t')
      ORDER BY STATION_NAME`
  )
  return result.rows
}
