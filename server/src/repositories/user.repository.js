export async function findUserByEmail(connection, email) {
  const result = await connection.query(
    `SELECT USER_ID, FULL_NAME, EMAIL, PHONE, PASSWORD_HASH, ROLE, ACCOUNT_STATUS, CREATED_AT
       FROM USERS
      WHERE LOWER(EMAIL) = LOWER($1)`,
    [email]
  )
  return result.rows[0] || null
}

export async function findUserById(connection, userId) {
  const result = await connection.query(
    `SELECT USER_ID, FULL_NAME, EMAIL, PHONE, ROLE, ACCOUNT_STATUS, CREATED_AT
       FROM USERS
      WHERE USER_ID = $1`,
    [userId]
  )
  return result.rows[0] || null
}

export async function createPassenger(
  connection,
  { fullName, email, phone, passwordHash, role }
) {
  const result = await connection.query(
    `INSERT INTO USERS (FULL_NAME, EMAIL, PHONE, PASSWORD_HASH, ROLE)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING USER_ID`,
    [fullName, email, phone || null, passwordHash, role]
  )
  return result.rows[0].user_id || result.rows[0].USER_ID
}