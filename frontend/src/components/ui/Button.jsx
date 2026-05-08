import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/cn.js'

const VARIANTS = {
  primary:   'bg-brand-600 text-white hover:bg-brand-500 shadow-glow-sm hover:shadow-glow',
  secondary: 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/8 hover:text-white hover:border-white/15',
  ghost:     'text-slate-400 hover:text-white hover:bg-white/6',
  danger:    'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/15 hover:border-red-500/30',
  success:   'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/15',
  brand:     'bg-gradient-brand text-white shadow-glow hover:shadow-glow-lg',
}

const SIZES = {
  xs:   'px-2.5 py-1.5 text-xs gap-1.5 rounded-md',
  sm:   'px-3 py-1.5 text-sm gap-1.5 rounded-lg',
  md:   'px-4 py-2 text-sm gap-2 rounded-lg',
  lg:   'px-5 py-2.5 text-base gap-2 rounded-xl',
  icon: 'p-2 rounded-lg',
}

const Button = forwardRef(function Button(
  {
    children,
    variant  = 'secondary',
    size     = 'md',
    loading  = false,
    className,
    disabled,
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading

  return (
    <motion.button
      ref={ref}
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      transition={{ duration: 0.1 }}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center font-medium',
        'transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        VARIANTS[variant] ?? VARIANTS.secondary,
        SIZES[size]        ?? SIZES.md,
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
          {children}
        </>
      ) : children}
    </motion.button>
  )
})

export default Button
