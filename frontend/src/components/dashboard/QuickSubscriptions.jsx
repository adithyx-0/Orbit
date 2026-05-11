import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Badge from '../ui/Badge.jsx'
import { currency, categoryVariant } from '../../lib/format.js'
import { hours } from '../../lib/format.js'

export default function QuickSubscriptions({ subscriptions }) {
  const top = subscriptions
    .filter(s => s.status === 'active')
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 4)

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">Top subscriptions</h2>
        <Link
          to="/subscriptions"
          className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors"
        >
          View all <ArrowRight size={12} />
        </Link>
      </div>

      {top.length === 0 ? (
        <div className="py-6 text-center text-sm text-slate-500">
          No active subscriptions yet.{' '}
          <Link to="/subscriptions" className="text-brand-400 hover:underline">Add one →</Link>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {top.map(s => (
            <li
              key={s.id}
              className="flex items-center justify-between gap-3 p-2.5 rounded-lg hover:bg-white/4 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Icon placeholder — first letter */}
                <div className="w-7 h-7 rounded-lg bg-white/6 border border-white/8 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                  {s.name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: 'var(--c-text)' }}>{s.name}</div>
                  <div className="text-[11px] text-slate-500">{hours(s.hoursThisMonth)} this month</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={categoryVariant(s.category)} size="sm">{s.category}</Badge>
                <span className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>{currency(s.cost)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
