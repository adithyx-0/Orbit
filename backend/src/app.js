import 'dotenv/config'
import express from 'express'
import authRoutes from './routes/auth.js'
import subscriptionRoutes from './routes/subscriptions.js'
import goalRoutes from './routes/goals.js'
import usageRoutes from './routes/usage.js'
import analyticsRoutes from './routes/analytics.js'
import chatRoutes from './routes/chat.js'
import gamificationRoutes from './routes/gamification.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  if (req.method === 'OPTIONS') return res.status(204).end()
  next()
})
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/subscriptions', subscriptionRoutes)
app.use('/api/goals', goalRoutes)
app.use('/api/usage', usageRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/gamification', gamificationRoutes)

app.get('/health', (_, res) => res.json({ status: 'ok' }))

app.use(errorHandler)

export default app
