import { useState } from 'react'

const CATEGORIES = ['Entertainment', 'Learning', 'Productivity', 'Other']
const CYCLES = ['monthly', 'quarterly', 'yearly']

export default function SubscriptionForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || {
    name: '',
    category: 'Entertainment',
    cost: '',
    billingCycle: 'monthly',
    renewsOn: '',
    status: 'active',
    hoursThisMonth: 0,
  })
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setError('Name is required')
    if (!form.cost || Number(form.cost) <= 0) return setError('Cost must be greater than 0')
    setError('')
    onSubmit({
      ...form,
      cost: Number(form.cost),
      hoursThisMonth: Number(form.hoursThisMonth) || 0,
    })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

      <div>
        <label className="label">Service name</label>
        <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g., Netflix" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Category</label>
          <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Cost (₹)</label>
          <input type="number" min="0" className="input" value={form.cost} onChange={e => set('cost', e.target.value)} />
        </div>
        <div>
          <label className="label">Billing cycle</label>
          <select className="input" value={form.billingCycle} onChange={e => set('billingCycle', e.target.value)}>
            {CYCLES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Renews on</label>
          <input type="date" className="input" value={form.renewsOn} onChange={e => set('renewsOn', e.target.value)} />
        </div>
        <div>
          <label className="label">Hours used this month</label>
          <input type="number" min="0" step="0.5" className="input" value={form.hoursThisMonth} onChange={e => set('hoursThisMonth', e.target.value)} />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>}
        <button type="submit" className="btn-primary">{initial ? 'Save changes' : 'Add subscription'}</button>
      </div>
    </form>
  )
}
