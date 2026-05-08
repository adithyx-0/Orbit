import { CalendarClock } from 'lucide-react'
import { currency } from '../../lib/format.js'

function daysUntil(dateStr) {
  if (!dateStr) return null
  const diff = new Date(dateStr) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function urgencyClass(days) {
  if (days <= 3)  return 'text-red-400'
  if (days <= 7)  return 'text-amber-400'
  return 'text-slate-400'
}

export default function UpcomingRenewals({ subscriptions }) {
  const renewals = subscriptions
    .filter(s => s.status === 'active' && s.renewsOn)
    .map(s => ({ ...s, daysLeft: daysUntil(s.renewsOn) }))
    .filter(s => s.daysLeft !== null && s.daysLeft >= 0 && s.daysLeft <= 30)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 4)

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <CalendarClock size={15} className="text-slate-400" />
        <h2 className="section-title">Upcoming renewals</h2>
      </div>

      {renewals.length === 0 ? (
        <div className="py-6 text-center text-sm text-slate-500">
          No renewals in the next 30 days.
        </div>
      ) : (
        <ul className="space-y-2.5">
          {renewals.map(s => (
            <li
              key={s.id}
              className="flex items-center justify-between gap-3 p-2.5 rounded-lg hover:bg-white/4 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-white/6 border border-white/8 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                  {s.name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-white truncate">{s.name}</div>
                  <div className={`text-[11px] font-medium ${urgencyClass(s.daysLeft)}`}>
                    {s.daysLeft === 0 ? 'Today' : s.daysLeft === 1 ? 'Tomorrow' : `in ${s.daysLeft} days`}
                  </div>
                </div>
              </div>
              <span className="text-sm font-semibold text-white shrink-0">{currency(s.cost)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
