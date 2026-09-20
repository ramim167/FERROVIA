import pg from 'pg'
import { createMemoryPool } from './memoryDatabase.js'

const { Pool } = pg

let pool
let databaseMode

function normalizeRowKeys(row) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key.toUpperCase(), value])
  )
}

function normalizeQueryResult(result) {
  if (result?.rows) {
    result.rows = result.rows.map(normalizeRowKeys)
  }

  return result
}

function normalizeClient(client) {
  if (client.__ferroviaNormalized) return client

  const originalQuery = client.query.bind(client)
  client.query = async (...args) => normalizeQueryResult(await originalQuery(...args))
  client.__ferroviaNormalized = true

  return client
}

export async function initializeDatabase() {
  if (pool) return pool

  databaseMode = String(process.env.DATABASE_MODE || 'postgres').toLowerCase()

  if (databaseMode === 'memory') {
    pool = createMemoryPool()
    return pool
  }

  if (databaseMode !== 'postgres') {
    throw new Error('DATABASE_MODE must be either postgres or memory')
  }

  const required = ['PG_CONNECTION_STRING']
  const missing = required.filter((key) => !process.env[key])
  if (missing.length) {
    throw new Error(`Missing PostgreSQL environment variables: ${missing.join(', ')}`)
  }

  pool = new Pool({
    connectionString: process.env.PG_CONNECTION_STRING,
    min: Number(process.env.PG_POOL_MIN || 1),
    max: Number(process.env.PG_POOL_MAX || 10),
  })

  const client = await pool.connect()
  try {
    await client.query('SELECT 1')
  } finally {
    client.release()
  }

  return pool
}

export async function getConnection() {
  if (!pool) await initializeDatabase()
  const client = await pool.connect()
  if (databaseMode === 'postgres') await client.query("SET TIME ZONE 'Asia/Dhaka'")
  return normalizeClient(client)
}

export function getDatabaseMode() {
  return databaseMode || String(process.env.DATABASE_MODE || 'postgres').toLowerCase()
}

export async function closeDatabase() {
  if (!pool) return
  await pool.end()
  pool = undefined
}

export async function withConnection(work) {
  const client = await getConnection()
  try {
    return await work(client)
  } finally {
    client.release()
  }
}

export async function withTransaction(work) {
  const client = await getConnection()
  try {
    await client.query('BEGIN')
    const result = await work(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
