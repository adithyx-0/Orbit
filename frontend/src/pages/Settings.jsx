import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../lib/api.js'

const CATEGORIES = ['Learning', 'Entertainment', 'Productivity']

export default function Settings() {
  const { user, logout } = useAuth()
  const [usageForm, setUsageForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    category: 'Learning',
    minutes: 60,
    app_name: '',
  })
  const [usageSaved, setUsageSaved] = useState(false)
  const [usageError, setUsageError] = useState('')
  const [usageSaving, setUsageSaving] = useState(false)

  const setField = (k, v) => setUsageForm(f => ({ ...f, [k]: v }))

  const logUsage = async (e) => {
    e.preventDefault()
    setUsageError('')
    setUsageSaving(true)
    try {
      await api.post('/usage', {
        ...usageForm,
        minutes: Number(usageForm.minutes),
        source: 'manual',
      })
      setUsageSaved(true)
      setTimeout(() => setUsageSaved(false), 2500)
    } catch (err) {
      setUsageError(err.response?.data?.error || 'Failed to log usage')
    } finally {
      setUsageSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-slate-500">Account, usage logging, and app preferences.</p>
      </div>

      {/* Account */}
      <div className="card p-6">
        <h2 className="font-semibold mb-4">Account</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Name</div>
            <div className="font-medium mt-1">{user?.name}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Email</div>
            <div className="font-medium mt-1">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-5 btn-danger text-sm"
        >
          Sign out
        </button>
      </div>

      {/* Manual usage log */}
      <div className="card p-6">
        <h2 className="font-semibold mb-1">Log usage manually</h2>
        <p className="text-sm text-slate-500 mb-4">
          No device agent? Enter your usage here — it powers the Analytics charts and AI recommendations.
        </p>

        <form onSubmit={logUsage} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                className="input"
                value={usageForm.date}
                onChange={e => setField('date', e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
                required
              />
            </div>
            <div>
              <label className="label">Category</label>
              <select
                className="input"
                value={usageForm.category}
                onChange={e => setField('category', e.target.value)}
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Minutes</label>
              <input
                type="number"
                min="1"
                max="1440"
                className="input"
                value={usageForm.minutes}
                onChange={e => setField('minutes', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">App / service (optional)</label>
              <input
                className="input"
                placeholder="e.g. Netflix, Coursera"
                value={usageForm.app_name}
                onChange={e => setField('app_name', e.target.value)}
              />
            </div>
          </div>

          {usageError && (
            <div className="text-sm text-red-400 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
              {usageError}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary" disabled={usageSaving}>
              {usageSaving ? 'Saving…' : 'Log usage'}
            </button>
            {usageSaved && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-400">
                <CheckCircle2 size={14} /> Saved
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Device agents */}
      <div className="card p-6">
        <h2 className="font-semibold">Device agents</h2>
        <p className="text-sm text-slate-500 mt-1 mb-4">
          These companion apps automatically push usage data in the background.
        </p>
        <ul className="space-y-3 text-sm">
          <li className="flex items-center justify-between">
            <span><strong>Android companion</strong> — Kotlin</span>
            <span className="badge bg-slate-500/15 text-slate-400 border border-slate-500/20">Not connected</span>
          </li>
          <li className="flex items-center justify-between">
            <span><strong>Windows desktop agent</strong> — Python</span>
            <span className="badge bg-slate-500/15 text-slate-400 border border-slate-500/20">Not connected</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
