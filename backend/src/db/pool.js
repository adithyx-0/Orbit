import pg from 'pg'
import dns from 'dns'
import 'dotenv/config'

dns.setDefaultResultOrder('ipv4first')

const { Pool } = pg

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // SSL required for Supabase/cloud; disabled for local PostgreSQL
  ssl: process.env.NODE_ENV === 'production' || process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: false }
    : false,
})
