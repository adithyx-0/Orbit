import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Bell, X, CreditCard, BarChart3, Sparkles, Database } from 'lucide-react'
import { motion } from 'framer-motion'
import { useData } from '../context/DataContext.jsx'
import { useRenewalNotifications } from '../hooks/useRenewalNotifications.js'
import { buildRecommendations } from '../lib/recommendations.js'
import { fadeInUp } from '../lib/motion.js'
import api from '../lib/api.js'

import DashboardSkeleton from '../components/dashboard/DashboardSkeleton.jsx'
import StatsRow from '../components/dashboard/StatsRow.jsx'
import UsageTrendChart from '../components/dashboard/UsageTrendChart.jsx'
import SpendDonut from '../components/dashboard/SpendDonut.jsx'
import RecommendationsCard from '../components/dashboard/RecommendationsCard.jsx'
import QuickSubscriptions from '../components/dashboard/QuickSubscriptions.jsx'
import UpcomingRenewals from '../components/dashboard/UpcomingRenewals.jsx'
import { StarTreeWidget, UserScoreWidget } from '../components/gamification/index.js'

function DashboardWelcome() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const loadDemo = async () => {
    setLoading(true)
    try {
      await api.post('/seed')
      window.location.reload()
    } catch {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
      className="flex flex-col items-center text-center py-16 px-4 max-w-lg mx-auto"
    >
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-brand-600/10 border border-brand-500/20 flex items-center justify-center mb-6 shadow-glow-sm">
        <CreditCard size={26} className="text-brand-400" />
      </div>

      <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--c-text)' }}>
        Welcome to Prosit!
      </h2>
      <p className="text-sm text-slate-500 mb-10 leading-relaxed max-w-sm">
        Track every subscription, see where your money goes, and get AI-powered recommendations to cut waste.
      </p>

      {/* Steps */}
      <div className="grid grid-cols-3 gap-3 w-full mb-10">
        {[
          { icon: CreditCard, label: 'Add your subscriptions', step: '1', color: 'text-brand-400', bg: 'bg-brand-500/10' },
          { icon: BarChart3,  label: 'Track usage over time',  step: '2', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { icon: Sparkles,   label: 'Get AI insights',        step: '3', color: 'text-purple-400',  bg: 'bg-purple-500/10' },
        ].map(({ icon: Icon, label, step, color, bg }) => (
          <div key={step} className="card p-4 flex flex-col items-center gap-2.5">
            <div className={`w-7 h-7 rounded-full ${bg} flex items-center justify-center text-xs font-bold ${color}`}>
              {step}
            </div>
            <Icon size={15} className={color} />
            <p className="text-xs text-slate-500 text-center leading-snug">{label}</p>
          </div>
        ))}
      </div>

      <Link to="/subscriptions" className="btn-primary text-sm px-6 py-2.5">
        <Plus size={15} />
        Add your first subscription
      </Link>

      <button
        onClick={loadDemo}
        disabled={loading}
        className="mt-4 text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1.5"
      >
        <Database size={11} />
        {loading ? 'Loading demo…' : 'Or explore with demo data →'}
      </button>
    </motion.div>
  )
}

export default function Dashboard() {
  const { subscriptions, goals, usage, loading, error } = useData()
  const { permission, upcoming, requestPermission } = useRenewalNotifications()
  const [bannerDismissed, setBannerDismissed] = useState(false)

  // All hooks MUST run before any conditional return
  const stats = useMemo(() => {
    const active = subscriptions.filter(s => s.status === 'active')
    const monthly = active.reduce((a, s) => a + s.cost, 0)
    const totalHours = active.reduce((a, s) => a + (s.hoursThisMonth || 0), 0)
    const avgCph = totalHours > 0 ? monthly / totalHours : null
    const unused = active.filter(s => (s.hoursThisMonth || 0) === 0).length
    return { monthly, totalHours, avgCph, unused, activeCount: active.length }
  }, [subscriptions])

  const byCategory = useMemo(() => {
    const map = {}
    for (const s of subscriptions.filter(x => x.status === 'active')) {
      map[s.category] = (map[s.category] || 0) + s.cost
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [subscriptions])

  const recommendations = useMemo(
    () => buildRecommendations(subscriptions, goals),
    [subscriptions, goals]
  )

  if (loading) return <DashboardSkeleton />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="text-red-400 text-sm">{error}</div>
        <button
          className="btn-secondary text-xs"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="flex items-start justify-between gap-4"
      >
        <div>
          <p className="micro-label mb-1">Overview</p>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle mt-1">Track your subscriptions, usage, and spend at a glance.</p>
        </div>
        <Link to="/subscriptions" className="btn-primary shrink-0">
          <Plus size={15} className="-ml-0.5" />
          Add subscription
        </Link>
      </motion.div>

      {/* Notification permission prompt — only if not granted and renewals are due */}
      {permission === 'default' && upcoming.length > 0 && !bannerDismissed && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-amber-500/8 border border-amber-500/20">
          <div className="flex items-center gap-3 min-w-0">
            <Bell size={15} className="text-amber-400 shrink-0" />
            <p className="text-sm text-slate-300">
              You have <span className="font-semibold text-amber-400">{upcoming.length}</span> subscription{upcoming.length > 1 ? 's' : ''} renewing soon — enable notifications to get alerts before you're charged.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={requestPermission} className="btn-primary text-xs">
              Enable
            </button>
            <button
              onClick={() => setBannerDismissed(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/6 transition-colors"
              aria-label="Dismiss"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      {subscriptions.length === 0 ? (
        <DashboardWelcome />
      ) : (
        <>
          {/* KPI row */}
          <StatsRow stats={stats} />

          {/* Charts */}
          <div className="grid lg:grid-cols-3 gap-5">
            <UsageTrendChart data={usage} />
            <SpendDonut data={byCategory} />
          </div>

          {/* AI recommendations */}
          <RecommendationsCard recommendations={recommendations} />

          {/* User score + level progression */}
          <UserScoreWidget />

          {/* Bottom row */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <QuickSubscriptions subscriptions={subscriptions} />
            <UpcomingRenewals subscriptions={subscriptions} />
            <StarTreeWidget />
          </div>
        </>
      )}
    </div>
  )
}
