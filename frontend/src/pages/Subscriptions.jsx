import { useMemo, useState } from 'react'
import { Plus, Edit2, Trash2, Pause, Play } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import SubscriptionForm from '../components/SubscriptionForm.jsx'
import Modal from '../components/Modal.jsx'
import { currency, hours, costPerHour, categoryColor, statusColor } from '../lib/format.js'

export default function Subscriptions() {
  const { subscriptions, addSubscription, updateSubscription, deleteSubscription, loading, error } = useData()
  const [openAdd, setOpenAdd] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    return subscriptions.filter(s => {
      if (filter !== 'all' && s.category !== filter) return false
      if (query && !s.name.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
  }, [subscriptions, filter, query])

  const togglePause = (s) =>
    updateSubscription(s.id, { status: s.status === 'active' ? 'paused' : 'active' })

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-500">Loading…</div>
  if (error) return <div className="flex items-center justify-center h-64 text-red-500">{error}</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Subscriptions</h1>
          <p className="text-sm text-slate-500">Track every recurring cost in one place.</p>
        </div>
        <button className="btn-primary" onClick={() => setOpenAdd(true)}>
          <Plus size={16} /> Add subscription
        </button>
      </div>

      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <input
          className="input max-w-xs"
          placeholder="Search by name…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <div className="flex gap-2 flex-wrap">
          {['all', 'Entertainment', 'Learning', 'Productivity', 'Other'].map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`badge px-3 py-1 border transition ${
                filter === c
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white/6 text-slate-400 border-white/8 hover:bg-white/10 hover:text-white'
              }`}
            >
              {c === 'all' ? 'All' : c}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="table-base">
          <thead>
            <tr>
              <th>Service</th>
              <th>Category</th>
              <th className="text-right">Cost</th>
              <th className="text-right">Hours / mo</th>
              <th className="text-right">₹ / hour</th>
              <th>Renews</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="py-12 text-center text-slate-500">No subscriptions match.</td></tr>
            )}
            {filtered.map(s => {
              const cph = costPerHour(s.cost, s.hoursThisMonth)
              return (
                <tr key={s.id}>
                  <td className="font-medium text-white">{s.name}</td>
                  <td><span className={`badge ${categoryColor(s.category)}`}>{s.category}</span></td>
                  <td className="text-right">{currency(s.cost)}<span className="text-xs text-slate-500">/{s.billingCycle.slice(0,2)}</span></td>
                  <td className="text-right">{hours(s.hoursThisMonth)}</td>
                  <td className="text-right">{cph ? currency(cph) : <span className="text-slate-500">—</span>}</td>
                  <td className="text-slate-400">{s.renewsOn || '—'}</td>
                  <td><span className={`badge ${statusColor(s.status)}`}>{s.status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button className="btn-secondary !p-2" title={s.status === 'active' ? 'Pause' : 'Resume'} onClick={() => togglePause(s)}>
                        {s.status === 'active' ? <Pause size={14}/> : <Play size={14}/>}
                      </button>
                      <button className="btn-secondary !p-2" title="Edit" onClick={() => setEditing(s)}>
                        <Edit2 size={14} />
                      </button>
                      <button className="btn-danger !p-2" title="Delete" onClick={() => {
                        if (confirm(`Delete ${s.name}?`)) deleteSubscription(s.id)
                      }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Modal open={openAdd} title="Add subscription" onClose={() => setOpenAdd(false)}>
        <SubscriptionForm
          onCancel={() => setOpenAdd(false)}
          onSubmit={(s) => { addSubscription(s); setOpenAdd(false) }}
        />
      </Modal>

      <Modal open={!!editing} title={`Edit ${editing?.name || ''}`} onClose={() => setEditing(null)}>
        {editing && (
          <SubscriptionForm
            initial={editing}
            onCancel={() => setEditing(null)}
            onSubmit={(patch) => { updateSubscription(editing.id, patch); setEditing(null) }}
          />
        )}
      </Modal>
    </div>
  )
}
