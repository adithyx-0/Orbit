import { useAuth } from '../context/AuthContext.jsx'

export default function Settings() {
  const { user } = useAuth()

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-slate-500">Account and app preferences.</p>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold mb-4">Account</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Name</div>
            <div className="font-medium mt-1">{user?.name}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Email</div>
            <div className="font-medium mt-1">{user?.email}</div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold">Device agents</h2>
        <p className="text-sm text-slate-500 mt-1">Companion apps that push usage data to PROSIT.</p>
        <ul className="mt-4 space-y-3 text-sm">
          <li className="flex items-center justify-between">
            <span><strong>Android companion</strong> — Kotlin · not connected</span>
            <span className="badge-neutral">Pending</span>
          </li>
          <li className="flex items-center justify-between">
            <span><strong>Windows desktop agent</strong> — Python · not connected</span>
            <span className="badge-neutral">Pending</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
