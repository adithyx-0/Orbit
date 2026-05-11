import { motion } from 'framer-motion'
import { cn } from '../lib/cn.js'

const ACCENTS = {
  brand:   { icon: 'bg-brand-500/15 text-brand-400',   glow: 'group-hover:shadow-glow-sm' },
  emerald: { icon: 'bg-emerald-500/15 text-emerald-400', glow: '' },
  amber:   { icon: 'bg-amber-500/15 text-amber-400',   glow: '' },
  pink:    { icon: 'bg-pink-500/15 text-pink-400',     glow: '' },
  indigo:  { icon: 'bg-indigo-500/15 text-indigo-400', glow: '' },
  red:     { icon: 'bg-red-500/15 text-red-400',       glow: '' },
}

/**
 * KPI stat card — dark glass style.
 * Preserves the original `{ label, value, sub, icon, accent }` API.
 * Added optional `trend` prop: 'up' | 'down' for the sub-label indicator.
 */
export default function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = 'brand',
  trend,
}) {
  const { icon: iconClass, glow } = ACCENTS[accent] ?? ACCENTS.brand

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn('card p-5 group relative overflow-hidden transition-all duration-300', glow)}
    >
      {/* Subtle inner radial on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <div className="micro-label">{label}</div>
          {Icon && (
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', iconClass)}>
              <Icon size={15} />
            </div>
          )}
        </div>

        <div className="mt-3 text-2xl font-bold tracking-tight" style={{ color: 'var(--c-text)' }}>{value}</div>

        {sub && (
          <div className="mt-1 text-xs text-slate-500 flex items-center gap-1">
            {trend === 'up'   && <span className="text-emerald-400 font-medium">↑</span>}
            {trend === 'down' && <span className="text-red-400 font-medium">↓</span>}
            {sub}
          </div>
        )}
      </div>
    </motion.div>
  )
}
