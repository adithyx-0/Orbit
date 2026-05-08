import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { currency } from '../../lib/format.js'

const PALETTE = ['#3b63ff', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#06b6d4']

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div className="bg-surface-3 border border-white/10 rounded-xl px-3 py-2 shadow-modal text-xs">
      <span className="text-slate-300">{name}: </span>
      <span className="text-white font-semibold">{currency(value)}</span>
    </div>
  )
}

export default function SpendDonut({ data }) {
  const isEmpty = !data || data.length === 0
  const total = data?.reduce((a, d) => a + d.value, 0) ?? 0

  return (
    <div className="card p-6">
      <h2 className="section-title mb-5">Spend by category</h2>

      {isEmpty ? (
        <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
          No active subscriptions yet.
        </div>
      ) : (
        <>
          <div className="relative h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="55%"
                  outerRadius="75%"
                  strokeWidth={0}
                  paddingAngle={3}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-xs text-slate-500">total</div>
              <div className="text-lg font-bold text-white">{currency(total)}</div>
            </div>
          </div>

          <ul className="mt-4 space-y-2">
            {data.map((d, i) => (
              <li key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-400">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: PALETTE[i % PALETTE.length] }}
                  />
                  <span className="capitalize">{d.name}</span>
                </span>
                <span className="text-slate-300 font-medium">{currency(d.value)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
