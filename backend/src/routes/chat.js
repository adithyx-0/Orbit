import { Router } from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { pool } from '../db/pool.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

router.post('/', async (req, res, next) => {
  try {
    const uid = req.user.id
    const { message } = req.body
    if (!message?.trim()) return res.json({ reply: "Hi! Ask me anything about your subscriptions." })

    const [{ rows: subs }, { rows: goals }] = await Promise.all([
      pool.query('SELECT * FROM subscriptions WHERE user_id=$1', [uid]),
      pool.query('SELECT * FROM goals WHERE user_id=$1', [uid]),
    ])

    const active   = subs.filter(s => s.status === 'active')
    const monthly  = active.reduce((a, s) => a + parseFloat(s.cost), 0)
    const totHours = active.reduce((a, s) => a + parseFloat(s.hours_this_month || 0), 0)
    const cph      = totHours > 0 ? (monthly / totHours).toFixed(0) : null
    const unused   = active.filter(s => parseFloat(s.hours_this_month || 0) === 0)

    const subLines = active.length
      ? active.map(s =>
          `  - ${s.name} (${s.category}): ₹${parseFloat(s.cost).toFixed(0)}/mo | ` +
          `${s.hours_this_month || 0}h used | renews ${s.renews_on || 'unknown'} | status: ${s.status}`
        ).join('\n')
      : '  (none yet)'

    const goalLines = goals.length
      ? goals.map(g =>
          `  - ${g.title} (${g.category}): ${g.progress || 0}% done, ` +
          `target ${g.target_hours_per_week || 0}h/week, deadline ${g.deadline || 'none'}`
        ).join('\n')
      : '  (none set)'

    const systemPrompt = `You are Orbit AI, an intelligent personal subscription & resource optimization assistant built into the Orbit app.

You have real-time access to this user's data:

ACTIVE SUBSCRIPTIONS (${active.length} total — ₹${monthly.toFixed(0)}/month):
${subLines}

UNUSED THIS MONTH (0h logged): ${unused.length ? unused.map(s => s.name).join(', ') : 'None — great!'}
TOTAL USAGE HOURS THIS MONTH: ${totHours}h
AVERAGE COST PER HOUR: ${cph ? '₹' + cph + '/hr' : 'N/A (log some hours first)'}

USER GOALS:
${goalLines}

Rules:
- Always use the real data above — never make up numbers
- Use ₹ for currency
- Be concise (under 150 words unless a detailed breakdown is needed)
- Use bullet points for lists, not numbered unless ranking
- Be friendly, direct, and actionable
- If hours are 0 across the board, gently remind the user to log usage
- Suggest cancellations or tier downgrades when ROI is poor`

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent([systemPrompt, `User: ${message.trim()}`])
    const reply  = result.response.text()

    res.json({ reply })
  } catch (err) {
    if (err.message?.includes('API_KEY') || err.message?.includes('API key')) {
      return res.json({ reply: "AI service misconfigured — check GEMINI_API_KEY in the backend .env file." })
    }
    next(err)
  }
})

export default router
