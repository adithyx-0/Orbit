import { cn } from '../../lib/cn.js'

const VARIANTS = {
  default:       'bg-white/8 text-slate-300 border-white/10',
  brand:         'bg-brand-500/15 text-brand-400 border-brand-500/20',
  success:       'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  warning:       'bg-amber-500/15 text-amber-400 border-amber-500/20',
  danger:        'bg-red-500/15 text-red-400 border-red-500/20',
  info:          'bg-sky-500/15 text-sky-400 border-sky-500/20',
  purple:        'bg-purple-500/15 text-purple-400 border-purple-500/20',
  // Category-specific
  entertainment: 'bg-pink-500/15 text-pink-400 border-pink-500/20',
  learning:      'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  productivity:  'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
  budget:        'bg-amber-500/15 text-amber-400 border-amber-500/20',
}

const SIZES = {
  sm: 'px-2 py-0.5 text-[10px] gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
  lg: 'px-3 py-1.5 text-sm gap-2',
}

/**
 * Pill badge for categories, statuses, and severity labels.
 *
 * @param {string} variant  - design variant key
 * @param {string} size     - sm | md | lg
 * @param {boolean} dot     - show a colored dot before the label
 */
export default function Badge({
  children,
  variant   = 'default',
  size      = 'md',
  dot       = false,
  className,
  ...props
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        VARIANTS[variant] ?? VARIANTS.default,
        SIZES[size]       ?? SIZES.md,
        className
      )}
      {...props}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0" />
      )}
      {children}
    </span>
  )
}
