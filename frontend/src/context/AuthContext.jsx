import { createContext, useContext, useEffect, useState } from 'react'
import api from '../lib/api.js'

const AuthContext = createContext(null)
const STORAGE_KEY = 'prosit.auth'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try { setUser(JSON.parse(raw).user) } catch { /* ignore */ }
    }
    setLoading(false)
  }, [])

  const login = async ({ email, password }) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    setUser(data.user)
    return data
  }

  const signup = async ({ name, email, password }) => {
    const { data } = await api.post('/auth/register', { name, email, password })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    setUser(data.user)
    return data
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
