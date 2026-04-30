export const currency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0)

export const hours = (n) => `${(n ?? 0).toFixed(1)} h`

export const costPerHour = (cost, hrs) => {
  if (!hrs || hrs <= 0) return null
  return cost / hrs
}

export const categoryColor = (c) => {
  switch ((c || '').toLowerCase()) {
    case 'entertainment': return 'bg-pink-100 text-pink-700'
    case 'learning': return 'bg-emerald-100 text-emerald-700'
    case 'productivity': return 'bg-indigo-100 text-indigo-700'
    case 'budget': return 'bg-amber-100 text-amber-700'
    default: return 'bg-slate-100 text-slate-700'
  }
}

export const statusColor = (s) => {
  switch ((s || '').toLowerCase()) {
    case 'active': return 'bg-emerald-100 text-emerald-700'
    case 'paused': return 'bg-amber-100 text-amber-700'
    case 'cancelled': return 'bg-slate-200 text-slate-600'
    default: return 'bg-slate-100 text-slate-600'
  }
}
