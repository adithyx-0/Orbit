import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Bell, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useData } from '../context/DataContext.jsx'
import { useRenewalNotifications } from '../hooks/useRenewalNotifications.js'
import { buildRecommendations } from '../lib/recommendations.js'
import { fadeInUp } from '../lib/motion.js'

import DashboardSkeleton from '../components/dashboard/DashboardSkeleton.jsx'
import StatsRow from '../components/dashboard/StatsRow.jsx'
import UsageTrendChart from '../components/dashboard/UsageTrendChart.jsx'
import SpendDonut from '../components/dashboard/SpendDonut.jsx'
import RecommendationsCard from '../components/dashboard/RecommendationsCard.jsx'
import QuickSubscriptions from '../components/dashboard/QuickSubscriptions.jsx'
import UpcomingRenewals from '../components/dashboard/UpcomingRenewals.jsx'
import { StarTreeWidget, UserScoreWidget } from '../components/gamification/index.js'

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
    </div>
  )
}
