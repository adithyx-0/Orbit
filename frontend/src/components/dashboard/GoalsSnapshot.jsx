import { Link } from 'react-router-dom'
import { Target, ArrowRight } from 'lucide-react'
import { cn } from '../../lib/cn.js'

const CATEGORY_COLOR = {
  learning:      'bg-emerald-500',
  productivity:  'bg-indigo-500',
  entertainment: 'bg-pink-500',
  budget:        'bg-amber-500',
}

function progressColor(pct) {
  if (pct >= 80) return 'bg-emerald-500'
  if (pct >= 50) return 'bg-brand-500'
  if (pct >= 25) return 'bg-amber-500'
  return 'bg-red-500'
}

export default function GoalsSnapshot({ goals }) {
  const active = goals.slice(0, 4)

  return (
    <div className="card p-5 md:col-span-2 lg:col-span-1">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target size={15} className="text-slate-400" />
          <h2 className="section-title">Goals</h2>
        </div>
        <Link
          to="/goals"
          className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors"
        >
          View all <ArrowRight size={12} />
        </Link>
      </div>

      {active.length === 0 ? (
        <div className="py-6 text-center text-sm text-slate-500">
          No goals set yet.{' '}
          <Link to="/goals" className="text-brand-400 hover:underline">Create one →</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {active.map(g => {
            const pct = Math.min(100, Math.max(0, g.progress ?? 0))
            const catKey = (g.category || '').toLowerCase()
            return (
              <li key={g.id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={cn(
                        'w-1.5 h-1.5 rounded-full shrink-0',
                        CATEGORY_COLOR[catKey] ?? 'bg-slate-500'
                      )}
                    />
                    <span className="text-sm truncate" style={{ color: 'var(--c-text)' }}>{g.title}</span>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">{pct}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/6 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', progressColor(pct))}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
