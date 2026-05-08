export const currency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0)

export const hours = (n) => `${(n ?? 0).toFixed(1)} h`

export const costPerHour = (cost, hrs) => {
  if (!hrs || hrs <= 0) return null
  return cost / hrs
}

// Returns Tailwind classes for .badge elements — dark-theme aware
export const categoryColor = (c) => {
  switch ((c || '').toLowerCase()) {
    case 'entertainment': return 'bg-pink-500/15 text-pink-400 border border-pink-500/20'
    case 'learning':      return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
    case 'productivity':  return 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
    case 'budget':        return 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
    default:              return 'bg-white/8 text-slate-400 border border-white/8'
  }
}

export const statusColor = (s) => {
  switch ((s || '').toLowerCase()) {
    case 'active':    return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
    case 'paused':    return 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
    case 'cancelled': return 'bg-white/6 text-slate-500 border border-white/8'
    default:          return 'bg-white/6 text-slate-500 border border-white/8'
  }
}

// Maps category name to a Badge ui component variant string
export const categoryVariant = (c) => {
  switch ((c || '').toLowerCase()) {
    case 'entertainment': return 'entertainment'
    case 'learning':      return 'learning'
    case 'productivity':  return 'productivity'
    case 'budget':        return 'budget'
    default:              return 'default'
  }
}

export const statusVariant = (s) => {
  switch ((s || '').toLowerCase()) {
    case 'active':    return 'success'
    case 'paused':    return 'warning'
    case 'cancelled': return 'default'
    default:          return 'default'
  }
}

export const severityVariant = (s) => {
  if (s === 'high')   return 'danger'
  if (s === 'medium') return 'warning'
  return 'default'
}
