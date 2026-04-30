import { Router } from 'express'
import { pool } from '../db/pool.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id=$1 ORDER BY created_at DESC',
      [req.user.id]
    )
    res.json({ subscriptions: rows })
  } catch (err) { next(err) }
})

router.post('/', async (req, res, next) => {
  try {
    const { name, category, cost, billing_cycle, status, hours_this_month, renews_on } = req.body
    if (!name || !category || cost == null) return res.status(400).json({ error: 'name, category and cost are required' })
    const { rows } = await pool.query(
      `INSERT INTO subscriptions (user_id,name,category,cost,billing_cycle,status,hours_this_month,renews_on)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [req.user.id, name, category, cost, billing_cycle || 'monthly', status || 'active', hours_this_month || 0, renews_on || null]
    )
    res.status(201).json({ subscription: rows[0] })
  } catch (err) { next(err) }
})

router.put('/:id', async (req, res, next) => {
  try {
    const { name, category, cost, billing_cycle, status, hours_this_month, renews_on } = req.body
    const { rows } = await pool.query(
      `UPDATE subscriptions SET name=$1,category=$2,cost=$3,billing_cycle=$4,status=$5,hours_this_month=$6,renews_on=$7
       WHERE id=$8 AND user_id=$9 RETURNING *`,
      [name, category, cost, billing_cycle, status, hours_this_month, renews_on, req.params.id, req.user.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Not found' })
    res.json({ subscription: rows[0] })
  } catch (err) { next(err) }
})

router.delete('/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM subscriptions WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id])
    res.json({ message: 'Deleted' })
  } catch (err) { next(err) }
})

export default router
