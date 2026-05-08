import { Sprout, Medal, Award, Trophy, Crown } from 'lucide-react'

// ── Tier definitions ─────────────────────────────────────────
export const TIERS = [
  {
    key:   'seedling',
    name:  'Seedling',
    min:   0,
    Icon:  Sprout,
    badge: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
    glow:  'rgba(148,163,184,0.2)',
    bar:   'bg-slate-400',
    color: '#94a3b8',  // for SVG strokes / non-Tailwind contexts
  },
  {
    key:   'bronze',
    name:  'Bronze',
    min:   50,
    Icon:  Medal,
    badge: 'bg-amber-700/20 text-amber-600 border-amber-700/30',
    glow:  'rgba(180,83,9,0.3)',
    bar:   'bg-amber-600',
    color: '#b45309',
  },
  {
    key:   'silver',
    name:  'Silver',
    min:   150,
    Icon:  Award,
    badge: 'bg-slate-300/15 text-slate-300 border-slate-400/20',
    glow:  'rgba(203,213,225,0.25)',
    bar:   'bg-slate-300',
    color: '#cbd5e1',
  },
  {
    key:   'gold',
    name:  'Gold',
    min:   350,
    Icon:  Trophy,
    badge: 'bg-amber-400/15 text-amber-400 border-amber-400/25',
    glow:  'rgba(251,191,36,0.35)',
    bar:   'bg-amber-400',
    color: '#fbbf24',
  },
  {
    key:   'platinum',
    name:  'Platinum',
    min:   700,
    Icon:  Crown,
    badge: 'bg-brand-500/15 text-brand-400 border-brand-500/20',
    glow:  'rgba(59,99,255,0.35)',
    bar:   'bg-brand-400',
    color: '#3b63ff',
  },
]

// ── Score computation ─────────────────────────────────────────
export function computeScore(subscriptions, goals) {
  let score = 0
  // Completed goals: 30 pts each — primary reward
  score += goals.filter(g => g.progress >= 100).length * 30
  // Goals set: 10 pts each — shows engagement
  score += goals.length * 10
  // Goals in meaningful progress (25–99%): 5 pts each
  score += goals.filter(g => g.progress >= 25 && g.progress < 100).length * 5
  // Active subscriptions: 5 pts each — shows platform use
  score += subscriptions.filter(s => s.status === 'active').length * 5
  return score
}

// ── Tier lookup ───────────────────────────────────────────────
export function getTier(score) {
  return [...TIERS].reverse().find(t => score >= t.min) ?? TIERS[0]
}

export function getNextTier(score) {
  return TIERS.find(t => t.min > score) ?? null
}

export function getProgressToNext(score) {
  const current = getTier(score)
  const next    = getNextTier(score)
  if (!next) return 100
  return Math.round(((score - current.min) / (next.min - current.min)) * 100)
}

// ── Star helpers ──────────────────────────────────────────────
export const MAX_STARS = 10

// Positions verified to lie within the foliage triangles in TreeSvg.
// Fills top-down so the first completed goal lights up the apex star.
export const STAR_POSITIONS = [
  { x: 100, y: 28  },  // 0 apex
  { x: 70,  y: 82  },  // 1 tier-2 left
  { x: 130, y: 82  },  // 2 tier-2 right
  { x: 57,  y: 122 },  // 3 tier-3 left
  { x: 100, y: 115 },  // 4 tier-3 centre
  { x: 143, y: 122 },  // 5 tier-3 right
  { x: 25,  y: 155 },  // 6 tier-4 far-left
  { x: 78,  y: 148 },  // 7 tier-4 left
  { x: 122, y: 148 },  // 8 tier-4 right
  { x: 175, y: 155 },  // 9 tier-4 far-right
]

export function getStarCount(goals) {
  return goals.filter(g => g.progress >= 100).length
}
