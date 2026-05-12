import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie,
} from 'recharts'
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { currency, hours, costPerHour } from '../lib/format.js'
import UsageTrendChart from '../components/dashboard/UsageTrendChart.jsx'
import AiPanel from '../components/AiPanel.jsx'

const CAT_COLOR = {
  entertainment: '#D4537E',
  learning:      '#1D9E75',
  productivity:  '#4F46E5',
  'ai tools':    '#8B5CF6',
  ai_tools:      '#8B5CF6',
  health:        '#F59E0B',
  utilities:     '#0EA5E9',
  other:         '#475569',
}

function catColor(c) {
  return CAT_COLOR[(c || '').toLowerCase()] ?? CAT_COLOR.other
}

function roiHex(cph) {
  if (!cph) return '#EF4444'
  if (cph < 20) return '#10B981'
  if (cph < 60) return '#F59E0B'
  return '#EF4444'
}

function roiLabel(cph, hours) {
  if (!hours) return { text: 'Unused', color: '#EF4444' }
  if (cph < 20) return { text: 'Great',  color: '#10B981' }
  if (cph < 60) return { text: 'Okay',   color: '#F59E0B' }
  return       { text: 'Poor',  color: '#EF4444' }
}

function DarkTooltip({ active, payload, label, fmt }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2.5 text-xs shadow-xl" style={{ background: 'var(--c-card-bg)', border: '1px solid var(--c-card-border)' }}>
      {label && <p className="text-slate-400 mb-1.5">{label}</p>}
      {payload.map(p => (
        <div key={p.dataKey ?? p.name} className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: p.fill ?? p.color ?? p.stroke }} />
          <span className="text-slate-300">{p.name ?? p.dataKey}</span>
          <span className="ml-auto pl-4 font-semibold" style={{ color: 'var(--c-text)' }}>
            {fmt ? fmt(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

function StatCard({ label, value, sub, danger }) {
  return (
    <div className={`card p-4 ${danger ? 'border-red-500/20' : ''}`}>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-xl font-bold truncate ${danger ? 'text-red-400' : ''}`} style={danger ? {} : { color: 'var(--c-text)' }}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5 truncate">{sub}</p>
    </div>
  )
}

export default function Analytics() {
  const { subscriptions, usage, loading, error } = useData()

  const active = useMemo(
    () => subscriptions.filter(s => s.status === 'active'),
    [subscriptions]
  )

  const totalMonthly = useMemo(() =>
    active.reduce((sum, s) => {
      if (s.billingCycle === 'yearly')    return sum + s.cost / 12
      if (s.billingCycle === 'quarterly') return sum + s.cost / 3
      return sum + s.cost
    }, 0),
  [active])

  const unusedSubs = useMemo(
    () => active.filter(s => !s.hoursThisMonth || s.hoursThisMonth === 0),
    [active]
  )

  const cphData = useMemo(() =>
    subscriptions
      .filter(s => s.status !== 'cancelled')
      .map(s => ({
        name:        s.name,
        costPerHour: costPerHour(s.cost, s.hoursThisMonth) ?? 0,
        cost:        s.cost,
        hours:       s.hoursThisMonth || 0,
        category:    s.category,
      }))
      .sort((a, b) => b.costPerHour - a.costPerHour),
  [subscriptions])

  const spendByCategory = useMemo(() => {
    const map = {}
    active.forEach(s => {
      const key = (s.category || 'Other').toLowerCase()
      map[key] = (map[key] || 0) + s.cost
    })
    return Object.entries(map)
      .map(([name, value]) => ({ name, value, color: catColor(name) }))
      .sort((a, b) => b.value - a.value)
  }, [active])

  const [bestValue, worstValue] = useMemo(() => {
    const withH = active.filter(s => s.hoursThisMonth > 0)
    if (!withH.length) return [null, null]
    const sorted = [...withH].sort(
      (a, b) => a.cost / a.hoursThisMonth - b.cost / b.hoursThisMonth
    )
    return [sorted[0], sorted[sorted.length - 1]]
  }, [active])

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-500">Loading…</div>
  if (error)   return <div className="flex items-center justify-center h-64 text-red-500">{error}</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-slate-500">ROI, spending breakdown, and usage insights — powered by real data.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Monthly spend"
          value={currency(totalMonthly)}
          sub={`${currency(totalMonthly * 12)} projected / yr`}
        />
        <StatCard
          label="Active services"
          value={active.length}
          sub={`of ${subscriptions.length} total`}
        />
        <StatCard
          label="Unused budget"
          value={currency(unusedSubs.reduce((s, sub) => s + sub.cost, 0))}
          sub={`${unusedSubs.length} service${unusedSubs.length !== 1 ? 's' : ''} at 0 h`}
          danger={unusedSubs.length > 0}
        />
        <StatCard
          label="Best value"
          value={bestValue ? bestValue.name : '—'}
          sub={bestValue
            ? `${currency(bestValue.cost / bestValue.hoursThisMonth)}/hr`
            : 'log hours to calculate'}
        />
      </div>

      {/* AI Insights */}
      <AiPanel
        title="Prosit AI · Spending Analysis"
        subtitle="Get a personalised ROI breakdown and action plan"
        prompt="Analyse my subscriptions in detail. Based on my usage hours vs cost, which services have the worst ROI? Which should I cancel or downgrade? Give me 3 specific action points to reduce my monthly spend while keeping value."
      />

      {/* Best / Worst + Unused highlights */}
      {(bestValue || worstValue || unusedSubs.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-4">
          {bestValue && (
            <div className="card p-4 border-emerald-500/20 bg-emerald-500/[0.04]">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={14} className="text-emerald-400" />
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">Best value</p>
              </div>
              <p className="font-semibold" style={{ color: 'var(--c-text)' }}>{bestValue.name}</p>
              <p className="text-xs text-slate-400 mt-1">
                {currency(bestValue.cost)}/mo · {hours(bestValue.hoursThisMonth)} used ·{' '}
                <span className="text-emerald-400 font-medium">
                  {currency(bestValue.cost / bestValue.hoursThisMonth)}/hr
                </span>
              </p>
            </div>
          )}
          {worstValue && worstValue !== bestValue && (
            <div className="card p-4 border-red-500/20 bg-red-500/[0.04]">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown size={14} className="text-red-400" />
                <p className="text-xs font-semibold text-red-400 uppercase tracking-wide">Worst value</p>
              </div>
              <p className="font-semibold" style={{ color: 'var(--c-text)' }}>{worstValue.name}</p>
              <p className="text-xs text-slate-400 mt-1">
                {currency(worstValue.cost)}/mo · {hours(worstValue.hoursThisMonth)} used ·{' '}
                <span className="text-red-400 font-medium">
                  {currency(worstValue.cost / worstValue.hoursThisMonth)}/hr
                </span>
              </p>
            </div>
          )}
          {unusedSubs.length > 0 && (
            <div className={`card p-4 border-amber-500/20 bg-amber-500/[0.04] ${bestValue && worstValue ? 'sm:col-span-2' : ''}`}>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={14} className="text-amber-400" />
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide">
                  Unused this month · {currency(unusedSubs.reduce((s, sub) => s + sub.cost, 0))} wasted
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {unusedSubs.map(s => (
                  <span
                    key={s.id}
                    className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2.5 py-1 rounded-full"
                  >
                    {s.name} · {currency(s.cost)}/mo
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Charts: Spend donut + CPH bar */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Spend by category donut */}
        <div className="card p-6">
          <h2 className="font-semibold mb-1">Spend by category</h2>
          <p className="text-xs text-slate-500 mb-5">Monthly-normalised active subscriptions</p>
          {spendByCategory.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-slate-500 text-sm">
              No active subscriptions.
            </div>
          ) : (
            <>
              <div className="relative h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spendByCategory}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="55%"
                      outerRadius="75%"
                      strokeWidth={0}
                      paddingAngle={3}
                    >
                      {spendByCategory.map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        return (
                          <div className="rounded-xl px-3 py-2 text-xs shadow-xl" style={{ background: 'var(--c-card-bg)', border: '1px solid var(--c-card-border)' }}>
                            <span className="text-slate-300 capitalize">{payload[0].name}: </span>
                            <span className="font-semibold" style={{ color: 'var(--c-text)' }}>{currency(payload[0].value)}</span>
                          </div>
                        )
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-xs text-slate-500">monthly</div>
                  <div className="text-lg font-bold" style={{ color: 'var(--c-text)' }}>{currency(totalMonthly)}</div>
                </div>
              </div>
              <ul className="mt-4 space-y-2">
                {spendByCategory.map(d => (
                  <li key={d.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-slate-400">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                      <span className="capitalize">{d.name.replace('_', ' ')}</span>
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-1 rounded-full overflow-hidden" style={{ background: 'var(--c-skeleton)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.round((d.value / totalMonthly) * 100)}%`,
                            background: d.color,
                          }}
                        />
                      </div>
                      <span className="text-slate-300 font-medium w-16 text-right">{currency(d.value)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Cost per hour bar — colour-coded by ROI */}
        <div className="card p-6">
          <h2 className="font-semibold mb-1">Cost per hour by service</h2>
          <p className="text-xs text-slate-500 mb-5">
            <span className="text-emerald-400">■</span> &lt;₹20 great ·{' '}
            <span className="text-amber-400">■</span> ₹20-60 okay ·{' '}
            <span className="text-red-400">■</span> ₹60+ / unused
          </p>
          {cphData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm">No data.</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cphData} margin={{ top: 4, right: 4, left: -8, bottom: 48 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    angle={-40}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={v => '₹' + v}
                  />
                  <Tooltip content={<DarkTooltip fmt={currency} />} />
                  <Bar dataKey="costPerHour" name="₹ / hr" radius={[5, 5, 0, 0]}>
                    {cphData.map((d, i) => (
                      <Cell key={i} fill={roiHex(d.costPerHour)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Usage area chart */}
      <UsageTrendChart data={usage} />

      {/* Full breakdown table */}
      <div className="card p-6">
        <h2 className="font-semibold mb-4">Full breakdown</h2>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Service</th>
                <th>Category</th>
                <th className="text-right">Monthly</th>
                <th className="text-right">Annual</th>
                <th className="text-right">Hours</th>
                <th className="text-right">₹ / hr</th>
                <th className="text-right">ROI</th>
              </tr>
            </thead>
            <tbody>
              {cphData.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    No subscriptions yet.
                  </td>
                </tr>
              )}
              {cphData.map(r => {
                const { text, color } = roiLabel(r.costPerHour, r.hours)
                return (
                  <tr key={r.name}>
                    <td className="font-medium" style={{ color: 'var(--c-text)' }}>{r.name}</td>
                    <td>
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: catColor(r.category) }} />
                        <span className="capitalize">{r.category}</span>
                      </span>
                    </td>
                    <td className="text-right">{currency(r.cost)}</td>
                    <td className="text-right text-slate-500">{currency(r.cost * 12)}</td>
                    <td className="text-right">{hours(r.hours)}</td>
                    <td className="text-right">
                      {r.costPerHour ? currency(r.costPerHour) : <span className="text-slate-500">—</span>}
                    </td>
                    <td className="text-right">
                      <span className="text-xs font-semibold" style={{ color }}>{text}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
