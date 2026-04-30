import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)
const STORAGE_KEY = 'prosit.auth'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try { setUser(JSON.parse(raw)) } catch { /* ignore */ }
    }
    setLoading(false)
  }, [])

  const login = async ({ email, password }) => {
    // Mock auth — replace with real API call once backend exists.
    if (!email || !password) throw new Error('Email and password required')
    const session = {
      id: 'u_' + btoa(email).slice(0, 8),
      email,
      name: email.split('@')[0],
      token: 'mock.jwt.' + Date.now(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    setUser(session)
    return session
  }

  const signup = async ({ name, email, password }) => {
    if (!name || !email || !password) throw new Error('All fields are required')
    const session = {
      id: 'u_' + btoa(email).slice(0, 8),
      email,
      name,
      token: 'mock.jwt.' + Date.now(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    setUser(session)
    return session
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
