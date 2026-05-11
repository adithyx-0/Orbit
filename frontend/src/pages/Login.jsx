import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ email, password })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 to-brand-800 text-white p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center font-bold">P</div>
          <div className="font-semibold tracking-wide">PROSIT</div>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight">Know what your subscriptions actually cost you.</h1>
          <p className="mt-4 text-brand-100 max-w-md">
            PROSIT measures cost-per-hour, ROI and opportunity cost across every subscription you pay for — then
            recommends what to keep, pause, or cancel.
          </p>
        </div>
        <div className="text-xs text-brand-200">Track · Analyze · Optimize</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm">
          <h2 className="text-2xl font-bold">Sign in</h2>
          <p className="text-sm text-slate-500 mt-1">Welcome back. Enter your details below.</p>

          {error && <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

          <div className="mt-6 space-y-4">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full mt-6" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="text-sm text-slate-500 mt-4 text-center">
            No account? <Link className="text-brand-600 font-medium" to="/signup">Create one</Link>
          </p>

        </form>
      </div>
    </div>
  )
}
