import {
  withConnection,
  withTransaction
} from '../config/database.js'
import {
  createPassenger,
  findUserByEmail,
  findUserById,
  findUserByPhone
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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const BANGLADESH_PHONE_PATTERN = /^01[3-9]\d{8}$/

function normalizedEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function normalizedPhone(value) {
  if (value === undefined || value === null || String(value).trim() === '') return null
  const compact = String(value).trim().replace(/[\s-]/g, '')
  return compact.startsWith('+880') ? `0${compact.slice(4)}` : compact
}

function validateEmail(email) {
  if (email.length > 120 || !EMAIL_PATTERN.test(email)) {
    throw badRequest('A valid email address is required')
  }
}

export async function registerAccount(payload = {}) {
  const {
    fullName,
    email,
    phone,
    password,
    role = 'PASSENGER',
  } = payload || {}
  const cleanFullName = typeof fullName === 'string' ? fullName.trim() : ''
  const cleanEmail = normalizedEmail(email)
  const cleanPhone = normalizedPhone(phone)

  if (!cleanFullName || !cleanEmail || typeof password !== 'string' || !password)
    throw badRequest('fullName, email and password are required')
  if (cleanFullName.length < 2 || cleanFullName.length > 100)
    throw badRequest('Full name must be between 2 and 100 characters')
  validateEmail(cleanEmail)
  if (cleanPhone && !BANGLADESH_PHONE_PATTERN.test(cleanPhone)) {
    throw badRequest('Phone must be a valid Bangladesh mobile number, for example 01712345678')
  }
  if (password.length < 8)
    throw badRequest('Password must be at least 8 characters')

  const normalizedRole = String(role).trim().toUpperCase()
  if (!['PASSENGER', 'OPERATOR'].includes(normalizedRole)) {
    throw badRequest('role must be PASSENGER or OPERATOR')
  }
  const accountStatus = normalizedRole === 'OPERATOR' ? 'PENDING' : 'ACTIVE'

  return withTransaction(async (connection) => {
    const existing = await findUserByEmail(connection, cleanEmail)
    if (existing) throw conflict('An account with this email already exists')
    if (cleanPhone && await findUserByPhone(connection, cleanPhone)) {
      throw conflict('An account with this phone number already exists')
    }

    const passwordHash = await hashPassword(password)
    const userId = await createPassenger(connection, {
      fullName: cleanFullName,
      email: cleanEmail,
      phone: cleanPhone,
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

export async function login(payload = {}) {
  const { email, password } = payload || {}
  const cleanEmail = normalizedEmail(email)
  if (!cleanEmail || typeof password !== 'string' || !password) {
    throw badRequest('email and password are required')
  }
  validateEmail(cleanEmail)

  return withConnection(async (connection) => {
    const user = await findUserByEmail(connection, cleanEmail)

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
