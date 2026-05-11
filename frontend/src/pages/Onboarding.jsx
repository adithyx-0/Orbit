import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Check, BarChart2, Bell, Target, Sparkles, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

// ── Onboarding data ───────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'entertainment', label: 'Entertainment', emoji: '🎬', desc: 'Netflix, Spotify, Disney+' },
  { id: 'learning',      label: 'Learning',      emoji: '📚', desc: 'Coursera, Udemy, Duolingo' },
  { id: 'productivity',  label: 'Productivity',  emoji: '⚡', desc: 'Notion, Slack, Figma' },
  { id: 'ai_tools',      label: 'AI Tools',      emoji: '🤖', desc: 'ChatGPT, Copilot, Claude' },
  { id: 'health',        label: 'Health',        emoji: '🧘', desc: 'Headspace, Calm, Peloton' },
  { id: 'utilities',     label: 'Utilities',     emoji: '☁️', desc: 'Google One, iCloud, Dropbox' },
]

const BUDGETS = [
  { id: 'low',   label: 'Under ₹500',      sub: 'Light usage' },
  { id: 'mid',   label: '₹500 – ₹2,000',  sub: 'Moderate' },
  { id: 'high',  label: '₹2,000 – ₹5,000', sub: 'Heavy user' },
  { id: 'super', label: 'Over ₹5,000',     sub: 'Power user' },
]

const GOALS = [
  { id: 'track',   label: 'Track exactly where my money goes' },
  { id: 'unused',  label: 'Find subscriptions I never use' },
  { id: 'ai',      label: 'Get AI-powered spend recommendations' },
  { id: 'goals',   label: 'Set learning and productivity goals' },
]

// ── Animation helpers ─────────────────────────────────────────────────────────

const slide = {
  enter: (d) => ({ x: d > 0 ? 56 : -56, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.28, ease: [0.25, 0.4, 0.25, 1] } },
  exit:  (d) => ({ x: d > 0 ? -56 : 56, opacity: 0, transition: { duration: 0.2 } }),
}

// ── Landing page (step 0) ─────────────────────────────────────────────────────

function Landing({ onStart }) {
  return (
    <div className="min-h-screen bg-[#080812] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-brand-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-700/8 rounded-full blur-[80px] pointer-events-none" />

      <motion.div
        className="text-center max-w-xl relative z-10"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-12">
          <div className="w-11 h-11 rounded-xl bg-brand-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-brand-900/40">
            O
          </div>
          <span className="text-2xl font-bold tracking-tight">Prosit</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl font-black text-white leading-[1.05] tracking-tight">
          Control your
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-400 to-purple-400">
            subscriptions.
          </span>
        </h1>

        <p className="mt-6 text-lg text-slate-400 leading-relaxed max-w-md mx-auto">
          Prosit tracks every subscription you pay for, measures real cost-per-hour, and tells you exactly what's worth keeping.
        </p>

        {/* Feature chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          {[
            { icon: BarChart2, label: 'AI insights' },
            { icon: Bell,      label: 'Renewal alerts' },
            { icon: Target,    label: 'Goal tracking' },
            { icon: Zap,       label: 'Usage analytics' },
          ].map(({ icon: Icon, label }) => (
            <span key={label} className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/6 border border-white/8 rounded-full px-3 py-1.5">
              <Icon size={11} className="text-slate-500" />
              {label}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
          <button
            onClick={onStart}
            className="btn-primary text-base px-8 py-3.5 gap-2.5 w-full sm:w-auto justify-center shadow-lg shadow-brand-900/40"
          >
            Get started <ArrowRight size={17} />
          </button>
          <Link
            to="/login"
            className="btn-secondary text-sm px-7 py-3.5 w-full sm:w-auto justify-center"
          >
            Sign in
          </Link>
        </div>

        <p className="text-xs text-slate-700 mt-6">Free · No credit card required</p>
      </motion.div>
    </div>
  )
}

// ── Preference steps (1-3) + account creation (4) ────────────────────────────

export default function Onboarding() {
  const { signup, user } = useAuth()
  const navigate = useNavigate()

  const [step,       setStep]       = useState(0)
  const [dir,        setDir]        = useState(1)
  const [categories, setCategories] = useState([])
  const [budget,     setBudget]     = useState(null)
  const [goals,      setGoals]      = useState([])
  const [form,       setForm]       = useState({ name: '', email: '', password: '' })
  const [error,      setError]      = useState('')
  const [loading,    setLoading]    = useState(false)

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [user, navigate])

  const goTo = (s) => {
    setDir(s > step ? 1 : -1)
    setError('')
    setStep(s)
  }

  const toggle = (arr, setArr, id) =>
    setArr(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signup(form)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  // ── Landing ──
  if (step === 0) return <Landing onStart={() => goTo(1)} />

  // ── Step definitions ──
  const TOTAL = 4

  const stepContent = {
    1: {
      title:    'What do you subscribe to?',
      subtitle: "Select all that apply — we'll tailor your experience.",
      node: (
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map(c => {
            const sel = categories.includes(c.id)
            return (
              <button
                key={c.id}
                onClick={() => toggle(categories, setCategories, c.id)}
                className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                  sel
                    ? 'border-brand-500 bg-brand-500/12 text-white'
                    : 'border-white/8 bg-white/3 text-slate-400 hover:bg-white/6 hover:border-white/15 hover:text-white'
                }`}
              >
                <span className="text-2xl leading-none shrink-0">{c.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-tight">{c.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{c.desc}</p>
                </div>
                {sel && <Check size={13} className="text-brand-400 shrink-0 mt-0.5" />}
              </button>
            )
          })}
        </div>
      ),
      canNext: true,
    },
    2: {
      title:    "What's your monthly budget?",
      subtitle: 'Prosit will flag anything that goes over your limit.',
      node: (
        <div className="space-y-2">
          {BUDGETS.map(b => {
            const sel = budget === b.id
            return (
              <button
                key={b.id}
                onClick={() => setBudget(b.id)}
                className={`w-full flex items-center justify-between px-4 py-4 rounded-xl border transition-all ${
                  sel
                    ? 'border-brand-500 bg-brand-500/12 text-white'
                    : 'border-white/8 bg-white/3 text-slate-400 hover:bg-white/6 hover:border-white/15 hover:text-white'
                }`}
              >
                <div className="text-left">
                  <p className="text-sm font-semibold">{b.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{b.sub}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  sel ? 'bg-brand-500 border-brand-500' : 'border-white/20'
                }`}>
                  {sel && <Check size={10} className="text-white" />}
                </div>
              </button>
            )
          })}
        </div>
      ),
      canNext: !!budget,
    },
    3: {
      title:    'What do you want from Prosit?',
      subtitle: 'Pick everything that matters to you.',
      node: (
        <div className="space-y-2">
          {GOALS.map(g => {
            const sel = goals.includes(g.id)
            return (
              <button
                key={g.id}
                onClick={() => toggle(goals, setGoals, g.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all ${
                  sel
                    ? 'border-brand-500 bg-brand-500/12 text-white'
                    : 'border-white/8 bg-white/3 text-slate-400 hover:bg-white/6 hover:border-white/15 hover:text-white'
                }`}
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                  sel ? 'bg-brand-500 border-brand-500' : 'border-white/20'
                }`}>
                  {sel && <Check size={10} className="text-white" />}
                </div>
                <span className="text-sm text-left leading-snug">{g.label}</span>
              </button>
            )
          })}
        </div>
      ),
      canNext: true,
    },
    4: {
      title:    'Create your account',
      subtitle: "One step away — your data stays private and secure.",
      node: (
        <form id="signup-form" onSubmit={submit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="label">Your name</label>
            <input
              className="input"
              placeholder="Alex Kumar"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">Email address</label>
            <input
              className="input"
              type="email"
              placeholder="alex@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
              minLength={8}
            />
          </div>
        </form>
      ),
      canNext: false,
    },
  }

  const current = stepContent[step]

  return (
    <div className="min-h-screen bg-[#080812] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-brand-600/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">

        {/* Progress bar + back */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => goTo(step - 1)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors"
            >
              <ArrowLeft size={13} />
              {step === 1 ? 'Back to home' : 'Back'}
            </button>
            <span className="text-xs text-slate-600">Step {step} of {TOTAL}</span>
          </div>

          {/* Progress dots */}
          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL }, (_, i) => (
              <motion.div
                key={i}
                className="h-1 rounded-full"
                animate={{
                  backgroundColor: i < step ? '#4F46E5' : 'rgba(255,255,255,0.08)',
                  flex: i + 1 === step ? 3 : 1,
                }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
        </div>

        {/* Step card */}
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            className="bg-[#0d0d18] border border-white/8 rounded-2xl p-6 shadow-2xl"
          >
            <div className="mb-5">
              <h2 className="text-xl font-bold text-white">{current.title}</h2>
              <p className="text-sm text-slate-500 mt-1">{current.subtitle}</p>
            </div>

            {current.node}
          </motion.div>
        </AnimatePresence>

        {/* Next / Submit */}
        <div className="mt-4 space-y-3">
          {step < TOTAL ? (
            <button
              onClick={() => goTo(step + 1)}
              disabled={step === 2 && !budget}
              className="btn-primary w-full gap-2 justify-center py-3 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue <ArrowRight size={15} />
            </button>
          ) : (
            <button
              type="submit"
              form="signup-form"
              className="btn-primary w-full gap-2 justify-center py-3"
              disabled={loading}
            >
              {loading
                ? 'Creating your account…'
                : <><Sparkles size={15} /> Create account</>}
            </button>
          )}

          <p className="text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
