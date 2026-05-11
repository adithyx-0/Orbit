import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'

const SERIES = [
  { key: 'productivity', color: '#3b63ff', label: 'Productivity' },
  { key: 'learning',     color: '#10b981', label: 'Learning' },
  { key: 'entertainment', color: '#ec4899', label: 'Entertainment' },
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-3 border border-white/10 rounded-xl p-3 shadow-modal text-xs">
      <div className="text-slate-400 mb-2">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-300">{p.name}</span>
          <span className="ml-auto font-medium" style={{ color: 'var(--c-text)' }}>{p.value} min</span>
        </div>
      ))}
    </div>
  )
}

export default function UsageTrendChart({ data }) {
  const isEmpty = !data || data.length === 0

  return (
    <div className="card p-6 lg:col-span-2">
      <div className="flex items-center justify-between mb-5">
        <h2 className="section-title">Usage trend</h2>
        <span className="text-xs text-slate-500">last 14 days · from device agents</span>
      </div>

      {isEmpty ? (
        <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
          No usage data yet — connect the device agent to start tracking.
        </div>
      ) : (
        <>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  {SERIES.map(s => (
                    <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={s.color} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.06)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={d => d?.slice(5) ?? d}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                {SERIES.map(s => (
                  <Area
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.label}
                    stroke={s.color}
                    strokeWidth={1.5}
                    fill={`url(#grad-${s.key})`}
                    dot={false}
                    activeDot={{ r: 3, strokeWidth: 0 }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 mt-3">
            {SERIES.map(s => (
              <div key={s.key} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="w-2.5 h-0.5 rounded-full" style={{ background: s.color }} />
                {s.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
