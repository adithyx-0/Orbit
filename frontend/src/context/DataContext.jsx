import { createContext, useContext, useEffect, useState } from 'react'
import { seedSubscriptions, seedGoals, seedUsage } from '../lib/seed.js'

const DataContext = createContext(null)
const KEY_SUBS = 'prosit.subscriptions'
const KEY_GOALS = 'prosit.goals'
const KEY_USAGE = 'prosit.usage'

export function DataProvider({ children }) {
  const [subscriptions, setSubscriptions] = useState([])
  const [goals, setGoals] = useState([])
  const [usage, setUsage] = useState([])

  useEffect(() => {
    setSubscriptions(load(KEY_SUBS, seedSubscriptions))
    setGoals(load(KEY_GOALS, seedGoals))
    setUsage(load(KEY_USAGE, seedUsage))
  }, [])

  useEffect(() => { save(KEY_SUBS, subscriptions) }, [subscriptions])
  useEffect(() => { save(KEY_GOALS, goals) }, [goals])
  useEffect(() => { save(KEY_USAGE, usage) }, [usage])

  const addSubscription = (s) => setSubscriptions(p => [{ ...s, id: 'sub_' + Date.now() }, ...p])
  const updateSubscription = (id, patch) =>
    setSubscriptions(p => p.map(s => s.id === id ? { ...s, ...patch } : s))
  const deleteSubscription = (id) => setSubscriptions(p => p.filter(s => s.id !== id))

  const addGoal = (g) => setGoals(p => [{ ...g, id: 'goal_' + Date.now(), progress: 0 }, ...p])
  const updateGoal = (id, patch) =>
    setGoals(p => p.map(g => g.id === id ? { ...g, ...patch } : g))
  const deleteGoal = (id) => setGoals(p => p.filter(g => g.id !== id))

  const resetData = () => {
    localStorage.removeItem(KEY_SUBS)
    localStorage.removeItem(KEY_GOALS)
    localStorage.removeItem(KEY_USAGE)
    setSubscriptions(seedSubscriptions)
    setGoals(seedGoals)
    setUsage(seedUsage)
  }

  return (
    <DataContext.Provider value={{
      subscriptions, addSubscription, updateSubscription, deleteSubscription,
      goals, addGoal, updateGoal, deleteGoal,
      usage,
      resetData,
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

function load(key, fallback) {
  const raw = localStorage.getItem(key)
  if (!raw) return fallback
  try { return JSON.parse(raw) } catch { return fallback }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}
