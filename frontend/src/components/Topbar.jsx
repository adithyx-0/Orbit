import { useNavigate } from 'react-router-dom'
import { LogOut, Bell } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Topbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const onLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const initials = (user?.name || 'U')
    .split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-8">
      <div>
        <div className="text-xs text-slate-500">Welcome back</div>
        <div className="text-sm font-semibold">{user?.name}</div>
      </div>

      <div className="flex items-center gap-3">
        <button className="btn-secondary !p-2" title="Notifications">
          <Bell size={18} />
        </button>
        <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-semibold">
          {initials}
        </div>
        <button className="btn-secondary" onClick={onLogout}>
          <LogOut size={16} /> Log out
        </button>
      </div>
    </header>
  )
}
