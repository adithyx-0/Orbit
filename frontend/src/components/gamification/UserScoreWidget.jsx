import { useEffect, useRef, useMemo } from 'react'
import { animate, motion } from 'framer-motion'
import { useData } from '../../context/DataContext.jsx'
import {
  computeScore, getTier, getNextTier, getProgressToNext, TIERS,
} from '../../lib/gamification.js'
import { cn } from '../../lib/cn.js'

// ── Animated score counter ────────────────────────────────────
// Counts from previous value to new value whenever `value` changes.
function ScoreCounter({ value }) {
  const nodeRef = useRef(null)
  const prevRef = useRef(0)

  useEffect(() => {
    const from = prevRef.current
    const ctrl = animate(from, value, {
      duration: 1.4,
      ease: [0.25, 0.4, 0.25, 1],
      onUpdate: (v) => {
        if (nodeRef.current) nodeRef.current.textContent = Math.round(v)
      },
      onComplete: () => { prevRef.current = value },
    })
    return () => ctrl.stop()
  }, [value])

  return <span ref={nodeRef}>{value}</span>
}

// ── Circular progress ring ────────────────────────────────────
// Shows how far along the current tier's progress band we are.
const RING_R   = 44
const RING_C   = 2 * Math.PI * RING_R  // ≈ 276.5

function ScoreRing({ pct, color, score }) {
  const offset = RING_C * (1 - Math.min(100, pct) / 100)

  return (
    <div className="relative w-28 h-28 shrink-0">
      {/* SVG ring */}
      <svg
        viewBox="0 0 96 96"
        className="w-full h-full"
        style={{ transform: 'rotate(-90deg)' }}
        aria-hidden
      >
        {/* Track */}
        <circle
          cx={48} cy={48} r={RING_R}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={6}
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <motion.circle
          cx={48} cy={48} r={RING_R}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={RING_C}
          initial={{ strokeDashoffset: RING_C }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.3, ease: [0.25, 0.4, 0.25, 1], delay: 0.25 }}
        />
      </svg>

      {/* Score centred inside ring */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white tabular-nums leading-none">
          <ScoreCounter value={score} />
        </span>
        <span className="text-[10px] text-slate-500 mt-0.5 font-medium">pts</span>
      </div>
    </div>
  )
}

// ── Score breakdown rows ──────────────────────────────────────
function BreakdownRow({ label, pts }) {
  if (pts === 0) return null
  return (
    <div className="flex items-center justify-between gap-6">
      <span className="text-[11px] text-slate-500">{label}</span>
      <span className="text-[11px] font-semibold text-emerald-400 tabular-nums">+{pts}</span>
    </div>
  )
}

// ── Horizontal tier roadmap ───────────────────────────────────
function TierRoadmap({ score }) {
  const currentTier = getTier(score)

  return (
    <div className="flex items-center">
      {TIERS.map((t, i) => {
        const reached   = score >= t.min
        const isCurrent = currentTier.key === t.key

        return (
          <div key={t.key} className="flex items-center flex-1">
            {/* Node */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'w-6 h-6 rounded-full border flex items-center justify-center',
                  'transition-all duration-300',
                  reached ? t.badge : 'bg-white/4 border-white/8 opacity-30',
                )}
                style={isCurrent ? { boxShadow: `0 0 12px ${t.glow}` } : undefined}
                title={`${t.name} · ${t.min} pts`}
              >
                <t.Icon size={10} />
              </div>
              <span
                className={cn(
                  'text-[9px] leading-none font-medium transition-colors',
                  isCurrent ? 'text-white' : reached ? 'text-slate-500' : 'text-slate-700',
                )}
              >
                {t.name}
              </span>
            </div>

            {/* Connector line */}
            {i < TIERS.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-px mb-4 mx-1 transition-colors',
                  reached && score >= TIERS[i + 1]?.min ? 'bg-white/25' : 'bg-white/6',
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Panel divider ─────────────────────────────────────────────
function VDivider() {
  return <div className="hidden md:block w-px self-stretch bg-white/6 shrink-0" />
}

// ── Main widget ───────────────────────────────────────────────
export default function UserScoreWidget() {
  const { subscriptions, goals } = useData()

  const score = useMemo(() => computeScore(subscriptions, goals), [subscriptions, goals])
  const tier  = useMemo(() => getTier(score), [score])
  const next  = useMemo(() => getNextTier(score), [score])
  const pct   = useMemo(() => getProgressToNext(score), [score])

  // Score breakdown — what contributed to the total
  const completedGoals = goals.filter(g => g.progress >= 100).length
  const totalGoals     = goals.length
  const inProgress     = goals.filter(g => g.progress >= 25 && g.progress < 100).length
  const activeSubs     = subscriptions.filter(s => s.status === 'active').length

  const tierIndex = TIERS.findIndex(t => t.key === tier.key) + 1

  return (
    <div className="card overflow-hidden">
      {/* Top accent — tier-coloured */}
      <div
        className="h-px w-full"
        style={{
          background: `linear-gradient(to right, transparent, ${tier.color}60, transparent)`,
        }}
      />

      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6">

          {/* ── Panel 1: Tier identity ───────────────────── */}
          <div className="md:w-44 shrink-0 flex md:flex-col items-center md:items-start gap-4 md:gap-0">
            {/* Large icon */}
            <div
              className={cn(
                'w-14 h-14 rounded-2xl border-2 flex items-center justify-center shrink-0',
                tier.badge,
              )}
              style={{ boxShadow: `0 0 24px ${tier.glow}` }}
            >
              <tier.Icon size={26} />
            </div>

            <div className="md:mt-4">
              <p className="micro-label mb-1">Current level</p>
              <h2 className="text-2xl font-bold text-white leading-tight">{tier.name}</h2>
              <p className="text-xs text-slate-500 mt-1">
                Tier {tierIndex} of {TIERS.length}
              </p>
              {score === 0 && (
                <p className="text-xs text-slate-600 mt-2 leading-relaxed max-w-[12rem]">
                  Add goals and subscriptions to earn your first points.
                </p>
              )}
            </div>
          </div>

          <VDivider />

          {/* ── Panel 2: Score ring + breakdown ─────────── */}
          <div className="flex-1 flex flex-col md:flex-row items-center gap-6">
            {/* Ring */}
            <ScoreRing pct={pct} color={tier.color} score={score} />

            {/* Breakdown */}
            <div className="flex-1 min-w-0">
              <p className="micro-label mb-3">Score breakdown</p>
              {score === 0 ? (
                <p className="text-xs text-slate-600 italic">No points yet.</p>
              ) : (
                <div className="space-y-2">
                  <BreakdownRow
                    label={`${completedGoals} goal${completedGoals !== 1 ? 's' : ''} completed ×30`}
                    pts={completedGoals * 30}
                  />
                  <BreakdownRow
                    label={`${totalGoals} goal${totalGoals !== 1 ? 's' : ''} set ×10`}
                    pts={totalGoals * 10}
                  />
                  <BreakdownRow
                    label={`${inProgress} in-progress ×5`}
                    pts={inProgress * 5}
                  />
                  <BreakdownRow
                    label={`${activeSubs} active subscription${activeSubs !== 1 ? 's' : ''} ×5`}
                    pts={activeSubs * 5}
                  />
                </div>
              )}
            </div>
          </div>

          <VDivider />

          {/* ── Panel 3: Next tier + roadmap ────────────── */}
          <div className="md:w-52 shrink-0 flex flex-col justify-between gap-4">
            {/* Progress to next */}
            <div>
              <p className="micro-label mb-2">
                {next ? `Progress to ${next.name}` : 'Maximum tier reached'}
              </p>

              {next ? (
                <div className="space-y-2">
                  <div className="h-1.5 w-full bg-white/6 rounded-full overflow-hidden">
                    <motion.div
                      className={cn('h-full rounded-full', tier.bar)}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1.2, ease: [0.25, 0.4, 0.25, 1], delay: 0.3 }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">{score} pts</span>
                    <span className="text-slate-400 font-medium">{pct}%</span>
                    <span className="text-slate-500">{next.min} pts</span>
                  </div>

                  <p className="text-xs text-slate-500">
                    <span className="font-semibold text-white">{next.min - score}</span>
                    {' '}pts to unlock{' '}
                    <span className={cn('font-semibold', tier.badge.split(' ').find(c => c.startsWith('text-')))}>
                      {next.name}
                    </span>
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  You have reached the highest tier.
                </p>
              )}
            </div>

            {/* Tier roadmap */}
            <div>
              <p className="micro-label mb-2.5">Tier progression</p>
              <TierRoadmap score={score} />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
