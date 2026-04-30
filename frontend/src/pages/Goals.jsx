import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Modal from '../components/Modal.jsx'
import { useData } from '../context/DataContext.jsx'
import { categoryColor } from '../lib/format.js'

export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal } = useData()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    targetHoursPerWeek: 4,
    category: 'Learning',
    deadline: '',
  })

  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    addGoal({ ...form, targetHoursPerWeek: Number(form.targetHoursPerWeek) || 0 })
    setForm({ title: '', targetHoursPerWeek: 4, category: 'Learning', deadline: '' })
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Goals</h1>
          <p className="text-sm text-slate-500">Align subscriptions and time with what matters.</p>
        </div>
        <button className="btn-primary" onClick={() => setOpen(true)}><Plus size={16} /> New goal</button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {goals.length === 0 && (
          <div className="card p-8 text-center text-slate-500 md:col-span-2">
            No goals yet. Add one to start tracking progress.
          </div>
        )}
        {goals.map(g => (
          <div key={g.id} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${categoryColor(g.category)}`}>{g.category}</span>
                  {g.deadline && <span className="text-xs text-slate-500">due {g.deadline}</span>}
                </div>
                <h3 className="mt-2 font-semibold">{g.title}</h3>
                {g.targetHoursPerWeek > 0 && (
                  <p className="text-sm text-slate-500 mt-1">Target: {g.targetHoursPerWeek} h/week</p>
                )}
              </div>
              <button className="btn-danger !p-2" onClick={() => { if (confirm('Delete this goal?')) deleteGoal(g.id) }}>
                <Trash2 size={14} />
              </button>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Progress</span>
                <span>{g.progress}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-600 rounded-full" style={{ width: `${g.progress}%` }} />
              </div>
              <div className="mt-3 flex gap-2">
                <button className="btn-secondary" onClick={() => updateGoal(g.id, { progress: Math.max(0, g.progress - 10) })}>-10%</button>
                <button className="btn-secondary" onClick={() => updateGoal(g.id, { progress: Math.min(100, g.progress + 10) })}>+10%</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} title="New goal" onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g., Finish data-structures course" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option>Learning</option>
                <option>Entertainment</option>
                <option>Productivity</option>
                <option>Budget</option>
              </select>
            </div>
            <div>
              <label className="label">Target h/week</label>
              <input type="number" min="0" className="input" value={form.targetHoursPerWeek} onChange={e => setForm({ ...form, targetHoursPerWeek: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Deadline</label>
            <input type="date" className="input" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Create goal</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
