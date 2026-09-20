export async function listNotifications(connection, userId) {
  const result = await connection.query(
    `SELECT NOTIFICATION_ID, BOOKING_ID, TRIP_ID, TITLE, MESSAGE, IS_READ, CREATED_AT
       FROM NOTIFICATIONS
      WHERE USER_ID = $1
      ORDER BY CREATED_AT DESC
      LIMIT 50`,
    [userId]
  )
  return result.rows
}

export async function markNotificationRead(connection, userId, notificationId) {
  const result = await connection.query(
    `UPDATE NOTIFICATIONS
        SET IS_READ = 1
      WHERE NOTIFICATION_ID = $2
        AND USER_ID = $1`,
    [userId, notificationId]
  )
  return result.rowCount > 0
}

export async function markAllNotificationsRead(connection, userId) {
  const result = await connection.query(
    `UPDATE NOTIFICATIONS SET IS_READ = 1 WHERE USER_ID = $1 AND IS_READ = 0`,
    [userId]
  )
  return result.rowCount
}