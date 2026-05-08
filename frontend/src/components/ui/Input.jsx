import { forwardRef } from 'react'
import { cn } from '../../lib/cn.js'

/**
 * Dark-themed text input with optional icon, label, error, and hint.
 */
const Input = forwardRef(function Input(
  { label, error, hint, icon: Icon, className, id, ...props },
  ref
) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
            <Icon size={15} />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-lg border border-white/10 bg-white/5',
            'px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500',
            'transition-all duration-200',
            'hover:border-white/15 hover:bg-white/7',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/40',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            Icon && 'pl-9',
            error && 'border-red-500/50 focus:ring-red-500/30 focus:border-red-500/40',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  )
})

/**
 * Dark-themed select dropdown.
 */
export const Select = forwardRef(function Select(
  { label, error, className, children, id, ...props },
  ref
) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide"
        >
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={cn(
          'w-full rounded-lg border border-white/10 bg-surface-2',
          'px-3 py-2.5 text-sm text-slate-100 cursor-pointer',
          'transition-all duration-200',
          'hover:border-white/15',
          'focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/40',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          error && 'border-red-500/50',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="mt-1.5 text-xs text-red-400">{error}</p>
      )}
    </div>
  )
})

export default Input
