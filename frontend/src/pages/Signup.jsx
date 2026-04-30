import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await signup(form)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <form onSubmit={submit} className="w-full max-w-sm card p-8">
        <h2 className="text-2xl font-bold">Create account</h2>
        <p className="text-sm text-slate-500 mt-1">Start tracking your subscriptions in 30 seconds.</p>

        {error && <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}

        <div className="mt-6 space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={form.password} onChange={e => set('password', e.target.value)} />
          </div>
        </div>

        <button type="submit" className="btn-primary w-full mt-6" disabled={loading}>
          {loading ? 'Creating…' : 'Create account'}
        </button>

        <p className="text-sm text-slate-500 mt-4 text-center">
          Already have an account? <Link className="text-brand-600 font-medium" to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  )
}
