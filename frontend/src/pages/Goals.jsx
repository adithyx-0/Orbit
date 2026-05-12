import { useState, useRef, useEffect } from 'react'
import { Plus, Trash2, CheckCircle2, Pencil, Flame } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Modal from '../components/Modal.jsx'
import Badge from '../components/ui/Badge.jsx'
import AiPanel from '../components/AiPanel.jsx'
import TreeSvg from '../components/gamification/TreeSvg.jsx'
import LevelBadge from '../components/gamification/LevelBadge.jsx'
import { useData } from '../context/DataContext.jsx'
import { categoryVariant } from '../lib/format.js'
import { cn } from '../lib/cn.js'
import { fadeInUp, staggerContainer, staggerItem } from '../lib/motion.js'

const GOAL_CATEGORIES = ['Learning', 'Productivity', 'Entertainment', 'Health', 'AI Tools', 'Other']

const EMPTY_FORM = {
  title:               '',
  targetHoursPerWeek:  4,
  category:            'Learning',
  deadline:            '',
}

function daysLeft(deadline) {
  if (!deadline) return null
  return Math.ceil((new Date(deadline) - new Date()) / 86400000)
}

function progressHex(pct) {
  if (pct >= 100) return '#F59E0B'
  if (pct >= 70)  return '#10B981'
  if (pct >= 30)  return '#3B82F6'
  if (pct >= 10)  return '#F59E0B'
  return '#EF4444'
}

// â”€â”€ Deadline badge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function DeadlineBadge({ deadline }) {
  if (!deadline) return null
  const days = daysLeft(deadline)
  const cls =
    days < 0    ? 'text-red-400' :
    days === 0  ? 'text-amber-400' :
    days <= 7   ? 'text-amber-400' :
    'text-slate-500'
  const label =
    days < 0    ? `${Math.abs(days)}d overdue` :
    days === 0  ? 'Due today' :
    `${days}d left`
  return <span className={`text-[11px] font-medium ${cls}`}>{label}</span>
}

// â”€â”€ Goal card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function GoalCard({ goal, onUpdate, onDelete, onEdit, celebrating }) {
  const pct  = Math.min(100, Math.max(0, goal.progress ?? 0))
  const done = pct >= 100

  const [draft, setDraft] = useState(pct)
  useEffect(() => { setDraft(pct) }, [pct])

  const commit = () => {
    if (draft !== pct) onUpdate(goal.id, { progress: draft })
  }

  return (
    <motion.div
      variants={staggerItem}
      layout
      className={cn(
        'card p-5 transition-all duration-300 flex flex-col gap-3',
        celebrating && 'ring-2 ring-amber-400/50 shadow-[0_0_24px_rgba(251,191,36,0.2)]',
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={categoryVariant(goal.category)} size="sm">
            {goal.category}
          </Badge>
          <DeadlineBadge deadline={goal.deadline} />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onEdit(goal)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/6 transition-colors"
            aria-label="Edit goal"
          >
            <Pencil size={12} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { if (window.confirm('Delete this goal?')) onDelete(goal.id) }}
            className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/8 transition-colors"
            aria-label="Delete goal"
          >
            <Trash2 size={12} />
          </motion.button>
        </div>
      </div>

      {/* Title */}
      <div>
        <h3 className="text-sm font-semibold leading-snug" style={{ color: 'var(--c-text)' }}>{goal.title}</h3>
        {goal.target_hours_per_week > 0 && (
          <p className="text-xs text-slate-500 mt-0.5">{goal.target_hours_per_week} h/week target</p>
        )}
      </div>

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-500">Progress</span>
          <span className="text-xs font-bold" style={{ color: progressHex(draft) }}>
            {draft}%
          </span>
        </div>

        {/* Animated bar */}
        <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: 'var(--c-skeleton)' }}>
          <motion.div
            className="h-full rounded-full"
            initial={false}
            animate={{ width: `${draft}%` }}
            transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
            style={{ background: progressHex(draft) }}
          />
        </div>

        {/* Slider */}
        <input
          type="range"
          min={0} max={100} step={5}
          value={draft}
          onChange={e => setDraft(Number(e.target.value))}
          onMouseUp={commit}
          onTouchEnd={commit}
          className="w-full h-0.5 cursor-pointer"
          style={{ accentColor: progressHex(draft) }}
        />

        {/* Milestone pips */}
        <div className="flex justify-between mt-1 px-0.5">
          {[25, 50, 75, 100].map(m => (
            <span
              key={m}
              className="text-[9px]"
              style={{ color: draft >= m ? progressHex(draft) : '#334155' }}
            >
              {m === 100 ? 'âœ“' : `${m}%`}
            </span>
          ))}
        </div>
      </div>

      {/* Completion badge */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 16 }}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 justify-center pt-1"
            style={{ borderTop: '1px solid var(--c-divider)' }}
          >
            <CheckCircle2 size={13} />
            Completed · great work!
            <span className="text-sm">⭐</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// â”€â”€ Edit goal form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function EditGoalForm({ goal, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title:                goal.title,
    category:             goal.category,
    target_hours_per_week: goal.target_hours_per_week,
    deadline:             goal.deadline || '',
    progress:             Math.round(goal.progress ?? 0),
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <form
      onSubmit={e => { e.preventDefault(); if (form.title.trim()) onSubmit(form) }}
      className="space-y-4"
    >
      <div>
        <label className="label">Title</label>
        <input
          className="input"
          value={form.title}
          onChange={e => set('title', e.target.value)}
          autoFocus
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Category</label>
          <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
            {GOAL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Target h / week</label>
          <input
            type="number" min="0" className="input"
            value={form.target_hours_per_week}
            onChange={e => set('target_hours_per_week', Number(e.target.value))}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Deadline</label>
          <input type="date" className="input" value={form.deadline}
            onChange={e => set('deadline', e.target.value)} />
        </div>
        <div>
          <label className="label">Progress (%)</label>
          <input type="number" min="0" max="100" className="input" value={form.progress}
            onChange={e => set('progress', Math.min(100, Math.max(0, Number(e.target.value))))} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">Save changes</button>
      </div>
    </form>
  )
}

// â”€â”€ Side panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function TreePanel({ goals }) {
  const { gamification } = useData()
  const { score, starCount, streak } = gamification
  const completed = goals.filter(g => g.progress >= 100).length

  return (
    <div className="space-y-4 lg:sticky lg:top-24">
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Star Tree</h2>
          <span className="text-xs text-slate-500">{starCount} stars</span>
        </div>
        <div className="w-full max-w-[180px] mx-auto aspect-square">
          <TreeSvg filledCount={starCount} />
        </div>
        <div className="mt-4 pt-4 flex items-center justify-around text-center" style={{ borderTop: '1px solid var(--c-divider)' }}>
          <Stat value={starCount}  label="Stars" />
          <div className="w-px h-8" style={{ background: 'var(--c-divider)' }} />
          <Stat value={completed}  label="Done" />
          <div className="w-px h-8" style={{ background: 'var(--c-divider)' }} />
          <Stat value={goals.length - completed} label="Active" />
        </div>
      </div>

      <div className="card p-5">
        <p className="micro-label mb-3">Your level</p>
        <LevelBadge score={score} />
      </div>

      {/* Streak card */}
      <div className={cn(
        'card p-4 flex items-center gap-3',
        streak?.currentStreak > 0 && 'border-amber-500/20 bg-amber-500/[0.04]'
      )}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: streak?.currentStreak > 0 ? 'rgba(245,158,11,0.15)' : 'var(--c-skeleton)' }}
        >
          <Flame size={16} className={streak?.currentStreak > 0 ? 'text-amber-400' : 'text-slate-500'} />
        </div>
        <div>
          <p className="text-lg font-bold leading-none" style={{ color: 'var(--c-text)' }}>
            {streak?.currentStreak ?? 0}
            <span className="text-xs text-slate-500 font-normal ml-1">day streak</span>
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Best: {streak?.longestStreak ?? 0} days
          </p>
        </div>
      </div>

      {goals.length === 0 && (
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="card p-4 text-center"
        >
          <p className="text-xs text-slate-500 leading-relaxed">
            Add your first goal and complete it to earn a star.
          </p>
        </motion.div>
      )}
    </div>
  )
}

function Stat({ value, label }) {
  return (
    <div>
      <div className="text-lg font-bold" style={{ color: 'var(--c-text)' }}>{value}</div>
      <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
    </div>
  )
}

// â”€â”€ Section group â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function GoalGroup({ title, goals, onUpdate, onDelete, onEdit, celebrating }) {
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
            onEdit={onEdit}
            celebrating={celebrating === g.id}
          />
        ))}
      </motion.div>
    </div>
  )
}

// â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal, gamification } = useData()
  const [openAdd, setOpenAdd] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState(EMPTY_FORM)

  const prevGoalsRef  = useRef({})
  const [celebrating, setCelebrating] = useState(null)

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

  const urgentCount = goals.filter(g => {
    const d = daysLeft(g.deadline)
    return d !== null && d <= 7 && g.progress < 100
  }).length

  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    addGoal({ ...form, targetHoursPerWeek: Number(form.targetHoursPerWeek) || 0 })
    setForm(EMPTY_FORM)
    setOpenAdd(false)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="flex items-start justify-between gap-4"
      >
        <div>
          <p className="micro-label mb-1">Gamification</p>
          <h1 className="page-title">Goals</h1>
          <p className="page-subtitle mt-1">Complete goals · earn stars · grow your tree.</p>
        </div>
        <button className="btn-primary shrink-0" onClick={() => setOpenAdd(true)}>
          <Plus size={15} className="-ml-0.5" /> New goal
        </button>
      </motion.div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4">
          <p className="text-xs text-slate-500 mb-1">Total goals</p>
          <p className="text-xl font-bold" style={{ color: 'var(--c-text)' }}>{goals.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500 mb-1">In progress</p>
          <p className="text-xl font-bold text-brand-400">{inProgress.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500 mb-1">Completed</p>
          <p className="text-xl font-bold text-emerald-400">{completed.length}</p>
        </div>
        <div className={`card p-4 ${urgentCount > 0 ? 'border-amber-500/20' : ''}`}>
          <p className="text-xs text-slate-500 mb-1">Due within 7d</p>
          <p className={`text-xl font-bold ${urgentCount > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
            {urgentCount}
          </p>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Goals list */}
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
              <button className="btn-primary" onClick={() => setOpenAdd(true)}>
                <Plus size={15} /> Add first goal
              </button>
            </motion.div>
          ) : (
            <>
              {inProgress.length > 0 && (
                <GoalGroup title="In Progress" goals={inProgress} onUpdate={updateGoal}
                  onDelete={deleteGoal} onEdit={setEditing} celebrating={celebrating} />
              )}
              {notStarted.length > 0 && (
                <GoalGroup title="Not Started" goals={notStarted} onUpdate={updateGoal}
                  onDelete={deleteGoal} onEdit={setEditing} celebrating={celebrating} />
              )}
              {completed.length > 0 && (
                <GoalGroup title="Completed" goals={completed} onUpdate={updateGoal}
                  onDelete={deleteGoal} onEdit={setEditing} celebrating={celebrating} />
              )}
            </>
          )}

          {/* AI coaching panel */}
          {goals.length > 0 && (
            <AiPanel
              title="Prosit AI · Goal Coach"
              subtitle="Get personalised coaching based on your current progress"
              prompt="Review all my goals, their progress percentages, and deadlines. Which goals am I at risk of missing? What should I focus on this week? Give me practical, motivating coaching advice in 3-4 bullet points."
            />
          )}
        </div>

        {/* Tree side panel */}
        <TreePanel goals={goals} />
      </div>

      {/* Add modal */}
      <Modal open={openAdd} title="New goal" onClose={() => setOpenAdd(false)}>
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
                {GOAL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Target h / week</label>
              <input
                type="number" min="0" className="input"
                value={form.targetHoursPerWeek}
                onChange={e => setForm(f => ({ ...f, targetHoursPerWeek: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="label">Deadline (optional)</label>
            <input
              type="date" className="input"
              value={form.deadline}
              onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn-secondary" onClick={() => setOpenAdd(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Create goal</button>
          </div>
        </form>
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editing} title="Edit goal" onClose={() => setEditing(null)}>
        {editing && (
          <EditGoalForm
            goal={editing}
            onSubmit={(patch) => { updateGoal(editing.id, patch); setEditing(null) }}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </div>
  )
}
