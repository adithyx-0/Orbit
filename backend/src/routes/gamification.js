import { Router } from 'express'
import { pool } from '../db/pool.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

async function computeUserScore(userId) {
  const [{ rows: goals }, { rows: subs }] = await Promise.all([
    pool.query('SELECT progress FROM goals WHERE user_id=$1', [userId]),
    pool.query('SELECT status FROM subscriptions WHERE user_id=$1', [userId]),
  ])

  const completedGoals      = goals.filter(g => parseFloat(g.progress) >= 100).length
  const totalGoals          = goals.length
  const inProgressGoals     = goals.filter(g => parseFloat(g.progress) >= 25 && parseFloat(g.progress) < 100).length
  const activeSubscriptions = subs.filter(s => s.status === 'active').length

  const score =
    completedGoals      * 30 +
    totalGoals          * 10 +
    inProgressGoals     * 5  +
    activeSubscriptions * 5

  return {
    score,
    starCount: completedGoals,
    breakdown: {
      completedGoals,
      totalGoals,
      inProgressGoals,
      activeSubscriptions,
      completedGoalsPts: completedGoals      * 30,
      totalGoalsPts:     totalGoals          * 10,
      inProgressPts:     inProgressGoals     * 5,
      activeSubsPts:     activeSubscriptions * 5,
    },
  }
}

// GET /api/gamification/score
router.get('/score', async (req, res, next) => {
  try {
    const data = await computeUserScore(req.user.id)
    res.json(data)
  } catch (err) { next(err) }
})

// GET /api/gamification/streak
router.get('/streak', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM user_streaks WHERE user_id=$1',
      [req.user.id]
    )
    if (!rows[0]) {
      return res.json({ currentStreak: 0, longestStreak: 0, lastActiveDate: null })
    }
    const { current_streak, longest_streak, last_active_date } = rows[0]
    res.json({
      currentStreak:  current_streak,
      longestStreak:  longest_streak,
      lastActiveDate: last_active_date,
    })
  } catch (err) { next(err) }
})

// POST /api/gamification/streak/ping  — call once per session on login
router.post('/streak/ping', async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10)
    const { rows } = await pool.query(
      'SELECT * FROM user_streaks WHERE user_id=$1',
      [req.user.id]
    )

    if (!rows[0]) {
      await pool.query(
        `INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_active_date)
         VALUES ($1, 1, 1, $2)`,
        [req.user.id, today]
      )
      return res.json({ currentStreak: 1, longestStreak: 1, lastActiveDate: today })
    }

    const { current_streak, longest_streak, last_active_date } = rows[0]
    const diffDays = Math.floor(
      (new Date(today) - new Date(last_active_date)) / 86_400_000
    )

    if (diffDays === 0) {
      return res.json({
        currentStreak:  current_streak,
        longestStreak:  longest_streak,
        lastActiveDate: last_active_date,
      })
    }

    const newStreak  = diffDays === 1 ? current_streak + 1 : 1
    const newLongest = Math.max(longest_streak, newStreak)

    await pool.query(
      `UPDATE user_streaks
       SET current_streak=$1, longest_streak=$2, last_active_date=$3
       WHERE user_id=$4`,
      [newStreak, newLongest, today, req.user.id]
    )

    res.json({ currentStreak: newStreak, longestStreak: newLongest, lastActiveDate: today })
  } catch (err) { next(err) }
})

export default router
