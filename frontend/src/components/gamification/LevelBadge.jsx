import { motion } from 'framer-motion'
import { cn } from '../../lib/cn.js'
import {
  getTier, getNextTier, getProgressToNext, TIERS,
} from '../../lib/gamification.js'

export default function LevelBadge({ score, compact = false }) {
  const tier     = getTier(score)
  const next     = getNextTier(score)
  const pct      = getProgressToNext(score)
  const { Icon } = tier

  if (compact) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1',
          'text-xs font-semibold border',
          tier.badge,
        )}
        title={`${tier.name} · ${score} pts`}
      >
        <Icon size={11} />
        {tier.name}
      </span>
    )
  }

  return (
    <div className="space-y-3">
      {/* Tier pill */}
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center border',
            tier.badge,
          )}
          style={{ boxShadow: `0 0 16px ${tier.glow}` }}
        >
          <Icon size={17} />
        </div>
        <div>
          <div className="text-base font-bold text-white leading-tight">{tier.name}</div>
          <div className="text-[11px] text-slate-500">{score} pts total</div>
        </div>
      </div>

      {/* Progress to next tier */}
      {next ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Progress to {next.name}</span>
            <span className="text-slate-400 font-medium">{pct}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/6 rounded-full overflow-hidden">
            <motion.div
              className={cn('h-full rounded-full', tier.bar)}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1], delay: 0.2 }}
            />
          </div>
          <div className="text-[10px] text-slate-600">
            {next.min - score} pts to {next.name}
          </div>
        </div>
      ) : (
        <div className="text-xs text-slate-400 italic">
          Maximum tier reached.
        </div>
      )}

      {/* All tiers mini-roadmap */}
      <div className="flex items-center gap-1 pt-1">
        {TIERS.map((t, i) => {
          const reached = score >= t.min
          return (
            <div key={t.key} className="flex items-center gap-1 flex-1">
              <div
                className={cn(
                  'w-4 h-4 rounded-full border flex items-center justify-center transition-all',
                  reached
                    ? cn(t.badge, 'scale-110')
                    : 'bg-white/4 border-white/8 opacity-40',
                )}
                title={t.name}
              >
                <t.Icon size={8} />
              </div>
              {i < TIERS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-px transition-colors',
                    reached && score >= TIERS[i + 1]?.min
                      ? 'bg-white/20'
                      : 'bg-white/6',
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
