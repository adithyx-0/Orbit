import pg from 'pg'
import dns from 'dns'
import 'dotenv/config'

dns.setDefaultResultOrder('ipv4first')

const { Pool, types } = pg

// Return DATE columns as plain YYYY-MM-DD strings instead of JS Date objects,
// which serialize to ISO timestamps and shift by the server's UTC offset.
types.setTypeParser(1082, (str) => str)

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' || process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: false }
    : false,
})
