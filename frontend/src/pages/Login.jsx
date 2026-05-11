import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { ArrowRight } from 'lucide-react'
import PrositLogo from '../components/PrositLogo.jsx'

export default function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  // Already logged in → go straight to dashboard
  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [user, navigate])

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
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-700 via-brand-800 to-[#0d0d2e] text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(99,102,241,0.15)_0%,_transparent_60%)]" />
        <div className="relative flex items-center gap-3">
          <PrositLogo size={40} />
          <span className="font-bold tracking-wide text-lg">Prosit</span>
        </div>
        <div className="relative">
          <h1 className="text-4xl font-black leading-tight">
            Welcome<br />back.
          </h1>
          <p className="mt-4 text-brand-200 max-w-xs leading-relaxed">
            Your subscriptions, spending insights, and usage data are right where you left them.
          </p>
          <div className="mt-8 space-y-3">
            {[
              'Real cost-per-hour for every subscription',
              'AI recommendations on what to keep or cut',
              'Renewal alerts before you get charged',
            ].map(t => (
              <div key={t} className="flex items-center gap-2.5 text-sm text-brand-200">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
                {t}
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-xs text-brand-400">Track · Analyze · Optimize</div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#080812]">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <PrositLogo size={32} />
            <span className="font-bold">Prosit</span>
          </div>

          <h2 className="text-2xl font-bold">Sign in</h2>
          <p className="text-sm text-slate-500 mt-1">Enter your credentials to continue.</p>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary w-full mt-2 gap-2 justify-center" disabled={loading}>
              {loading ? 'Signing in…' : <><ArrowRight size={15} /> Sign in</>}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/6 text-center">
            <p className="text-sm text-slate-500">New to Prosit?</p>
            <Link
              to="/"
              className="mt-2 btn-secondary w-full justify-center text-sm block"
            >
              Get started — it's free
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
