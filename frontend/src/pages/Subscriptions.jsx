import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Plus, Edit2, Trash2, Pause, Play, RefreshCw,
  CreditCard, Wallet, Smartphone, X, CheckCircle2,
  ExternalLink, ChevronDown, ChevronUp,
} from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import SubscriptionForm from '../components/SubscriptionForm.jsx'
import Modal from '../components/Modal.jsx'
import { currency, hours, costPerHour, categoryColor, categoryHex, statusColor } from '../lib/format.js'

const CATEGORIES = ['All', 'Entertainment', 'Learning', 'Productivity', 'AI Tools', 'Health', 'Utilities', 'Other']

// ── Utility helpers (defined first so RenewModal can use them) ────────────────

function daysUntil(dateStr) {
  if (!dateStr) return null
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000)
}

function advanceDate(dateStr, cycle) {
  const d = new Date(dateStr)
  if (cycle === 'yearly')      d.setFullYear(d.getFullYear() + 1)
  else if (cycle === 'quarterly') d.setMonth(d.getMonth() + 3)
  else                         d.setMonth(d.getMonth() + 1)
  return d.toISOString().slice(0, 10)
}

function usageBarColor(h) {
  if (!h || h === 0) return '#EF4444'
  if (h < 5) return '#F59E0B'
  return '#10B981'
}

// ── Payment data ──────────────────────────────────────────────────────────────

const UPI_OPTIONS = [
  { name: 'Google Pay', color: '#4285F4', letter: 'G', url: 'https://pay.google.com' },
  { name: 'PhonePe',    color: '#5f259f', letter: 'P', url: 'https://www.phonepe.com' },
  { name: 'Paytm',      color: '#00BAF2', letter: 'P', url: 'https://paytm.com' },
  { name: 'BHIM',       color: '#FF6B2C', letter: 'B', url: 'https://www.bhimupi.org.in' },
  { name: 'Amazon Pay', color: '#FF9900', letter: 'A', url: 'https://www.amazon.in/Pay' },
  { name: 'CRED',       color: '#1c1c2e', letter: 'C', url: 'https://cred.club' },
]

const NET_BANKING = [
  { name: 'SBI',      color: '#2b3e91', url: 'https://retail.onlinesbi.sbi/retail/login.htm' },
  { name: 'HDFC',     color: '#004c8f', url: 'https://netbanking.hdfcbank.com/netbanking/' },
  { name: 'ICICI',    color: '#f26522', url: 'https://infinity.icicibank.com' },
  { name: 'Axis',     color: '#c41230', url: 'https://www.axisbank.com/online-banking' },
  { name: 'Kotak',    color: '#ef4444', url: 'https://netbanking.kotak.com/knb2/' },
  { name: 'PNB',      color: '#1e3a5f', url: 'https://www.netpnb.com' },
  { name: 'BoB',      color: '#f97316', url: 'https://www.bobibanking.com' },
  { name: 'Canara',   color: '#0ea5e9', url: 'https://netbanking.canarabank.in' },
  { name: 'Yes Bank', color: '#1d9e75', url: 'https://netbanking.yesbank.in' },
  { name: 'IndusInd', color: '#6366f1', url: 'https://indusnet.indusind.com' },
  { name: 'IDBI',     color: '#7c3aed', url: 'https://www.idbibank.in' },
  { name: 'Union',    color: '#dc2626', url: 'https://www.unionbankofindia.co.in/ebanking' },
]

const SUB_SITE_MAP = {
  'netflix':           'https://www.netflix.com/yourAccount',
  'spotify':           'https://www.spotify.com/account/subscription/',
  'youtube premium':   'https://www.youtube.com/paid_memberships',
  'youtube':           'https://www.youtube.com/paid_memberships',
  'chatgpt':           'https://chat.openai.com',
  'openai':            'https://platform.openai.com/account/billing',
  'github copilot':    'https://github.com/settings/copilot',
  'github':            'https://github.com/settings/billing',
  'notion':            'https://notion.so/pricing',
  'adobe':             'https://account.adobe.com',
  'linkedin premium':  'https://www.linkedin.com/premium/manage',
  'linkedin':          'https://www.linkedin.com/premium/manage',
  'coursera':          'https://www.coursera.org/account-profile',
  'udemy':             'https://www.udemy.com/user/edit-account/',
  'headspace':         'https://www.headspace.com/account',
  'google one':        'https://one.google.com',
  'amazon prime':      'https://www.amazon.in/prime',
  'amazon':            'https://www.amazon.in/prime',
  'hotstar':           'https://www.hotstar.com/account',
  'disney':            'https://www.hotstar.com/account',
  'zee5':              'https://www.zee5.com/account',
  'sonyliv':           'https://www.sonyliv.com/account',
  'microsoft 365':     'https://account.microsoft.com/services',
  'microsoft':         'https://account.microsoft.com/services',
  'dropbox':           'https://www.dropbox.com/account/plan',
  'slack':             'https://slack.com/intl/en-in/pricing',
  'figma':             'https://www.figma.com/pricing/',
  'canva':             'https://www.canva.com/pricing/',
}

function getSubUrl(name) {
  const key = (name || '').toLowerCase()
  for (const [k, url] of Object.entries(SUB_SITE_MAP)) {
    if (key.includes(k)) return url
  }
  return `https://www.google.com/search?q=${encodeURIComponent(name + ' subscription manage payment')}`
}

function openLink(url) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

// ── RenewModal ────────────────────────────────────────────────────────────────

function RenewModal({ sub, onClose, onMarkRenewed }) {
  const [showAllBanks, setShowAllBanks] = useState(false)

  if (!sub) return null

  const accent = categoryHex(sub.category)
  const cycle  = sub.billingCycle || sub.billing_cycle || 'monthly'
  const next   = sub.renewsOn ? advanceDate(sub.renewsOn, cycle) : null
  const banks  = showAllBanks ? NET_BANKING : NET_BANKING.slice(0, 8)
  const cycleLabel = cycle === 'yearly' ? 'yr' : cycle === 'quarterly' ? 'q' : 'mo'

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <motion.div
        className="relative w-full sm:max-w-md bg-[#0d0d18] border border-white/10 rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
      >
        {/* accent top stripe */}
        <div className="h-1 w-full" style={{ background: accent }} />

        {/* drag pill — mobile */}
        <div className="flex justify-center pt-2.5 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* ── Header ── */}
        <div className="px-5 pt-3 pb-4 border-b border-white/8 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0"
              style={{ background: accent }}
            >
              {(sub.name || '?')[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-white font-bold leading-tight">{sub.name}</h2>
              <p className="text-sm text-slate-400">
                {currency(sub.cost)}
                <span className="text-slate-600 ml-0.5">/{cycleLabel}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white mt-0.5 shrink-0 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Renewal dates banner */}
        {sub.renewsOn && (
          <div className="mx-5 mt-3 px-3 py-2 bg-white/5 rounded-lg text-xs text-slate-400 flex flex-wrap items-center gap-1.5">
            <span>Renews <span className="text-white font-medium">{sub.renewsOn}</span></span>
            {next && (
              <>
                <span className="text-slate-600">→</span>
                <span className="text-brand-400 font-medium">{next}</span>
                <span className="text-slate-600">after payment</span>
              </>
            )}
          </div>
        )}

        {/* ── Scrollable body ── */}
        <div className="px-5 py-4 space-y-5 max-h-[52vh] overflow-y-auto">

          {/* UPI Apps */}
          <section>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">UPI Apps</p>
            <div className="grid grid-cols-3 gap-2">
              {UPI_OPTIONS.map(opt => (
                <button
                  key={opt.name}
                  onClick={() => openLink(opt.url)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-white/8 bg-white/3 hover:bg-white/10 hover:border-white/20 transition-all group"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base shadow-md"
                    style={{ background: opt.color }}
                  >
                    {opt.letter}
                  </div>
                  <span className="text-[11px] text-slate-400 group-hover:text-white transition-colors text-center leading-tight">
                    {opt.name}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Net Banking */}
          <section>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">Net Banking</p>
            <div className="grid grid-cols-4 gap-2">
              {banks.map(bank => (
                <button
                  key={bank.name}
                  onClick={() => openLink(bank.url)}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-white/8 bg-white/3 hover:bg-white/10 hover:border-white/20 transition-all group"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-[10px]"
                    style={{ background: bank.color }}
                  >
                    {bank.name.slice(0, 4).toUpperCase()}
                  </div>
                  <span className="text-[10px] text-slate-400 group-hover:text-white transition-colors text-center leading-tight">
                    {bank.name}
                  </span>
                </button>
              ))}
            </div>
            {NET_BANKING.length > 8 && (
              <button
                onClick={() => setShowAllBanks(v => !v)}
                className="mt-2 w-full flex items-center justify-center gap-1 text-xs text-slate-500 hover:text-slate-300 py-1.5 transition-colors"
              >
                {showAllBanks
                  ? <><ChevronUp size={13} /> Show less</>
                  : <><ChevronDown size={13} /> {NET_BANKING.length - 8} more banks</>}
              </button>
            )}
          </section>

          {/* Manage on subscription website */}
          <section>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">Manage on Website</p>
            <button
              onClick={() => openLink(getSubUrl(sub.name))}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/8 bg-white/3 hover:bg-white/10 hover:border-white/20 transition-all group text-left"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-base shrink-0"
                style={{ background: accent }}
              >
                {(sub.name || '?')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{sub.name}</p>
                <p className="text-xs text-slate-500">Manage subscription &amp; payment</p>
              </div>
              <ExternalLink size={14} className="text-slate-500 group-hover:text-white transition-colors shrink-0" />
            </button>
          </section>

        </div>

        {/* ── Footer — mark as renewed ── */}
        <div className="px-5 pb-5 pt-3 border-t border-white/8 bg-white/[0.02]">
          <p className="text-[11px] text-slate-500 text-center mb-3">
            After completing your payment, confirm the renewal below
          </p>
          <button
            onClick={onMarkRenewed}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={15} />
            Mark as Renewed{next ? ` → ${next}` : ''}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PaymentIcon({ method }) {
  const m = (method || '').toLowerCase()
  if (m === 'upi')                              return <Smartphone size={11} />
  if (m === 'credit card' || m === 'debit card') return <CreditCard size={11} />
  if (m === 'wallet')                           return <Wallet size={11} />
  return null
}

function RenewalBadge({ dateStr }) {
  const days = daysUntil(dateStr)
  if (days === null) return <span className="text-slate-500 text-xs">No renewal date</span>
  if (days < 0)      return <span className="text-xs font-medium text-red-400">Overdue by {Math.abs(days)}d</span>
  if (days === 0)    return <span className="text-xs font-medium text-red-400">Renews today</span>
  if (days <= 5)     return <span className="text-xs font-medium text-amber-400">Renews in {days}d</span>
  return <span className="text-xs text-slate-400">Renews {dateStr} <span className="text-slate-500">({days}d)</span></span>
}

function SubscriptionCard({ s, onEdit, onToggle, onDelete, onRenew }) {
  const cph      = costPerHour(s.cost, s.hoursThisMonth)
  const usagePct = Math.min(100, ((s.hoursThisMonth || 0) / 40) * 100)
  const accent   = categoryHex(s.category)
  const cycle    = s.billingCycle || s.billing_cycle || 'monthly'

  return (
    <div className="relative rounded-xl border border-white/8 bg-[#0d0d18] overflow-hidden flex flex-col transition-all hover:border-white/16 hover:shadow-lg">
      <div className="h-0.5 w-full" style={{ background: accent }} />

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="mt-1 w-2 h-2 rounded-full shrink-0" style={{ background: accent }} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white truncate">{s.name}</p>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className={`badge text-xs px-2 py-0.5 ${categoryColor(s.category)}`}>{s.category}</span>
              <span className={`badge text-xs px-2 py-0.5 ${statusColor(s.status)}`}>{s.status}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-base font-bold text-white leading-none">
              {currency(s.cost)}
              <span className="text-xs text-slate-500 font-normal ml-0.5">
                /{cycle === 'yearly' ? 'yr' : cycle === 'quarterly' ? 'q' : 'mo'}
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Subscriptions() {
  const { subscriptions, addSubscription, updateSubscription, deleteSubscription, loading, error } = useData()
  const [openAdd,      setOpenAdd]      = useState(false)
  const [editing,      setEditing]      = useState(null)
  const [renewTarget,  setRenewTarget]  = useState(null)
  const [filter,       setFilter]       = useState('All')
  const [query,        setQuery]        = useState('')
  const [sortBy,       setSortBy]       = useState('name')

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
      if (s.billingCycle === 'yearly')    return sum + s.cost / 12
      if (s.billingCycle === 'quarterly') return sum + s.cost / 3
      return sum + s.cost
    }, 0)
    const unused = active.filter(s => !s.hoursThisMonth || s.hoursThisMonth === 0).length
    const totalH = active.reduce((sum, s) => sum + (s.hoursThisMonth || 0), 0)
    const avgCph = totalH > 0 ? monthly / totalH : null
    return { active: active.length, monthly, unused, avgCph }
  }, [subscriptions])

  const handleMarkRenewed = () => {
    if (!renewTarget?.renewsOn) return
    const cycle = renewTarget.billingCycle || renewTarget.billing_cycle || 'monthly'
    const next  = advanceDate(renewTarget.renewsOn, cycle)
    updateSubscription(renewTarget.id, { renewsOn: next })
    setRenewTarget(null)
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
        subscriptions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="card py-16 px-8 flex flex-col items-center text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-brand-600/10 border border-brand-500/20 flex items-center justify-center mb-5">
              <CreditCard size={22} className="text-brand-400" />
            </div>
            <h3 className="font-semibold mb-1.5" style={{ color: 'var(--c-text)' }}>No subscriptions yet</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-xs leading-relaxed">
              Add your first subscription to start tracking your spend, usage, and ROI.
            </p>
            <button onClick={() => setOpenAdd(true)} className="btn-primary">
              <Plus size={15} /> Add subscription
            </button>
          </motion.div>
        ) : (
          <div className="card py-12 text-center text-sm text-slate-500">
            No subscriptions match the current filter.
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(s => (
            <SubscriptionCard
              key={s.id}
              s={s}
              onEdit={setEditing}
              onToggle={sub => updateSubscription(sub.id, { status: sub.status === 'active' ? 'paused' : 'active' })}
              onDelete={deleteSubscription}
              onRenew={setRenewTarget}
            />
          ))}
        </div>
      )}

      {/* Add / Edit modals */}
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

      {/* Renew / payment modal — AnimatePresence lives here so exit animation works */}
      <AnimatePresence>
        {renewTarget && (
          <RenewModal
            key="renew-modal"
            sub={renewTarget}
            onClose={() => setRenewTarget(null)}
            onMarkRenewed={handleMarkRenewed}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
