import { Router } from 'express'
import { pool } from '../db/pool.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

router.get('/summary', async (req, res, next) => {
  try {
    const uid = req.user.id

    const { rows: subs } = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id=$1', [uid]
    )

    const active = subs.filter(s => s.status === 'active')
    const monthlySpend = active.reduce((a, s) => a + parseFloat(s.cost), 0)
    const totalHours = active.reduce((a, s) => a + parseFloat(s.hours_this_month || 0), 0)
    const costPerHour = totalHours > 0 ? monthlySpend / totalHours : null
    const unusedCount = active.filter(s => parseFloat(s.hours_this_month || 0) === 0).length

    const byCategory = {}
    for (const s of active) {
      byCategory[s.category] = (byCategory[s.category] || 0) + parseFloat(s.cost)
    }

    // Basic rule-based recommendations
    const recommendations = []
    for (const s of active) {
      const hours = parseFloat(s.hours_this_month || 0)
      const cost = parseFloat(s.cost)
      if (hours === 0) {
        recommendations.push({ id: `rec_${s.id}`, severity: 'high', title: `Cancel ${s.name}?`, body: `You haven't used ${s.name} this month but it costs ₹${cost}.`, action: 'Review' })
      } else if (cost / hours > 500) {
        recommendations.push({ id: `rec_cph_${s.id}`, severity: 'medium', title: `${s.name} is expensive per hour`, body: `₹${(cost / hours).toFixed(0)}/hr — consider reducing usage time or cancelling.`, action: 'Review' })
      }
    }

    res.json({ monthlySpend, costPerHour, unusedCount, activeCount: active.length, byCategory, recommendations })
  } catch (err) { next(err) }
})

export default router
