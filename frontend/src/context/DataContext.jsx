import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api from '../lib/api.js'
import { useAuth } from './AuthContext.jsx'

const DataContext = createContext(null)

const GAMIFICATION_DEFAULT = {
  score:    0,
  starCount: 0,
  breakdown: {
    completedGoals:      0,
    totalGoals:          0,
    inProgressGoals:     0,
    activeSubscriptions: 0,
    completedGoalsPts:   0,
    totalGoalsPts:       0,
    inProgressPts:       0,
    activeSubsPts:       0,
  },
  streak: { currentStreak: 0, longestStreak: 0, lastActiveDate: null },
}

// Coerce a DB date value (string or ISO timestamp) to "YYYY-MM-DD"
function toDateStr(v) {
  if (!v) return null
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v
  return new Date(v).toISOString().slice(0, 10)
}

function toCamel(s) {
  return {
    ...s,
    cost:            parseFloat(s.cost) || 0,
    billingCycle:    s.billing_cycle,
    hoursThisMonth:  parseFloat(s.hours_this_month || 0),
    renewsOn:        toDateStr(s.renews_on),
    paymentMethod:   s.payment_method || null,
  }
}

function toGoal(g) {
  return {
    ...g,
    progress:               parseFloat(g.progress ?? 0),
    target_hours_per_week:  parseFloat(g.target_hours_per_week ?? 0),
    deadline:               toDateStr(g.deadline),
  }
}

function toSnake(s) {
  return {
    name:             s.name,
    category:         s.category,
    cost:             s.cost,
    billing_cycle:    s.billingCycle || s.billing_cycle || 'monthly',
    status:           s.status || 'active',
    hours_this_month: s.hoursThisMonth ?? s.hours_this_month ?? 0,
    renews_on:        s.renewsOn || s.renews_on || null,
    payment_method:   s.paymentMethod || s.payment_method || null,
  }
}

export function DataProvider({ children }) {
  const { user } = useAuth()

  const [subscriptions, setSubscriptions] = useState([])
  const [goals,         setGoals]         = useState([])
  const [usage,         setUsage]         = useState([])
  const [gamification,  setGamification]  = useState(GAMIFICATION_DEFAULT)
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState(null)

  // Fetch just the gamification slice — called after every mutation
  const refreshGamification = useCallback(async () => {
    try {
      const [scoreRes, streakRes] = await Promise.all([
        api.get('/gamification/score'),
        api.get('/gamification/streak'),
      ])
      setGamification({
        score:    scoreRes.data.score,
        starCount: scoreRes.data.starCount,
        breakdown: scoreRes.data.breakdown,
        streak: {
          currentStreak:  streakRes.data.currentStreak,
          longestStreak:  streakRes.data.longestStreak,
          lastActiveDate: streakRes.data.lastActiveDate,
        },
      })
    } catch { /* non-blocking — UI degrades gracefully */ }
  }, [])

  useEffect(() => {
    if (!user) {
      setSubscriptions([])
      setGoals([])
      setUsage([])
      setGamification(GAMIFICATION_DEFAULT)
      return
    }
    setLoading(true)
    setError(null)
    Promise.all([
      api.get('/subscriptions'),
      api.get('/goals'),
      api.get('/usage?days=14'),
      api.get('/gamification/score'),
      api.get('/gamification/streak'),
      api.post('/gamification/streak/ping'),   // record today's activity
    ])
      .then(([s, g, u, score, streak]) => {
        setSubscriptions(s.data.subscriptions.map(toCamel))
        setGoals(g.data.goals.map(toGoal))
        setUsage(u.data.usage)
        setGamification({
          score:    score.data.score,
          starCount: score.data.starCount,
          breakdown: score.data.breakdown,
          streak: {
            currentStreak:  streak.data.currentStreak,
            longestStreak:  streak.data.longestStreak,
            lastActiveDate: streak.data.lastActiveDate,
          },
        })
      })
      .catch(() => setError('Failed to load data. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [user])

  // ── Subscriptions ──────────────────────────────────────────────
  const addSubscription = async (s) => {
    const { data } = await api.post('/subscriptions', toSnake(s))
    setSubscriptions(prev => [toCamel(data.subscription), ...prev])
    refreshGamification()
  }

  const updateSubscription = async (id, patch) => {
    const current = subscriptions.find(s => s.id === id)
    const { data } = await api.put(`/subscriptions/${id}`, toSnake({ ...current, ...patch }))
    setSubscriptions(prev => prev.map(s => s.id === id ? toCamel(data.subscription) : s))
    refreshGamification()
  }

  const deleteSubscription = async (id) => {
    await api.delete(`/subscriptions/${id}`)
    setSubscriptions(prev => prev.filter(s => s.id !== id))
    refreshGamification()
  }

  // ── Goals ──────────────────────────────────────────────────────
  const addGoal = async (g) => {
    const { data } = await api.post('/goals', {
      title:                g.title,
      category:             g.category,
      target_hours_per_week: g.targetHoursPerWeek,
      deadline:             g.deadline || null,
    })
    setGoals(prev => [toGoal(data.goal), ...prev])
    refreshGamification()
  }

  const updateGoal = async (id, patch) => {
    const current = goals.find(g => g.id === id)
    const merged  = { ...current, ...patch }
    const { data } = await api.put(`/goals/${id}`, {
      title:                merged.title,
      category:             merged.category,
      target_hours_per_week: merged.target_hours_per_week,
      deadline:             merged.deadline || null,
      progress:             merged.progress,
    })
    setGoals(prev => prev.map(g => g.id === id ? toGoal(data.goal) : g))
    refreshGamification()
  }

  const deleteGoal = async (id) => {
    await api.delete(`/goals/${id}`)
    setGoals(prev => prev.filter(g => g.id !== id))
    refreshGamification()
  }

  return (
    <DataContext.Provider value={{
      subscriptions, addSubscription, updateSubscription, deleteSubscription,
      goals, addGoal, updateGoal, deleteGoal,
      usage,
      gamification,
      loading,
      error,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside DataProvider')
  return ctx
}
