import { createContext, useContext, useEffect, useState } from 'react'
import api from '../lib/api.js'
import { useAuth } from './AuthContext.jsx'

const DataContext = createContext(null)

function toCamel(s) {
  return {
    ...s,
    billingCycle: s.billing_cycle,
    hoursThisMonth: parseFloat(s.hours_this_month || 0),
    renewsOn: s.renews_on,
  }
}

function toGoal(g) {
  return {
    ...g,
    progress: parseFloat(g.progress ?? 0),
    target_hours_per_week: parseFloat(g.target_hours_per_week ?? 0),
  }
}

function toSnake(s) {
  return {
    name: s.name,
    category: s.category,
    cost: s.cost,
    billing_cycle: s.billingCycle || s.billing_cycle || 'monthly',
    status: s.status || 'active',
    hours_this_month: s.hoursThisMonth ?? s.hours_this_month ?? 0,
    renews_on: s.renewsOn || s.renews_on || null,
  }
}

export function DataProvider({ children }) {
  const { user } = useAuth()
  const [subscriptions, setSubscriptions] = useState([])
  const [goals, setGoals] = useState([])
  const [usage, setUsage] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      setSubscriptions([])
      setGoals([])
      setUsage([])
      return
    }
    setLoading(true)
    setError(null)
    Promise.all([
      api.get('/subscriptions'),
      api.get('/goals'),
      api.get('/usage?days=14'),
    ])
      .then(([s, g, u]) => {
        setSubscriptions(s.data.subscriptions.map(toCamel))
        setGoals(g.data.goals.map(toGoal))
        setUsage(u.data.usage)
      })
      .catch(() => setError('Failed to load data. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [user])

  const addSubscription = async (s) => {
    const { data } = await api.post('/subscriptions', toSnake(s))
    setSubscriptions(prev => [toCamel(data.subscription), ...prev])
  }

  const updateSubscription = async (id, patch) => {
    const current = subscriptions.find(s => s.id === id)
    const { data } = await api.put(`/subscriptions/${id}`, toSnake({ ...current, ...patch }))
    setSubscriptions(prev => prev.map(s => s.id === id ? toCamel(data.subscription) : s))
  }

  const deleteSubscription = async (id) => {
    await api.delete(`/subscriptions/${id}`)
    setSubscriptions(prev => prev.filter(s => s.id !== id))
  }

  const addGoal = async (g) => {
    const { data } = await api.post('/goals', {
      title: g.title,
      category: g.category,
      target_hours_per_week: g.targetHoursPerWeek,
      deadline: g.deadline || null,
    })
    setGoals(prev => [toGoal(data.goal), ...prev])
  }

  const updateGoal = async (id, patch) => {
    const current = goals.find(g => g.id === id)
    const merged = { ...current, ...patch }
    const { data } = await api.put(`/goals/${id}`, {
      title: merged.title,
      category: merged.category,
      target_hours_per_week: merged.target_hours_per_week,
      deadline: merged.deadline || null,
      progress: merged.progress,
    })
    setGoals(prev => prev.map(g => g.id === id ? toGoal(data.goal) : g))
  }

  const deleteGoal = async (id) => {
    await api.delete(`/goals/${id}`)
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  return (
    <DataContext.Provider value={{
      subscriptions, addSubscription, updateSubscription, deleteSubscription,
      goals, addGoal, updateGoal, deleteGoal,
      usage,
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
