import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, CreditCard, BarChart3, Target,
  Settings as SettingsIcon, X,
} from 'lucide-react'
import { cn } from '../lib/cn.js'
import { sidebarSlide } from '../lib/motion.js'
import PrositLogo from './PrositLogo.jsx'

const NAV_LINKS = [
  { to: '/dashboard',     label: 'Dashboard',     Icon: LayoutDashboard },
  { to: '/subscriptions', label: 'Subscriptions', Icon: CreditCard },
  { to: '/analytics',     label: 'Analytics',     Icon: BarChart3 },
  { to: '/goals',         label: 'Goals',         Icon: Target },
  { to: '/settings',      label: 'Settings',      Icon: SettingsIcon },
]

/* ── Logo ──────────────────────────────────────────────────── */
function Logo() {
  return (
    <div className="flex items-center gap-3">
      <PrositLogo size={32} className="shrink-0" />
      <div>
        <div className="text-sm font-bold text-white tracking-wide leading-tight">PROSIT</div>
        <div className="text-[10px] text-slate-500 leading-tight">Subscription Intelligence</div>
      </div>
    </div>
  )
}

/* ── Single nav item ───────────────────────────────────────── */
function NavItem({ to, label, Icon, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5',
          'transition-all duration-200 border',
          isActive
            ? 'bg-brand-600/15 text-brand-400 border-brand-500/20'
            : 'text-slate-400 hover:bg-white/6 hover:text-slate-200 border-transparent'
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={17}
            className={cn(
              'shrink-0 transition-colors duration-200',
              isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'
            )}
          />
          <span className="flex-1">{label}</span>
          {isActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
          )}
        </>
      )}
    </NavLink>
  )
}

/* ── Shared nav list ───────────────────────────────────────── */
function NavList({ onClose }) {
  return (
    <nav className="flex-1 p-3 overflow-y-auto">
      <div className="micro-label px-3 mb-2">Navigation</div>
      {NAV_LINKS.map(({ to, label, Icon }) => (
        <NavItem key={to} to={to} label={label} Icon={Icon} onClick={onClose} />
      ))}
    </nav>
  )
}

/* ── Footer strip ──────────────────────────────────────────── */
function SidebarFooter() {
  return (
    <div className="p-4 border-t border-white/6">
      <div className="flex items-center gap-2 px-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow shrink-0" />
        <span className="text-[11px] text-slate-500">System online · v0.1.0</span>
      </div>
    </div>
  )
}

/* ── Desktop sidebar (always visible ≥ md) ─────────────────── */
export function DesktopSidebar() {
  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-surface-1 border-r border-white/6 shrink-0">
      <div className="h-16 px-5 flex items-center border-b border-white/6">
        <Logo />
      </div>
      <NavList />
      <SidebarFooter />
    </aside>
  )
}

/* ── Mobile sidebar (AnimatePresence overlay on < md) ──────── */
export function MobileSidebar({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.aside
            key="drawer"
            className="fixed inset-y-0 left-0 w-72 bg-surface-1 border-r border-white/6 z-50 md:hidden flex flex-col"
            variants={sidebarSlide}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="h-16 px-4 flex items-center justify-between border-b border-white/6">
              <Logo />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/6 transition-colors"
                aria-label="Close navigation"
              >
                <X size={18} />
              </motion.button>
            </div>
            <NavList onClose={onClose} />
            <SidebarFooter />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

// Default export for any existing direct imports
export default DesktopSidebar
