import { Link } from 'react-router-dom'
import { Star, ArrowRight, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import TreeSvg from './TreeSvg.jsx'
import LevelBadge from './LevelBadge.jsx'
import { useData } from '../../context/DataContext.jsx'
import { MAX_STARS } from '../../lib/gamification.js'
import { fadeInUp, staggerContainer, staggerItem } from '../../lib/motion.js'

export default function StarTreeWidget() {
  const { gamification, goals } = useData()
  const { score, starCount } = gamification

  const completed  = goals.filter(g => g.progress >= 100).length
  const inProgress = goals.filter(g => g.progress > 0 && g.progress < 100).length
  const totalGoals = goals.length

  return (
    <div className="card p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-400/15 border border-amber-400/25 flex items-center justify-center">
            <Star size={13} className="text-amber-400" />
          </div>
          <h2 className="section-title">Star Tree</h2>
        </div>
        <Link to="/goals" className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors">
          View goals <ArrowRight size={12} />
        </Link>
      </div>

      <div className="flex gap-5 items-center">
        <div className="w-36 shrink-0 aspect-square">
          <TreeSvg filledCount={starCount} />
        </div>

        <div className="flex-1 min-w-0 space-y-4">
          <LevelBadge score={score} compact />

          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-2">
            <Stat
              label="Stars earned"
              value={`${starCount} / ${Math.max(totalGoals, MAX_STARS)}`}
              sub={starCount >= MAX_STARS ? 'Tree full!' : `${MAX_STARS - starCount} slots remaining`}
            />
            <Stat
              label="Goals completed"
              value={completed}
              sub={`${inProgress} in progress`}
              icon={<CheckCircle2 size={11} className="text-emerald-400" />}
            />
          </motion.div>
        </div>
      </div>

      {totalGoals === 0 && (
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="text-center py-2">
          <p className="text-xs text-slate-500">
            Complete goals to grow your tree.{' '}
            <Link to="/goals" className="text-brand-400 hover:underline">Start now →</Link>
          </p>
        </motion.div>
      )}
    </div>
  )
}

function Stat({ label, value, sub, icon }) {
  return (
    <motion.div variants={staggerItem} className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        {icon}
        {label}
      </div>
      <div className="text-right">
        <span className="text-sm font-semibold text-white">{value}</span>
        {sub && <div className="text-[10px] text-slate-600">{sub}</div>}
      </div>
    </motion.div>
  )
}
