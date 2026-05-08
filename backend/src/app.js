import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import subscriptionRoutes from './routes/subscriptions.js'
import goalRoutes from './routes/goals.js'
import usageRoutes from './routes/usage.js'
import analyticsRoutes from './routes/analytics.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://prosit-frontend.onrender.com',
  ],
  credentials: true,
}))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/subscriptions', subscriptionRoutes)
app.use('/api/goals', goalRoutes)
app.use('/api/usage', usageRoutes)
app.use('/api/analytics', analyticsRoutes)

app.get('/health', (_, res) => res.json({ status: 'ok' }))

app.use(errorHandler)

export default app
