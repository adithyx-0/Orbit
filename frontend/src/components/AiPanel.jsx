import { useState } from 'react'
import { Sparkles, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../lib/api.js'

export default function AiPanel({ prompt, title, subtitle }) {
  const [reply,    setReply]    = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [expanded, setExpanded] = useState(true)

  const ask = async () => {
    if (loading) return
    setLoading(true)
    setExpanded(true)
    try {
      const { data } = await api.post('/chat', { message: prompt })
      setReply(data.reply)
    } catch {
      setReply('Could not reach Prosit AI — check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-brand-500/20 bg-brand-600/[0.06] overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="w-8 h-8 rounded-lg bg-brand-600/25 flex items-center justify-center shrink-0">
          <Sparkles size={14} className="text-brand-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {reply && !loading && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-white transition-colors"
              aria-label={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
          <button
            onClick={ask}
            disabled={loading}
            className="btn-primary text-xs !px-3 !py-1.5 gap-1.5 shrink-0"
          >
            {loading ? (
              <><RefreshCw size={12} className="animate-spin" /> Thinking…</>
            ) : reply ? (
              <><RefreshCw size={12} /> Refresh</>
            ) : (
              <><Sparkles size={12} /> Ask AI</>
            )}
          </button>
        </div>
      </div>

      {loading && (
        <div className="px-5 pb-4">
          <div className="border-t border-white/6 pt-4 flex items-center gap-2">
            {[0, 150, 300].map(d => (
              <span
                key={d}
                className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce"
                style={{ animationDelay: `${d}ms` }}
              />
            ))}
            <span className="text-xs text-slate-500 ml-1">Prosit AI is analysing your data…</span>
          </div>
        </div>
      )}

      {reply && !loading && expanded && (
        <div className="px-5 pb-5">
          <div className="border-t border-white/6 pt-4">
            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{reply}</p>
          </div>
        </div>
      )}
    </div>
  )
}
