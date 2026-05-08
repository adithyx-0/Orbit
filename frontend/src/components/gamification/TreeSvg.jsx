import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { STAR_POSITIONS, MAX_STARS } from '../../lib/gamification.js'

// ── Tree geometry (viewBox "0 0 200 215") ────────────────────
// Three overlapping pine-foliage triangles, back-to-front
const FOLIAGE = [
  'M 100 80 L 198 168 L 2 168 Z',   // base (largest)
  'M 100 42 L 160 116 L 40 116 Z',  // middle
  'M 100 8  L 140 66  L 60 66  Z',  // top (smallest)
]
const TRUNK = 'M 88 168 L 112 168 L 112 198 L 88 198 Z'

// ── Star polygon centred at (0,0) ─────────────────────────────
function starPoints(outerR, innerR) {
  const pts = []
  for (let i = 0; i < 10; i++) {
    const r   = i % 2 === 0 ? outerR : innerR
    const ang = (i * 36 - 90) * (Math.PI / 180)
    pts.push(`${(r * Math.cos(ang)).toFixed(3)},${(r * Math.sin(ang)).toFixed(3)}`)
  }
  return pts.join(' ')
}

const STAR_OUTER = 8
const STAR_INNER = 3.4
const SLOT_OUTER = 4
const SLOT_INNER = 1.7
const STAR_COLOR = '#fbbf24'
const STAR_GLOW  = 'rgba(251,191,36,0.4)'

// ── Sparkle ring that expands and fades ───────────────────────
function RingPulse({ x, y }) {
  return (
    <motion.circle
      cx={x} cy={y} r={10}
      fill="none" stroke={STAR_COLOR} strokeWidth={1.2}
      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      initial={{ scale: 1, opacity: 0.7 }}
      animate={{ scale: 3.8, opacity: 0 }}
      transition={{ duration: 0.9, ease: 'easeOut' }}
    />
  )
}

// ── Particle burst when a star is earned ──────────────────────
function Sparkles({ x, y }) {
  const angles = [0, 45, 90, 135, 180, 225, 270, 315]
  return (
    <>
      {angles.map((deg, i) => {
        const rad  = deg * (Math.PI / 180)
        const dist = i % 2 === 0 ? 26 : 18
        return (
          <motion.circle
            key={deg}
            cx={x} cy={y}
            r={i % 2 === 0 ? 2 : 1.5}
            fill={STAR_COLOR}
            initial={{ opacity: 0.9, x: 0, y: 0, scale: 1 }}
            animate={{
              opacity: 0,
              x: Math.cos(rad) * dist,
              y: Math.sin(rad) * dist,
              scale: 0,
            }}
            transition={{ duration: 0.85, delay: i * 0.04, ease: [0.4, 0, 0.2, 1] }}
          />
        )
      })}
    </>
  )
}

// ── Earned star with entry spring + perpetual float ───────────
function EarnedStar({ pos, index, isNew }) {
  return (
    // Static translate: positions star in SVG coordinate space
    <g transform={`translate(${pos.x} ${pos.y})`}>
      {/* Entry animation wraps all visual elements */}
      <motion.g
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        initial={{ scale: 0, opacity: 0, rotate: isNew ? -160 : -25 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{
          type:      'spring',
          stiffness: isNew ? 180 : 320,
          damping:   isNew ? 10  : 18,
          delay:     isNew ? 0   : index * 0.07,
        }}
      >
        {/* Perpetual float — inner wrapper keeps it independent */}
        <motion.g
          animate={{ y: [0, -3.5, 0] }}
          transition={{
            repeat:   Infinity,
            duration: 2.4 + index * 0.28,
            ease:     'easeInOut',
            delay:    index * 0.22,
          }}
        >
          {/* Outer glow halo */}
          <circle r={14} fill={STAR_GLOW} opacity={0.4} />
          <circle r={10} fill={STAR_GLOW} opacity={0.3} />
          {/* Star body */}
          <polygon
            points={starPoints(STAR_OUTER, STAR_INNER)}
            fill={STAR_COLOR}
            opacity={0.95}
          />
        </motion.g>
      </motion.g>
    </g>
  )
}

// ── Empty slot placeholder ────────────────────────────────────
function EmptySlot({ pos, isApex }) {
  return (
    <g transform={`translate(${pos.x} ${pos.y})`}>
      {isApex && (
        <circle r={12} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} />
      )}
      <polygon
        points={starPoints(isApex ? SLOT_OUTER + 1 : SLOT_OUTER, isApex ? SLOT_INNER + 0.5 : SLOT_INNER)}
        fill="rgba(255,255,255,0.05)"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={0.5}
      />
    </g>
  )
}

// ── Main exported component ───────────────────────────────────
export default function TreeSvg({ filledCount }) {
  const clamped      = Math.min(filledCount, MAX_STARS)
  const prevCountRef = useRef(clamped)
  const [newIdx, setNewIdx] = useState(null)

  // Detect newly earned star while component is mounted
  useEffect(() => {
    if (clamped > prevCountRef.current) {
      const idx = clamped - 1
      setNewIdx(idx)
      const t = setTimeout(() => setNewIdx(null), 1800)
      prevCountRef.current = clamped
      return () => clearTimeout(t)
    }
    prevCountRef.current = clamped
  }, [clamped])

  const filledPositions = STAR_POSITIONS.slice(0, clamped)
  const emptyPositions  = STAR_POSITIONS.slice(clamped)

  return (
    <svg
      viewBox="0 0 200 210"
      className="w-full h-full select-none"
      aria-label={`Star tree with ${clamped} star${clamped !== 1 ? 's' : ''} earned`}
      role="img"
    >
      <defs>
        {/* Subtle ground glow */}
        <radialGradient id="ground-glow" cx="50%" cy="100%" r="50%">
          <stop offset="0%"   stopColor="rgba(16,185,129,0.12)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        {/* Foliage inner glow */}
        <radialGradient id="foliage-glow" cx="50%" cy="30%" r="60%">
          <stop offset="0%"   stopColor="rgba(16,185,129,0.08)" />
          <stop offset="100%" stopColor="rgba(16,185,129,0.02)" />
        </radialGradient>
      </defs>

      {/* Ground ambient glow */}
      <ellipse cx={100} cy={200} rx={60} ry={8} fill="url(#ground-glow)" />

      {/* ── Foliage layers ─────────────────────────────────── */}
      {FOLIAGE.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="url(#foliage-glow)"
          stroke="rgba(16,185,129,0.18)"
          strokeWidth={0.75}
          strokeLinejoin="round"
        />
      ))}

      {/* Trunk */}
      <path
        d={TRUNK}
        fill="rgba(109,72,30,0.45)"
        stroke="rgba(140,92,40,0.55)"
        strokeWidth={0.75}
        strokeLinejoin="round"
      />

      {/* ── Empty star slots ───────────────────────────────── */}
      {emptyPositions.map((pos, i) => (
        <EmptySlot
          key={`slot-${clamped + i}`}
          pos={pos}
          isApex={clamped + i === 0}
        />
      ))}

      {/* ── Filled (earned) stars ──────────────────────────── */}
      {filledPositions.map((pos, i) => (
        <EarnedStar
          key={`star-${i}`}
          pos={pos}
          index={i}
          isNew={i === newIdx}
        />
      ))}

      {/* ── Celebration effects for newest star ───────────── */}
      <AnimatePresence>
        {newIdx !== null && newIdx < STAR_POSITIONS.length && (
          <g key={`celebrate-${newIdx}`}>
            <RingPulse {...STAR_POSITIONS[newIdx]} />
            <Sparkles {...STAR_POSITIONS[newIdx]} />
          </g>
        )}
      </AnimatePresence>

      {/* "10+" overflow label when user has more than MAX_STARS */}
      {filledCount > MAX_STARS && (
        <text
          x={100} y={206}
          textAnchor="middle"
          fontSize={8}
          fill="rgba(251,191,36,0.6)"
          fontFamily="Inter, system-ui, sans-serif"
          fontWeight={600}
        >
          +{filledCount - MAX_STARS} more
        </text>
      )}
    </svg>
  )
}
