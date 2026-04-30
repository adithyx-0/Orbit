import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, CreditCard, BarChart3, Target, Settings as SettingsIcon,
} from 'lucide-react'

const links = [
  { to: '/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { to: '/analytics',     label: 'Analytics',     icon: BarChart3 },
  { to: '/goals',         label: 'Goals',         icon: Target },
  { to: '/settings',      label: 'Settings',      icon: SettingsIcon },
]

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-slate-200 shrink-0">
      <div className="h-16 px-6 flex items-center border-b border-slate-200">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold">P</div>
        <div className="ml-3">
          <div className="text-sm font-semibold leading-tight">PROSIT</div>
          <div className="text-[11px] text-slate-500 leading-tight">Subscription Intelligence</div>
        </div>
      </div>

      <nav className="p-3 flex-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium mb-1 transition',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              ].join(' ')
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 text-[11px] text-slate-400">
        v0.1.0
      </div>
    </aside>
  )
}
