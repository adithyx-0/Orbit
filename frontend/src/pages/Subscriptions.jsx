import { useMemo, useState } from 'react'
import { Plus, Edit2, Trash2, Pause, Play, RefreshCw, CreditCard, Wallet, Smartphone } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import SubscriptionForm from '../components/SubscriptionForm.jsx'
import Modal from '../components/Modal.jsx'
import { currency, hours, costPerHour, categoryColor, categoryHex, statusColor } from '../lib/format.js'

const CATEGORIES = ['All', 'Entertainment', 'Learning', 'Productivity', 'AI Tools', 'Health', 'Utilities', 'Other']

function daysUntil(dateStr) {
  if (!dateStr) return null
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000)
}

function advanceDate(dateStr, cycle) {
  const d = new Date(dateStr)
  if (cycle === 'monthly')   d.setMonth(d.getMonth() + 1)
  else if (cycle === 'quarterly') d.setMonth(d.getMonth() + 3)
  else if (cycle === 'yearly') d.setFullYear(d.getFullYear() + 1)
  return d.toISOString().slice(0, 10)
}

function usageBarColor(h) {
  if (!h || h === 0) return '#EF4444'
  if (h < 5) return '#F59E0B'
  return '#10B981'
}

function PaymentIcon({ method }) {
  const m = (method || '').toLowerCase()
  if (m === 'upi')                   return <Smartphone size={11} />
  if (m === 'credit card' || m === 'debit card') return <CreditCard size={11} />
  if (m === 'wallet')                return <Wallet size={11} />
  return null
}

function RenewalBadge({ dateStr }) {
  const days = daysUntil(dateStr)
  if (days === null) return <span className="text-slate-500 text-xs">No renewal date</span>
  if (days < 0)  return <span className="text-xs font-medium text-red-400">Overdue by {Math.abs(days)}d</span>
  if (days === 0) return <span className="text-xs font-medium text-red-400">Renews today</span>
  if (days <= 5)  return <span className="text-xs font-medium text-amber-400">Renews in {days}d</span>
  return <span className="text-xs text-slate-400">Renews {dateStr} <span className="text-slate-500">({days}d)</span></span>
}

function SubscriptionCard({ s, onEdit, onToggle, onDelete, onRenew }) {
  const cph  = costPerHour(s.cost, s.hoursThisMonth)
  const usagePct = Math.min(100, ((s.hoursThisMonth || 0) / 40) * 100)
  const accent = categoryHex(s.category)

  return (
    <div className="relative rounded-xl border border-white/8 bg-[#0d0d18] overflow-hidden flex flex-col transition-all hover:border-white/16 hover:shadow-lg">
      {/* top accent stripe */}
      <div className="h-0.5 w-full" style={{ background: accent }} />

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* category dot */}
          <div className="mt-1 w-2 h-2 rounded-full shrink-0" style={{ background: accent }} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white truncate">{s.name}</p>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className={`badge text-xs px-2 py-0.5 ${categoryColor(s.category)}`}>{s.category}</span>
              <span className={`badge text-xs px-2 py-0.5 ${statusColor(s.status)}`}>{s.status}</span>
            </div>
          </div>
          {/* Cost block */}
          <div className="text-right shrink-0">
            <p className="text-base font-bold text-white leading-none">
              {currency(s.cost)}
              <span className="text-xs text-slate-500 font-normal ml-0.5">
                /{s.billingCycle === 'yearly' ? 'yr' : s.billingCycle === 'quarterly' ? 'q' : 'mo'}
              </span>
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {cph ? `${currency(cph)}/hr` : <span className="text-slate-600">—/hr</span>}
            </p>
          </div>
        </div>

        {/* Usage bar */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-500">Usage this month</span>
            <span style={{ color: usageBarColor(s.hoursThisMonth) }} className="font-medium">
              {hours(s.hoursThisMonth)}
            </span>
          </div>
          <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${usagePct}%`, background: usageBarColor(s.hoursThisMonth) }}
            />
          </div>
          {s.hoursThisMonth === 0 && (
            <p className="text-xs text-red-400/70 mt-1">Not used — consider cancelling</p>
          )}
        </div>

        {/* Payment method + renewal */}
        <div className="flex items-center justify-between gap-2">
          <RenewalBadge dateStr={s.renewsOn} />
          {s.paymentMethod && (
            <span className="flex items-center gap-1 text-xs bg-white/6 border border-white/8 text-slate-400 rounded-full px-2 py-0.5">
              <PaymentIcon method={s.paymentMethod} />
              {s.paymentMethod}
            </span>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="border-t border-white/6 px-4 py-2.5 flex items-center justify-between gap-2 bg-white/[0.02]">
        <button
          onClick={() => s.renewsOn && onRenew(s)}
          disabled={!s.renewsOn}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-brand-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Mark as renewed — advances renewal date"
        >
          <RefreshCw size={12} />
          Renew
        </button>

        <div className="flex gap-1">
          <button
            className="btn-secondary !p-1.5 !text-xs"
            title={s.status === 'active' ? 'Pause' : 'Resume'}
            onClick={() => onToggle(s)}
          >
            {s.status === 'active' ? <Pause size={13} /> : <Play size={13} />}
          </button>
          <button className="btn-secondary !p-1.5" title="Edit" onClick={() => onEdit(s)}>
            <Edit2 size={13} />
          </button>
          <button
            className="btn-danger !p-1.5"
            title="Delete"
            onClick={() => { if (confirm(`Delete ${s.name}?`)) onDelete(s.id) }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Subscriptions() {
  const { subscriptions, addSubscription, updateSubscription, deleteSubscription, loading, error } = useData()
  const [openAdd, setOpenAdd]   = useState(false)
  const [editing, setEditing]   = useState(null)
  const [filter, setFilter]     = useState('All')
  const [query, setQuery]       = useState('')
  const [sortBy, setSortBy]     = useState('name')

  const filtered = useMemo(() => {
    let list = subscriptions.filter(s => {
      if (filter !== 'All' && s.category !== filter) return false
      if (query && !s.name.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
    if (sortBy === 'cost')    list = [...list].sort((a, b) => b.cost - a.cost)
    if (sortBy === 'usage')   list = [...list].sort((a, b) => (b.hoursThisMonth || 0) - (a.hoursThisMonth || 0))
    if (sortBy === 'renewal') list = [...list].sort((a, b) => {
      if (!a.renewsOn) return 1
      if (!b.renewsOn) return -1
      return new Date(a.renewsOn) - new Date(b.renewsOn)
    })
    if (sortBy === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [subscriptions, filter, query, sortBy])

  const stats = useMemo(() => {
    const active  = subscriptions.filter(s => s.status === 'active')
    const monthly = active.reduce((sum, s) => {
      if (s.billingCycle === 'yearly')     return sum + s.cost / 12
      if (s.billingCycle === 'quarterly')  return sum + s.cost / 3
      return sum + s.cost
    }, 0)
    const unused  = active.filter(s => !s.hoursThisMonth || s.hoursThisMonth === 0).length
    const totalH  = active.reduce((sum, s) => sum + (s.hoursThisMonth || 0), 0)
    const avgCph  = totalH > 0 ? monthly / totalH : null
    return { active: active.length, monthly, unused, avgCph }
  }, [subscriptions])

  const handleRenew = (s) => {
    if (!s.renewsOn) return
    const next = advanceDate(s.renewsOn, s.billingCycle || 'monthly')
    if (confirm(`Mark as renewed? Next renewal: ${next}`)) {
      updateSubscription(s.id, { renewsOn: next })
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-500">Loading…</div>
  if (error)   return <div className="flex items-center justify-center h-64 text-red-500">{error}</div>

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Subscriptions</h1>
          <p className="text-sm text-slate-500">Track every recurring cost in one place.</p>
        </div>
        <button className="btn-primary" onClick={() => setOpenAdd(true)}>
          <Plus size={16} /> Add subscription
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4">
          <p className="text-xs text-slate-500 mb-1">Monthly spend</p>
          <p className="text-xl font-bold text-white">{currency(stats.monthly)}</p>
          <p className="text-xs text-slate-500">normalised to /mo</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500 mb-1">Active services</p>
          <p className="text-xl font-bold text-white">{stats.active}</p>
          <p className="text-xs text-slate-500">of {subscriptions.length} total</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500 mb-1">Unused this month</p>
          <p className={`text-xl font-bold ${stats.unused > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{stats.unused}</p>
          <p className="text-xs text-slate-500">0 hours logged</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500 mb-1">Avg cost / hour</p>
          <p className="text-xl font-bold text-white">{stats.avgCph ? currency(stats.avgCph) : '—'}</p>
          <p className="text-xs text-slate-500">across active subs</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <input
          className="input max-w-xs"
          placeholder="Search by name…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <div className="flex gap-2 flex-wrap flex-1">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`badge px-3 py-1 border transition text-xs ${
                filter === c
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white/6 text-slate-400 border-white/8 hover:bg-white/10 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <select
          className="input !w-auto text-xs"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
        >
          <option value="name">Sort: Name</option>
          <option value="cost">Sort: Cost ↓</option>
          <option value="usage">Sort: Usage ↓</option>
          <option value="renewal">Sort: Renewal ↑</option>
        </select>
      </div>

      {/* Card grid */}
      {filtered.length === 0 ? (
        <div className="card py-16 text-center text-slate-500">
          {subscriptions.length === 0
            ? 'No subscriptions yet — add your first one.'
            : 'No subscriptions match the current filter.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(s => (
            <SubscriptionCard
              key={s.id}
              s={s}
              onEdit={setEditing}
              onToggle={sub => updateSubscription(sub.id, { status: sub.status === 'active' ? 'paused' : 'active' })}
              onDelete={deleteSubscription}
              onRenew={handleRenew}
            />
          ))}
        </div>
      )}

      {/* Modals */}
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
