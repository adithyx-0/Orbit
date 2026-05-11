import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { pool } from '../db/pool.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'name, email and password are required' })

    const hash = await bcrypt.hash(password, 10)
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1,$2,$3) RETURNING id, name, email',
      [name, email, hash]
    )
    const user = rows[0]
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({ user, token })
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already registered' })
    next(err)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'email and password are required' })

    const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email])
    const user = rows[0]
    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ user: { id: user.id, name: user.name, email: user.email }, token })
  } catch (err) {
    next(err)
  }
})

router.put('/profile', requireAuth, async (req, res, next) => {
  try {
    const { name, currentPassword, newPassword } = req.body
    const { rows } = await pool.query('SELECT * FROM users WHERE id=$1', [req.user.id])
    const user = rows[0]
    if (!user) return res.status(404).json({ error: 'User not found' })

    const updates = {}
    if (name && name.trim() && name.trim() !== user.name) updates.name = name.trim()

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ error: 'Current password is required' })
      const match = await bcrypt.compare(currentPassword, user.password_hash)
      if (!match) return res.status(401).json({ error: 'Current password is incorrect' })
      if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' })
      updates.password_hash = await bcrypt.hash(newPassword, 10)
    }

    if (Object.keys(updates).length === 0)
      return res.json({ user: { id: user.id, name: user.name, email: user.email } })

    const cols = Object.keys(updates).map((k, i) => `${k}=$${i + 2}`).join(', ')
    const { rows: updated } = await pool.query(
      `UPDATE users SET ${cols} WHERE id=$1 RETURNING id, name, email`,
      [req.user.id, ...Object.values(updates)]
    )
    res.json({ user: updated[0] })
  } catch (err) { next(err) }
})

export default router
