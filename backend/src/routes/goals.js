import { Router } from 'express'
import { pool } from '../db/pool.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM goals WHERE user_id=$1 ORDER BY created_at DESC',
      [req.user.id]
    )
    res.json({ goals: rows })
  } catch (err) { next(err) }
})

router.post('/', async (req, res, next) => {
  try {
    const { title, category, target_hours_per_week, deadline } = req.body
    if (!title) return res.status(400).json({ error: 'title is required' })
    const { rows } = await pool.query(
      `INSERT INTO goals (user_id,title,category,target_hours_per_week,deadline)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.user.id, title, category || null, target_hours_per_week || null, deadline || null]
    )
    res.status(201).json({ goal: rows[0] })
  } catch (err) { next(err) }
})

router.put('/:id', async (req, res, next) => {
  try {
    const { title, category, target_hours_per_week, deadline, progress } = req.body
    const { rows } = await pool.query(
      `UPDATE goals SET title=$1,category=$2,target_hours_per_week=$3,deadline=$4,progress=$5
       WHERE id=$6 AND user_id=$7 RETURNING *`,
      [title, category, target_hours_per_week, deadline, progress, req.params.id, req.user.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Not found' })
    res.json({ goal: rows[0] })
  } catch (err) { next(err) }
})

router.delete('/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM goals WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id])
    res.json({ message: 'Deleted' })
  } catch (err) { next(err) }
})

export default router
