import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CheckCircle2, Bell, BellOff, Smartphone, Monitor, Copy, Check,
  ChevronDown, ChevronUp, RefreshCw, Trash2, Database, Download,
  Wifi, BarChart2, Target, Shield, X, Star,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'
import api from '../lib/api.js'
import { currency } from '../lib/format.js'

const USAGE_CATEGORIES = ['Learning', 'Entertainment', 'Productivity']
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// ── helpers ────────────────────────────────────────────────────

function daysUntil(dateStr) {
  if (!dateStr) return null
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000)
}

function agentStatus(sources, key) {
  const src = sources.find(s => s.source === key)
  if (!src) return { label: 'Not connected', color: 'slate', dot: '#475569' }
  const days = Math.floor((new Date() - new Date(src.last_date)) / 86400000)
  if (days === 0) return { label: `Connected · synced today`, color: 'emerald', dot: '#10B981' }
  if (days <= 3)  return { label: `Last sync: ${days}d ago`, color: 'amber',   dot: '#F59E0B' }
  return             { label: `Last sync: ${days}d ago`, color: 'slate',   dot: '#475569' }
}

function StatusBadge({ status }) {
  const cls = {
    emerald: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
    amber:   'bg-amber-500/15  text-amber-400  border border-amber-500/20',
    slate:   'bg-white/6       text-slate-400  border border-white/8',
  }[status.color]
  return (
    <span className={`badge text-xs px-2.5 py-1 flex items-center gap-1.5 ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: status.dot }} />
      {status.label}
    </span>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/8 transition-colors"
      title="Copy"
    >
      {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
    </button>
  )
}

// ── Notifications section ──────────────────────────────────────

function NotificationsCard({ subscriptions }) {
  const [perm, setPerm] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  )

  const upcoming = subscriptions.filter(s => {
    if (s.status !== 'active') return false
    const d = daysUntil(s.renewsOn)
    return d !== null && d >= 0 && d <= 7
  }).sort((a, b) => daysUntil(a.renewsOn) - daysUntil(b.renewsOn))

  const enable = async () => {
    if (typeof Notification === 'undefined') return
    const result = await Notification.requestPermission()
    setPerm(result)
  }

  const sendTest = () => {
    if (perm !== 'granted') return
    new Notification('Prosit · Renewal reminder', {
      body: 'Test — your renewal alerts are working!',
    })
  }

  const notifyAll = useCallback(() => {
    if (perm !== 'granted') return
    upcoming.forEach(s => {
      const d = daysUntil(s.renewsOn)
      const when = d === 0 ? 'today' : `in ${d} day${d > 1 ? 's' : ''}`
      new Notification(`${s.name} renews ${when}`, {
        body: `${currency(s.cost)} will be charged${s.paymentMethod ? ` via ${s.paymentMethod}` : ''}.`,
      })
    })
  }, [perm, upcoming])


  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">Renewal notifications</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Browser alerts when a subscription renews within 7 days.
          </p>
        </div>
        {perm === 'unsupported' && (
          <span className="badge bg-white/6 text-slate-400 border border-white/8 text-xs shrink-0">Not supported</span>
        )}
        {perm === 'denied' && (
          <span className="badge bg-red-500/15 text-red-400 border border-red-500/20 text-xs shrink-0">
            <BellOff size={11} /> Blocked
          </span>
        )}
        {perm === 'granted' && (
          <span className="badge bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-xs shrink-0">
            <Bell size={11} /> Active
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {perm === 'default' && (
          <button className="btn-primary text-sm gap-1.5" onClick={enable}>
            <Bell size={14} /> Enable notifications
          </button>
        )}
        {perm === 'denied' && (
          <p className="text-xs text-slate-500">
            Notifications are blocked. Go to your browser settings → Site permissions → Notifications and allow this site.
          </p>
        )}
        {perm === 'granted' && (
          <>
            <button className="btn-secondary text-sm gap-1.5" onClick={sendTest}>
              <Bell size={13} /> Send test
            </button>
            {upcoming.length > 0 && (
              <button className="btn-secondary text-sm gap-1.5" onClick={notifyAll}>
                <Bell size={13} /> Notify all upcoming
              </button>
            )}
          </>
        )}
      </div>

      {/* Upcoming renewals */}
      {upcoming.length > 0 ? (
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-3">
            Renewing within 7 days
          </p>
          <div className="space-y-2">
            {upcoming.map(s => {
              const d = daysUntil(s.renewsOn)
              return (
                <div key={s.id} className="flex items-center justify-between gap-3 py-2 border-b border-white/6 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-white">{s.name}</p>
                    <p className="text-xs text-slate-500">
                      {s.renewsOn} · {s.paymentMethod || 'no payment method set'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-white">{currency(s.cost)}</p>
                    <p className={`text-xs font-medium ${d === 0 ? 'text-red-400' : d <= 3 ? 'text-amber-400' : 'text-slate-400'}`}>
                      {d === 0 ? 'today' : `in ${d}d`}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">No subscriptions renewing in the next 7 days.</p>
      )}
    </div>
  )
}

// ── Device Agents section ──────────────────────────────────────

function AgentsCard() {
  const { user } = useAuth()
  const [sources,  setSources]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showAndroid, setShowAndroid] = useState(false)
  const [showWindows, setShowWindows] = useState(false)

  const token = (() => {
    try { return JSON.parse(localStorage.getItem('prosit.auth') || '{}').token || '' }
    catch { return '' }
  })()

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/usage/sources')
      setSources(data.sources || [])
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const android = agentStatus(sources, 'android')
  const windows = agentStatus(sources, 'windows')

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Device agents</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Companion apps that automatically push usage data in the background.
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="btn-secondary !p-2 shrink-0"
          title="Refresh status"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Android */}
      <div className="rounded-xl border border-white/8 overflow-hidden">
        <div className="flex items-center gap-3 p-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Smartphone size={16} className="text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">Android companion</p>
            <p className="text-xs text-slate-500">Tracks app usage via UsageStatsManager</p>
          </div>
          <StatusBadge status={android} />
          <button
            onClick={() => setShowAndroid(v => !v)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white transition-colors shrink-0"
          >
            {showAndroid ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
        {showAndroid && (
          <div className="px-4 pb-4 border-t border-white/6 pt-4 space-y-3">
            <p className="text-xs text-slate-400 leading-relaxed">
              Install the Prosit Android app, log in with your account (<span className="text-white">{user?.email}</span>), and grant <strong className="text-white">Usage access</strong> in Settings → Apps → Special app access. The app syncs hourly in the background.
            </p>
            <div className="space-y-2">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">API endpoint</p>
              <div className="flex items-center gap-2 bg-white/4 border border-white/8 rounded-lg px-3 py-2">
                <code className="text-xs text-slate-300 flex-1 break-all">{API_URL}</code>
                <CopyButton text={API_URL} />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Your session token</p>
              <div className="flex items-center gap-2 bg-white/4 border border-white/8 rounded-lg px-3 py-2">
                <code className="text-xs text-slate-300 flex-1 truncate">
                  {token ? `${token.slice(0, 24)}…` : 'Sign in to view token'}
                </code>
                {token && <CopyButton text={token} />}
              </div>
              <p className="text-xs text-slate-500">The app auto-acquires this when you log in — no manual copy needed.</p>
            </div>
            {android.color === 'emerald' && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/8 border border-emerald-500/20 rounded-lg px-3 py-2">
                <CheckCircle2 size={13} />
                Agent is active and syncing correctly.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Windows */}
      <div className="rounded-xl border border-white/8 overflow-hidden">
        <div className="flex items-center gap-3 p-4">
          <div className="w-9 h-9 rounded-xl bg-brand-600/10 border border-brand-500/20 flex items-center justify-center shrink-0">
            <Monitor size={16} className="text-brand-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">Windows desktop agent</p>
            <p className="text-xs text-slate-500">Python script — tracks foreground window time</p>
          </div>
          <StatusBadge status={windows} />
          <button
            onClick={() => setShowWindows(v => !v)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white transition-colors shrink-0"
          >
            {showWindows ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
        {showWindows && (
          <div className="px-4 pb-4 border-t border-white/6 pt-4 space-y-3">
            <p className="text-xs text-slate-400 leading-relaxed">
              Run the Python agent on your Windows machine. It monitors active windows, maps them to categories, and posts usage every hour.
            </p>
            <div className="space-y-2">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Config values</p>
              <div className="bg-[#0d0d18] border border-white/8 rounded-lg p-3 space-y-1">
                <div className="flex items-center gap-2">
                  <code className="text-xs text-slate-400 w-20 shrink-0">API_URL</code>
                  <code className="text-xs text-slate-200 flex-1 break-all">{API_URL}</code>
                  <CopyButton text={API_URL} />
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-slate-400 w-20 shrink-0">TOKEN</code>
                  <code className="text-xs text-slate-200 flex-1 truncate">
                    {token ? `${token.slice(0, 24)}…` : '—'}
                  </code>
                  {token && <CopyButton text={token} />}
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Quick start</p>
              <div className="bg-[#0d0d18] border border-white/8 rounded-lg p-3">
                <code className="text-xs text-slate-300 block">pip install requests pywin32</code>
                <code className="text-xs text-slate-300 block mt-1">python prosit_agent.py</code>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Source breakdown */}
      {sources.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-3">Data sources</p>
          <div className="space-y-2">
            {sources.map(s => (
              <div key={s.source} className="flex items-center justify-between text-xs text-slate-400">
                <span className="capitalize">{s.source}</span>
                <span className="text-slate-500">{s.total_logs} logs · last: {s.last_date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Android Install Modal ──────────────────────────────────────

function AndroidInstallModal({ open, onClose }) {
  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Panel */}
          <motion.div
            className="relative w-full sm:max-w-md bg-[#0d0d18] border border-white/10 sm:rounded-2xl rounded-t-2xl overflow-hidden shadow-2xl"
            initial={{ y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0,  opacity: 1, scale: 1 }}
            exit={{   y: 60, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
            onClick={e => e.stopPropagation()}
          >
            {/* Top accent */}
            <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500/0 via-emerald-500/60 to-emerald-500/0" />

            {/* Drag handle (mobile) */}
            <div className="w-10 h-1 rounded-full bg-white/15 mx-auto mt-3 sm:hidden" />

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/8 transition-colors"
            >
              <X size={16} />
            </button>

            {/* Content */}
            <div className="px-6 pt-5 pb-6 space-y-5">
              {/* App identity */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1D9E75] to-[#0A5C43] flex items-center justify-center shrink-0 shadow-lg shadow-emerald-900/40">
                  <span className="text-white text-3xl font-black leading-none select-none">P</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Prosit for Android</h2>
                  <p className="text-sm text-slate-400">Your subscription tracker · on the go</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} size={11} className="text-amber-400 fill-amber-400" />
                    ))}
                    <span className="text-xs text-slate-500 ml-1">Companion app</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: Wifi,       label: 'Auto usage sync'     },
                  { icon: BarChart2,  label: 'Live analytics'       },
                  { icon: Target,     label: 'Track your goals'     },
                  { icon: Smartphone, label: 'Prosit AI on mobile'   },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 bg-white/4 border border-white/6 rounded-xl px-3 py-2.5">
                    <Icon size={13} className="text-emerald-400 shrink-0" />
                    <span className="text-xs text-slate-300">{label}</span>
                  </div>
                ))}
              </div>

              {/* Key selling point */}
              <div className="flex items-start gap-3 bg-emerald-500/[0.07] border border-emerald-500/20 rounded-xl px-4 py-3">
                <Wifi size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed">
                  The Android app automatically tracks which apps you use and how long —
                  no manual logging needed. Your Analytics charts update every hour.
                </p>
              </div>

              {/* Install steps (compact) */}
              <div className="space-y-2">
                <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">How to install</p>
                {[
                  'Download the APK below',
                  'Enable "Install unknown apps" in Android settings',
                  'Open the APK and tap Install',
                  'Grant Usage access and log in with your account',
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-slate-400">
                    <span className="w-4 h-4 rounded-full bg-white/8 text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                      {i + 1}
                    </span>
                    {step}
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <a
                  href={APK_URL}
                  download
                  className="btn-primary justify-center gap-2 flex-1"
                  onClick={onClose}
                >
                  <Download size={15} /> Download APK
                </a>
                <a
                  href={RELEASE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary justify-center text-sm"
                >
                  GitHub releases
                </a>
              </div>

              {/* Security */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Shield size={11} className="shrink-0" />
                Open source — verify the APK at github.com/adithyx-0/Prosit
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Android App card ───────────────────────────────────────────

const APK_URL     = 'https://github.com/adithyx-0/Prosit/releases/latest/download/prosit-release.apk'
const RELEASE_URL = 'https://github.com/adithyx-0/Prosit/releases/latest'

const APP_FEATURES = [
  { icon: Wifi,      text: 'Auto-tracks app usage in the background via Android UsageStats' },
  { icon: BarChart2, text: 'Syncs hours to your Analytics dashboard every hour' },
  { icon: Target,    text: 'View and update your Goals on the go' },
  { icon: Smartphone,text: 'Manage Subscriptions, log usage, and chat with Prosit AI' },
]

const INSTALL_STEPS = [
  { n: '1', title: 'Download the APK', body: 'Tap the button above to download prosit-release.apk to your Android device.' },
  { n: '2', title: 'Allow unknown sources', body: 'Go to Settings → Security (or Apps) → Install unknown apps, and allow your browser or Files app.' },
  { n: '3', title: 'Open and install', body: 'Open the downloaded APK from your notifications or Files app and tap Install.' },
  { n: '4', title: 'Grant Usage access', body: 'On first launch, tap "Grant permission" → find Prosit in the list → enable Usage access.' },
  { n: '5', title: 'Log in', body: 'Use the same email and password as your web account — your data syncs instantly.' },
]

function AndroidAppCard({ onOpenModal }) {
  const [showSteps, setShowSteps] = useState(false)

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-5">
        {/* App icon */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1D9E75] to-[#0A5C43] flex items-center justify-center shrink-0 shadow-lg">
          <span className="text-white text-2xl font-black leading-none select-none">P</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-white">Prosit Android App</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Auto-tracks your app usage and syncs to the dashboard
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="badge bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-xs">Free</span>
            <span className="badge bg-white/6 text-slate-400 border border-white/8 text-xs">Android 6.0+</span>
          </div>
        </div>
      </div>

      {/* Features grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-5 pb-4">
        {APP_FEATURES.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-start gap-2.5 text-xs text-slate-400">
            <Icon size={13} className="text-emerald-400 shrink-0 mt-0.5" />
            {text}
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2 px-5 pb-5">
        <button
          onClick={onOpenModal}
          className="btn-primary gap-2 text-sm"
        >
          <Smartphone size={14} /> Get the app
        </button>
        <a
          href={APK_URL}
          download
          className="btn-secondary gap-2 text-sm"
        >
          <Download size={14} /> Download APK
        </a>
        <button
          onClick={() => setShowSteps(v => !v)}
          className="btn-ghost text-sm gap-1 text-slate-400"
        >
          {showSteps ? <><ChevronUp size={13}/> Hide steps</> : <><ChevronDown size={13}/> Install guide</>}
        </button>
      </div>

      {/* Step-by-step install guide */}
      {showSteps && (
        <div className="border-t border-white/6 px-5 py-5 space-y-3">
          <p className="text-xs font-semibold text-white uppercase tracking-wide mb-4">
            How to install (sideload)
          </p>
          {INSTALL_STEPS.map(step => (
            <div key={step.n} className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-emerald-400">{step.n}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">{step.title}</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
          <div className="mt-4 flex items-start gap-2 text-xs text-slate-500 bg-white/4 rounded-lg px-3 py-2.5">
            <Shield size={12} className="text-slate-400 shrink-0 mt-0.5" />
            The APK is built directly from this project's source code.
            You can verify it at github.com/adithyx-0/Prosit before installing.
          </div>
        </div>
      )}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────

export default function Settings() {
  const { user, logout } = useAuth()
  const { subscriptions } = useData()

  const [showAppModal,  setShowAppModal]  = useState(false)
  const [showAdvanced,  setShowAdvanced]  = useState(false)

  // Auto-show the install modal once per session
  useEffect(() => {
    const seen = sessionStorage.getItem('prosit.app-modal-seen')
    if (!seen) {
      const t = setTimeout(() => setShowAppModal(true), 800)
      return () => clearTimeout(t)
    }
  }, [])

  const closeAppModal = () => {
    sessionStorage.setItem('prosit.app-modal-seen', '1')
    setShowAppModal(false)
  }

  const [usageForm,  setUsageForm]  = useState({
    date:     new Date().toISOString().slice(0, 10),
    category: 'Learning',
    minutes:  60,
    app_name: '',
  })
  const [usageSaved,  setUsageSaved]  = useState(false)
  const [usageError,  setUsageError]  = useState('')
  const [usageSaving, setUsageSaving] = useState(false)

  const [demoLoading, setDemoLoading] = useState(false)
  const [demoMsg,     setDemoMsg]     = useState('')

  const setField = (k, v) => setUsageForm(f => ({ ...f, [k]: v }))

  const logUsage = async (e) => {
    e.preventDefault()
    setUsageError('')
    setUsageSaving(true)
    try {
      await api.post('/usage', { ...usageForm, minutes: Number(usageForm.minutes), source: 'manual' })
      setUsageSaved(true)
      setTimeout(() => setUsageSaved(false), 2500)
    } catch (err) {
      setUsageError(err.response?.data?.error || 'Failed to log usage')
    } finally {
      setUsageSaving(false)
    }
  }

  const loadDemo = async () => {
    if (!confirm(
      'Load demo data?\n\nThis replaces ALL your current subscriptions, goals, and usage logs with realistic sample data.'
    )) return
    setDemoLoading(true)
    setDemoMsg('')
    try {
      const { data } = await api.post('/seed')
      setDemoMsg(`Loaded ${data.inserted.subscriptions} subscriptions, ${data.inserted.goals} goals, ${data.inserted.usage_days} days of usage. Refreshing…`)
      setTimeout(() => window.location.reload(), 1800)
    } catch {
      setDemoMsg('Failed to load demo data — check the backend is running.')
    } finally {
      setDemoLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-slate-500">Manage your account and app preferences.</p>
      </div>

      {/* Account — always visible */}
      <div className="card p-6">
        <h2 className="font-semibold mb-4">Account</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="label">Name</div>
            <div className="font-medium text-white mt-1">{user?.name}</div>
          </div>
          <div>
            <div className="label">Email</div>
            <div className="font-medium text-white mt-1">{user?.email}</div>
          </div>
        </div>
        <button onClick={logout} className="mt-5 btn-danger text-sm">Sign out</button>
      </div>

      {/* Android app — always visible */}
      <AndroidAppCard onOpenModal={() => setShowAppModal(true)} />

      {/* Android install modal */}
      <AndroidInstallModal open={showAppModal} onClose={closeAppModal} />

      {/* ── Advanced toggle ── */}
      <button
        onClick={() => setShowAdvanced(v => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-white/8 bg-white/3 hover:bg-white/6 hover:border-white/12 transition-all text-left group"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-white/8 flex items-center justify-center">
            <Shield size={13} className="text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
              Advanced settings
            </p>
            <p className="text-xs text-slate-600">
              Notifications · Agents · Usage logging · Demo data
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: showAdvanced ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
        </motion.div>
      </button>

      {/* Collapsible advanced sections */}
      <AnimatePresence initial={false}>
        {showAdvanced && (
          <motion.div
            key="advanced"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-6 pt-0">

              {/* Renewal notifications */}
              <NotificationsCard subscriptions={subscriptions} />

              {/* Device agents */}
              <AgentsCard />

              {/* Log usage manually */}
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
                        type="date" className="input"
                        value={usageForm.date}
                        onChange={e => setField('date', e.target.value)}
                        max={new Date().toISOString().slice(0, 10)}
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Category</label>
                      <select className="input" value={usageForm.category} onChange={e => setField('category', e.target.value)}>
                        {USAGE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="label">Minutes</label>
                      <input
                        type="number" min="1" max="1440" className="input"
                        value={usageForm.minutes}
                        onChange={e => setField('minutes', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="label">App / service (optional)</label>
                      <input
                        className="input" placeholder="e.g. Netflix, Coursera"
                        value={usageForm.app_name}
                        onChange={e => setField('app_name', e.target.value)}
                      />
                    </div>
                  </div>
                  {usageError && (
                    <div className="text-sm text-red-400 p-2 rounded-lg bg-red-500/10 border border-red-500/20">{usageError}</div>
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

              {/* Demo data */}
              <div className="card p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-brand-600/10 border border-brand-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Database size={15} className="text-brand-400" />
                  </div>
                  <div>
                    <h2 className="font-semibold">Load demo data</h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Fills your account with 12 realistic subscriptions, 6 goals, and 14 days of usage.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={loadDemo}
                    disabled={demoLoading}
                    className="btn-secondary gap-1.5 text-sm"
                  >
                    {demoLoading
                      ? <><RefreshCw size={13} className="animate-spin" /> Loading…</>
                      : <><Database size={13} /> Load demo data</>
                    }
                  </button>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Trash2 size={11} /> Replaces existing data
                  </span>
                </div>
                {demoMsg && (
                  <p className={`mt-3 text-sm ${demoMsg.includes('Failed') ? 'text-red-400' : 'text-emerald-400'}`}>
                    {demoMsg}
                  </p>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
