import { Router } from 'express'
import { pool } from '../db/pool.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

// Generates 14 days of usage dates up to today
function usageDates() {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    return d.toISOString().slice(0, 10)
  })
}

// Deterministic daily usage minutes [learning, entertainment, productivity]
const USAGE_PATTERN = [
  [45, 120, 60],
  [60, 90,  75],
  [30, 150, 45],
  [75, 60,  90],
  [50, 180, 30],
  [90, 45, 120],
  [40, 200, 60],
  [65, 75,  80],
  [80, 130, 40],
  [55, 90, 100],
  [70, 60, 110],
  [35, 160, 55],
  [85, 80,  95],
  [60, 110, 70],
]

const DEMO_SUBSCRIPTIONS = [
  { name: 'Netflix',              category: 'Entertainment', cost: 649,  billing_cycle: 'monthly',   status: 'active', hours_this_month: 18, renews_on: '2026-06-03', payment_method: 'UPI' },
  { name: 'Spotify',              category: 'Entertainment', cost: 119,  billing_cycle: 'monthly',   status: 'active', hours_this_month: 45, renews_on: '2026-06-15', payment_method: 'UPI' },
  { name: 'YouTube Premium',      category: 'Entertainment', cost: 139,  billing_cycle: 'monthly',   status: 'active', hours_this_month: 60, renews_on: '2026-06-08', payment_method: 'UPI' },
  { name: 'ChatGPT Plus',         category: 'AI Tools',      cost: 1680, billing_cycle: 'monthly',   status: 'active', hours_this_month: 22, renews_on: '2026-06-01', payment_method: 'Credit Card' },
  { name: 'GitHub Copilot',       category: 'AI Tools',      cost: 840,  billing_cycle: 'monthly',   status: 'active', hours_this_month: 38, renews_on: '2026-06-12', payment_method: 'Credit Card' },
  { name: 'Notion Pro',           category: 'Productivity',  cost: 840,  billing_cycle: 'monthly',   status: 'active', hours_this_month: 30, renews_on: '2026-06-19', payment_method: 'Debit Card' },
  { name: 'Adobe Creative Cloud', category: 'Productivity',  cost: 1676, billing_cycle: 'monthly',   status: 'active', hours_this_month: 4,  renews_on: '2026-06-05', payment_method: 'Invoice' },
  { name: 'LinkedIn Premium',     category: 'Productivity',  cost: 2999, billing_cycle: 'monthly',   status: 'paused', hours_this_month: 0,  renews_on: '2026-06-28', payment_method: 'Credit Card' },
  { name: 'Coursera Plus',        category: 'Learning',      cost: 4133, billing_cycle: 'monthly',   status: 'active', hours_this_month: 8,  renews_on: '2026-06-10', payment_method: 'Credit Card' },
  { name: 'Udemy Subscription',   category: 'Learning',      cost: 830,  billing_cycle: 'monthly',   status: 'active', hours_this_month: 0,  renews_on: '2026-06-22', payment_method: 'Debit Card' },
  { name: 'Headspace',            category: 'Health',        cost: 5499, billing_cycle: 'yearly',    status: 'active', hours_this_month: 12, renews_on: '2027-01-15', payment_method: 'UPI' },
  { name: 'Google One 200GB',     category: 'Utilities',     cost: 210,  billing_cycle: 'monthly',   status: 'active', hours_this_month: 0,  renews_on: '2026-06-01', payment_method: 'UPI' },
]

const DEMO_GOALS = [
  { title: 'Learn React + TypeScript deeply',       category: 'Learning',      target_hours_per_week: 6,  deadline: '2026-08-01', progress: 65 },
  { title: 'Complete ML Specialization on Coursera', category: 'Learning',     target_hours_per_week: 8,  deadline: '2026-09-30', progress: 35 },
  { title: 'Build and ship a side project',          category: 'Productivity', target_hours_per_week: 5,  deadline: '2026-07-15', progress: 20 },
  { title: 'Daily meditation streak — 30 days',      category: 'Health',       target_hours_per_week: 1,  deadline: '2026-05-20', progress: 100 },
  { title: 'Read 12 books this year',                category: 'Entertainment',target_hours_per_week: 3,  deadline: '2026-12-31', progress: 42 },
  { title: 'Launch Orbit to 100 active users',       category: 'Productivity', target_hours_per_week: 10, deadline: '2026-10-01', progress: 15 },
]

router.post('/', async (req, res, next) => {
  const client = await pool.connect()
  try {
    const uid = req.user.id
    await client.query('BEGIN')

    // Wipe existing user data
    await client.query('DELETE FROM usage_logs   WHERE user_id=$1', [uid])
    await client.query('DELETE FROM goals        WHERE user_id=$1', [uid])
    await client.query('DELETE FROM subscriptions WHERE user_id=$1', [uid])

    // Insert subscriptions
    for (const s of DEMO_SUBSCRIPTIONS) {
      await client.query(
        `INSERT INTO subscriptions
           (user_id,name,category,cost,billing_cycle,status,hours_this_month,renews_on,payment_method)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [uid, s.name, s.category, s.cost, s.billing_cycle, s.status,
         s.hours_this_month, s.renews_on, s.payment_method]
      )
    }

    // Insert goals
    for (const g of DEMO_GOALS) {
      await client.query(
        `INSERT INTO goals (user_id,title,category,target_hours_per_week,deadline,progress)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [uid, g.title, g.category, g.target_hours_per_week, g.deadline, g.progress]
      )
    }

    // Insert 14 days of usage logs
    const dates = usageDates()
    for (let i = 0; i < dates.length; i++) {
      const [learning, entertainment, productivity] = USAGE_PATTERN[i]
      await client.query(
        `INSERT INTO usage_logs (user_id,date,category,minutes,source)
         VALUES ($1,$2,'Learning',$3,'seed'),
                ($1,$2,'Entertainment',$4,'seed'),
                ($1,$2,'Productivity',$5,'seed')`,
        [uid, dates[i], learning, entertainment, productivity]
      )
    }

    // Seed streak: set to 7-day current, 14-day longest
    const today = new Date().toISOString().slice(0, 10)
    await client.query(
      `INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_active_date)
       VALUES ($1, 7, 14, $2)
       ON CONFLICT (user_id) DO UPDATE
         SET current_streak=7, longest_streak=14, last_active_date=$2`,
      [uid, today]
    )

    await client.query('COMMIT')
    res.json({
      ok: true,
      inserted: {
        subscriptions: DEMO_SUBSCRIPTIONS.length,
        goals:         DEMO_GOALS.length,
        usage_days:    dates.length,
      },
    })
  } catch (err) {
    await client.query('ROLLBACK')
    next(err)
  } finally {
    client.release()
  }
})

export default router
