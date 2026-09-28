import {
  withConnection,
  withTransaction
} from '../config/database.js'
import {
  createPassenger,
  findUserByEmail,
  findUserById
} from '../repositories/user.repository.js'
import {
  badRequest,
  conflict,
  forbidden,
  unauthorized
} from '../utils/httpError.js'
import {
  lowerKeys
} from '../utils/serializers.js'
import {
  hashPassword,
  issueToken,
  verifyPassword
} from '../utils/authCrypto.js'

export async function registerAccount({
  fullName,
  email,
  phone,
  password,
  role = 'PASSENGER',
}) {
  if (!fullName || !email || !password)
    throw badRequest('fullName, email and password are required')
  if (password.length < 8)
    throw badRequest('Password must be at least 8 characters')

  const normalizedRole = String(role).toUpperCase()
  if (!['PASSENGER', 'OPERATOR'].includes(normalizedRole)) {
    throw badRequest('role must be USER or OPERATOR')
  }
  const accountStatus = normalizedRole === 'OPERATOR' ? 'PENDING' : 'ACTIVE'

  return withTransaction(async (connection) => {
    const existing = await findUserByEmail(connection, email)
    if (existing) throw conflict('An account with this email already exists')

    const passwordHash = await hashPassword(password)
    const userId = await createPassenger(connection, {
      fullName,
      email,
      phone,
      passwordHash,
      role: normalizedRole,
      accountStatus,
    })
    const user = await findUserById(connection, userId)
    if (accountStatus === 'PENDING') {
      return {
        user: lowerKeys(user),
        pendingApproval: true,
        message: 'Operator account is waiting for admin approval.',
      }
    }
    return {
      user: lowerKeys(user),
      token: issueToken(user)
    }
  })
}

export async function login({
  email,
  password
}) {
  if (!email || !password) throw badRequest('email and password are required')

  return withConnection(async (connection) => {
    const user = await findUserByEmail(connection, email)

    // Postgres এর lowercase ডাটা হ্যান্ডেল করার লজিক
    const passHash = user?.password_hash || user?.PASSWORD_HASH;
    const status = user?.account_status || user?.ACCOUNT_STATUS;
    const role = user?.role || user?.ROLE;

    if (!user || !(await verifyPassword(password, passHash))) {
      throw unauthorized('Invalid email or password')
    }
    if (role === 'OPERATOR' && status === 'PENDING') {
      throw forbidden('Operator account is waiting for admin approval')
    }
    if (status !== 'ACTIVE') throw forbidden('This account is not active')

    const safeUser = {
      ...user
    }
    delete safeUser.PASSWORD_HASH
    delete safeUser.password_hash // lowercase ফিল্ডটিও মুছে দেওয়া হলো

    return {
      user: lowerKeys(safeUser),
      token: issueToken(user)
    }
  })
}

export async function getCurrentUser(userId) {
  return withConnection(async (connection) => {
    const user = await findUserById(connection, userId)
    if (!user) throw unauthorized()
    return lowerKeys(user)
  })
}
