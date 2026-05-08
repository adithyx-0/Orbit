import { useNavigate } from 'react-router-dom'
import { LogOut, Bell, Menu } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const onLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const initials = (user?.name || 'U')
    .split(' ')
    .map(s => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="h-16 bg-surface-1/80 backdrop-blur-xl border-b border-white/6 flex items-center justify-between px-5 md:px-8 shrink-0 sticky top-0 z-30">

      {/* Left: hamburger (mobile) + greeting */}
      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-colors"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </motion.button>

        <div>
          <div className="text-[11px] text-slate-500">Welcome back</div>
          <div className="text-sm font-semibold text-white leading-tight">{user?.name}</div>
        </div>
      </div>

      {/* Right: notification bell + avatar + sign-out */}
      <div className="flex items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-colors"
          title="Notifications"
        >
          <Bell size={18} />
          {/* Unread indicator */}
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-500 ring-1 ring-surface-1" />
        </motion.button>

        <div className="w-px h-5 bg-white/8" />

        <div className="flex items-center gap-2">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-xs font-bold text-brand-400 shrink-0">
            {initials}
          </div>

          {/* Sign-out (hidden on very small screens) */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onLogout}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/8 transition-all duration-200"
          >
            <LogOut size={15} />
            <span>Sign out</span>
          </motion.button>
        </div>
      </div>
    </header>
  )
}
