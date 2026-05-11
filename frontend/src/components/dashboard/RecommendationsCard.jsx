import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import Badge from '../ui/Badge.jsx'
import { severityVariant } from '../../lib/format.js'
import { staggerContainer, staggerItem } from '../../lib/motion.js'

export default function RecommendationsCard({ recommendations }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-brand-500/15 flex items-center justify-center">
          <Sparkles size={14} className="text-brand-400" />
        </div>
        <h2 className="section-title">AI recommendations</h2>
      </div>

      {recommendations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
            <Sparkles size={18} className="text-emerald-400" />
          </div>
          <p className="text-sm text-slate-400">All good — every subscription is earning its keep.</p>
        </div>
      ) : (
        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          <AnimatePresence>
            {recommendations.map(r => (
              <motion.li
                key={r.id}
                variants={staggerItem}
                className="flex items-start justify-between gap-4 p-4 rounded-xl bg-white/3 border border-white/6 hover:bg-white/5 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge variant={severityVariant(r.severity)} size="sm" dot>
                      {r.severity}
                    </Badge>
                    <span className="text-sm font-medium truncate" style={{ color: 'var(--c-text)' }}>{r.title}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{r.body}</p>
                </div>
                <Link
                  to={r.goalId ? '/goals' : '/subscriptions'}
                  className="btn-secondary shrink-0 text-xs px-3 py-1.5"
                >
                  {r.action}
                </Link>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  )
}
