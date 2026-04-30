import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'
import { CreditCard, Clock, TrendingDown, Target, Sparkles } from 'lucide-react'
import StatCard from '../components/StatCard.jsx'
import { useData } from '../context/DataContext.jsx'
import { currency, categoryColor } from '../lib/format.js'
import { buildRecommendations } from '../lib/recommendations.js'

const PIE_COLORS = ['#3b63ff', '#10b981', '#f59e0b', '#ec4899', '#6366f1']

export default function Dashboard() {
  const { subscriptions, goals, usage } = useData()

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-slate-500">Overview of your subscriptions and usage.</p>
        </div>
        <Link to="/subscriptions" className="btn-primary">Manage subscriptions</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Monthly spend" value={currency(stats.monthly)} sub={`${stats.activeCount} active subscriptions`} icon={CreditCard} accent="brand" />
        <StatCard label="Hours tracked" value={`${stats.totalHours} h`} sub="this month across services" icon={Clock} accent="indigo" />
        <StatCard label="Avg cost / hour" value={stats.avgCph ? currency(stats.avgCph) : '—'} sub="Lower is better" icon={TrendingDown} accent="emerald" />
        <StatCard label="Unused subs" value={stats.unused} sub="0 hours this month" icon={Target} accent="amber" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Usage trend (last 14 days)</h2>
            <span className="text-xs text-slate-500">from device agents</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usage}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b63ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b63ff" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} label={{ value: 'minutes', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="productivity" stroke="#3b63ff" fill="url(#g1)" />
                <Area type="monotone" dataKey="learning"     stroke="#10b981" fill="url(#g2)" />
                <Area type="monotone" dataKey="entertainment" stroke="#ec4899" fill="url(#g3)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold mb-4">Spend by category</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75}>
                  {byCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => currency(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 space-y-1 text-sm">
            {byCategory.map((c, i) => (
              <li key={c.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className={`badge ${categoryColor(c.name)}`}>{c.name}</span>
                </span>
                <span className="font-medium">{currency(c.value)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-brand-600" />
          <h2 className="font-semibold">AI recommendations</h2>
        </div>
        {recommendations.length === 0 ? (
          <div className="text-sm text-slate-500">Nothing to optimize — you're using every subscription efficiently.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recommendations.map(r => (
              <li key={r.id} className="py-3 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${severityBadge(r.severity)}`}>{r.severity}</span>
                    <span className="font-medium">{r.title}</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{r.body}</p>
                </div>
                <Link to="/subscriptions" className="btn-secondary shrink-0">{r.action}</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function severityBadge(s) {
  if (s === 'high') return 'bg-red-100 text-red-700'
  if (s === 'medium') return 'bg-amber-100 text-amber-700'
  return 'bg-slate-100 text-slate-700'
}
