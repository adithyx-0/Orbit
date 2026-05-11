import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import subscriptionRoutes from './routes/subscriptions.js'
import goalRoutes from './routes/goals.js'
import usageRoutes from './routes/usage.js'
import analyticsRoutes from './routes/analytics.js'
import chatRoutes from './routes/chat.js'
import gamificationRoutes from './routes/gamification.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

app.use(cors({
  origin: (origin, callback) => {
    // Allow: no origin (curl/mobile), localhost dev, any *.onrender.com deploy, or explicit FRONTEND_URL
    if (
      !origin ||
      origin.startsWith('http://localhost') ||
      origin.endsWith('.onrender.com') ||
      origin === process.env.FRONTEND_URL
    ) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))
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
