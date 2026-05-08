import pg from 'pg'
import dns from 'dns'
import 'dotenv/config'

dns.setDefaultResultOrder('ipv4first')

const { Pool } = pg

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})
