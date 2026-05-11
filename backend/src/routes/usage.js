import { Router } from 'express'
import { pool } from '../db/pool.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

// GET /api/usage?days=14  →  grouped by date+category
router.get('/', async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 14
    const { rows } = await pool.query(
      `SELECT date, category, SUM(minutes) AS minutes
       FROM usage_logs
       WHERE user_id=$1 AND date >= CURRENT_DATE - ($2 || ' days')::INTERVAL
       GROUP BY date, category
       ORDER BY date ASC`,
      [req.user.id, days]
    )
    // Reshape into [{date, <category>: minutes, ...}] — all categories included dynamically
    const map = {}
    for (const row of rows) {
      if (!map[row.date]) map[row.date] = { date: row.date }
      map[row.date][row.category.toLowerCase()] = Number(row.minutes)
    }
    res.json({ usage: Object.values(map) })
  } catch (err) { next(err) }
})

// GET /api/usage/sources  — returns last-sync date per agent source
router.get('/sources', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT source, MAX(date) AS last_date, COUNT(*)::int AS total_logs
       FROM usage_logs
       WHERE user_id=$1
       GROUP BY source
       ORDER BY last_date DESC`,
      [req.user.id]
    )
    res.json({ sources: rows })
  } catch (err) { next(err) }
})

// POST /api/usage  — used by Android/Windows agents
router.post('/', async (req, res, next) => {
  try {
    const { date, category, minutes, app_name, source } = req.body
    if (!date || !category || minutes == null) return res.status(400).json({ error: 'date, category and minutes are required' })
    const { rows } = await pool.query(
      `INSERT INTO usage_logs (user_id,date,category,minutes,app_name,source)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.user.id, date, category, minutes, app_name || null, source || 'manual']
    )
    res.status(201).json({ log: rows[0] })
  } catch (err) { next(err) }
})

export default router
