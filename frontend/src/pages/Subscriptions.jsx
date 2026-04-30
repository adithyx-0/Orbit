import { useMemo, useState } from 'react'
import { Plus, Edit2, Trash2, Pause, Play } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import SubscriptionForm from '../components/SubscriptionForm.jsx'
import Modal from '../components/Modal.jsx'
import { currency, hours, costPerHour, categoryColor, statusColor } from '../lib/format.js'

export default function Subscriptions() {
  const { subscriptions, addSubscription, updateSubscription, deleteSubscription } = useData()
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
                filter === c ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {c === 'all' ? 'All' : c}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Service</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-right px-4 py-3">Cost</th>
              <th className="text-right px-4 py-3">Hours / mo</th>
              <th className="text-right px-4 py-3">₹ / hour</th>
              <th className="text-left px-4 py-3">Renews</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="py-12 text-center text-slate-400">No subscriptions match.</td></tr>
            )}
            {filtered.map(s => {
              const cph = costPerHour(s.cost, s.hoursThisMonth)
              return (
                <tr key={s.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3"><span className={`badge ${categoryColor(s.category)}`}>{s.category}</span></td>
                  <td className="px-4 py-3 text-right">{currency(s.cost)}<span className="text-xs text-slate-400">/{s.billingCycle.slice(0,2)}</span></td>
                  <td className="px-4 py-3 text-right">{hours(s.hoursThisMonth)}</td>
                  <td className="px-4 py-3 text-right">{cph ? currency(cph) : <span className="text-slate-400">—</span>}</td>
                  <td className="px-4 py-3 text-slate-600">{s.renewsOn || '—'}</td>
                  <td className="px-4 py-3"><span className={`badge ${statusColor(s.status)}`}>{s.status}</span></td>
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
