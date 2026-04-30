export default function StatCard({ label, value, sub, icon: Icon, accent = 'brand' }) {
  const accents = {
    brand:     'bg-brand-50 text-brand-700',
    emerald:   'bg-emerald-50 text-emerald-700',
    amber:     'bg-amber-50 text-amber-700',
    pink:      'bg-pink-50 text-pink-700',
    indigo:    'bg-indigo-50 text-indigo-700',
  }
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accents[accent]}`}>
            <Icon size={16} />
          </div>
        )}
      </div>
      <div className="mt-3 text-2xl font-bold">{value}</div>
      {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
    </div>
  )
}
