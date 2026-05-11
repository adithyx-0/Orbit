import { useState, useRef, useEffect } from 'react'
import { Plus, Trash2, CheckCircle2, ChevronUp, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Modal from '../components/Modal.jsx'
import Badge from '../components/ui/Badge.jsx'
import TreeSvg from '../components/gamification/TreeSvg.jsx'
import LevelBadge from '../components/gamification/LevelBadge.jsx'
import { useData } from '../context/DataContext.jsx'
import { categoryVariant } from '../lib/format.js'
import { cn } from '../lib/cn.js'
import { fadeInUp, staggerContainer, staggerItem } from '../lib/motion.js'

const EMPTY_FORM = {
  title:              '',
  targetHoursPerWeek: 4,
  category:           'Learning',
  deadline:           '',
}

function progressColor(pct) {
  if (pct >= 100) return 'bg-amber-400'
  if (pct >= 75)  return 'bg-emerald-500'
  if (pct >= 40)  return 'bg-brand-500'
  if (pct >= 15)  return 'bg-amber-500'
  return 'bg-red-500'
}

// ── Goal card ─────────────────────────────────────────────────
function GoalCard({ goal, onUpdate, onDelete, celebrating }) {
  const pct = Math.min(100, Math.max(0, goal.progress ?? 0))
  const done = pct >= 100

  return (
    <motion.div
      variants={staggerItem}
      layout
      className={cn(
        'card p-5 transition-all duration-300',
        celebrating && 'ring-2 ring-amber-400/50 shadow-[0_0_24px_rgba(251,191,36,0.2)]',
      )}
    >
      {/* Card header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={categoryVariant(goal.category)} size="sm">
            {goal.category}
          </Badge>
          {goal.deadline && (
            <span className="text-[11px] text-slate-500">
              due {new Date(goal.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          )}
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            if (window.confirm('Delete this goal?')) onDelete(goal.id)
          }}
          className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/8 transition-colors shrink-0"
          aria-label="Delete goal"
        >
          <Trash2 size={13} />
        </motion.button>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-white mb-1 leading-snug">{goal.title}</h3>
      {goal.target_hours_per_week > 0 && (
        <p className="text-xs text-slate-500 mb-3">
          {goal.target_hours_per_week} h/week target
        </p>
      )}

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-500">Progress</span>
          <span className="text-xs font-semibold text-white">{pct}%</span>
        </div>
        <div className="h-2 bg-white/6 rounded-full overflow-hidden">
          <motion.div
            className={cn('h-full rounded-full', progressColor(pct))}
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1.5">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onUpdate(goal.id, { progress: Math.max(0, pct - 10) })}
            disabled={pct === 0}
            className="btn-secondary !px-2.5 !py-1.5 text-xs gap-1 disabled:opacity-30"
          >
            <ChevronDown size={12} /> 10%
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onUpdate(goal.id, { progress: Math.min(100, pct + 10) })}
            disabled={pct === 100}
            className="btn-secondary !px-2.5 !py-1.5 text-xs gap-1 disabled:opacity-30"
          >
            <ChevronUp size={12} /> 10%
          </motion.button>
        </div>

        {/* Completion badge */}
        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 16 }}
              className="flex items-center gap-1 text-xs font-semibold text-amber-400"
            >
              <CheckCircle2 size={13} />
              <span>Completed</span>
              <span className="text-sm">⭐</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ── Side panel: tree + level ──────────────────────────────────
function TreePanel({ goals }) {
  const { gamification } = useData()
  const { score, starCount } = gamification
  const completed = goals.filter(g => g.progress >= 100).length
  const total     = goals.length

  return (
    <div className="space-y-4 lg:sticky lg:top-24">
      <div className="card p-5">
        {/* Tree label */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Your Star Tree</h2>
          <span className="text-xs text-slate-500">
            {starCount} / {Math.max(total, 10)} stars
          </span>
        </div>

        {/* Tree SVG */}
        <div className="w-full max-w-[180px] mx-auto aspect-square">
          <TreeSvg filledCount={starCount} />
        </div>

        {/* Stats strip */}
        <div className="mt-4 pt-4 border-t border-white/6 flex items-center justify-around text-center">
          <Stat value={starCount}  label="Stars" />
          <div className="w-px h-8 bg-white/6" />
          <Stat value={completed}  label="Done" />
          <div className="w-px h-8 bg-white/6" />
          <Stat value={total - completed} label="Active" />
        </div>
      </div>

      {/* Level badge card */}
      <div className="card p-5">
        <p className="micro-label mb-3">Your level</p>
        <LevelBadge score={score} />
      </div>

      {/* Achievement hint */}
      {total === 0 && (
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="card p-4 text-center"
        >
          <p className="text-xs text-slate-500 leading-relaxed">
            Add your first goal and complete it to earn a star on your tree.
          </p>
        </motion.div>
      )}
    </div>
  )
}

function Stat({ value, label }) {
  return (
    <div>
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────
export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal } = useData()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  // Track goal completions for celebration glow
  const prevGoalsRef = useRef({})
  const [celebrating, setCelebrating] = useState(null) // goalId

  useEffect(() => {
    const prev = prevGoalsRef.current
    goals.forEach(g => {
      if (prev[g.id] !== undefined && prev[g.id] < 100 && g.progress >= 100) {
        setCelebrating(g.id)
        setTimeout(() => setCelebrating(null), 2200)
      }
    })
    prevGoalsRef.current = Object.fromEntries(goals.map(g => [g.id, g.progress]))
  }, [goals])

  const completed  = goals.filter(g => g.progress >= 100)
  const inProgress = goals.filter(g => g.progress > 0 && g.progress < 100)
  const notStarted = goals.filter(g => g.progress === 0)

  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    addGoal({ ...form, targetHoursPerWeek: Number(form.targetHoursPerWeek) || 0 })
    setForm(EMPTY_FORM)
    setOpen(false)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="flex items-start justify-between gap-4"
      >
        <div>
          <p className="micro-label mb-1">Gamification</p>
          <h1 className="page-title">Goals</h1>
          <p className="page-subtitle mt-1">
            Complete goals to earn stars and grow your tree.
          </p>
        </div>
        <button className="btn-primary shrink-0" onClick={() => setOpen(true)}>
          <Plus size={15} className="-ml-0.5" /> New goal
        </button>
      </motion.div>

      {/* Main layout */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Goals column */}
        <div className="lg:col-span-2 space-y-5">
          {goals.length === 0 ? (
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="card p-12 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl select-none">⭐</span>
              </div>
              <p className="text-slate-400 text-sm mb-4">
                No goals yet. Add one to start growing your Star Tree.
              </p>
              <button className="btn-primary" onClick={() => setOpen(true)}>
                <Plus size={15} /> Add first goal
              </button>
            </motion.div>
          ) : (
            <>
              {/* In progress */}
              {inProgress.length > 0 && (
                <GoalGroup title="In Progress" goals={inProgress} onUpdate={updateGoal} onDelete={deleteGoal} celebrating={celebrating} />
              )}
              {/* Not started */}
              {notStarted.length > 0 && (
                <GoalGroup title="Not Started" goals={notStarted} onUpdate={updateGoal} onDelete={deleteGoal} celebrating={celebrating} />
              )}
              {/* Completed */}
              {completed.length > 0 && (
                <GoalGroup title="Completed" goals={completed} onUpdate={updateGoal} onDelete={deleteGoal} celebrating={celebrating} />
              )}
            </>
          )}
        </div>

        {/* Tree panel */}
        <TreePanel goals={goals} />
      </div>

      {/* Add goal modal */}
      <Modal open={open} title="New goal" onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input
              className="input"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g., Finish data-structures course"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category</label>
              <select
                className="input"
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              >
                <option>Learning</option>
                <option>Entertainment</option>
                <option>Productivity</option>
                <option>Budget</option>
              </select>
            </div>
            <div>
              <label className="label">Target h / week</label>
              <input
                type="number"
                min="0"
                className="input"
                value={form.targetHoursPerWeek}
                onChange={e => setForm(f => ({ ...f, targetHoursPerWeek: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="label">Deadline (optional)</label>
            <input
              type="date"
              className="input"
              value={form.deadline}
              onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Create goal</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

// ── Section group ─────────────────────────────────────────────
function GoalGroup({ title, goals, onUpdate, onDelete, celebrating }) {
  return (
    <div>
      <p className="micro-label mb-3">{title} · {goals.length}</p>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid sm:grid-cols-2 gap-3"
      >
        {goals.map(g => (
          <GoalCard
            key={g.id}
            goal={g}
            onUpdate={onUpdate}
            onDelete={onDelete}
            celebrating={celebrating === g.id}
          />
        ))}
      </motion.div>
    </div>
  )
}
