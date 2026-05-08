import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/cn.js'

const VARIANTS = {
  default:  'bg-white/4 border-white/8 shadow-card',
  glass:    'bg-white/6 backdrop-blur-xl border-white/12 shadow-card',
  elevated: 'bg-surface-2 border-white/8 shadow-card',
  brand:    'bg-brand-600/8 border-brand-500/15 shadow-card',
  flat:     'bg-white/3 border-white/6',
}

/**
 * Base card shell. Optionally interactive (hover lift + glow).
 *
 * Usage:
 *   <Card>…</Card>
 *   <Card variant="glass" hover>…</Card>
 *   <Card variant="brand" glow>…</Card>
 */
const Card = forwardRef(function Card(
  {
    children,
    variant  = 'default',
    hover    = false,
    glow     = false,
    className,
    ...props
  },
  ref
) {
  return (
    <motion.div
      ref={ref}
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
      className={cn(
        'rounded-xl border',
        VARIANTS[variant] ?? VARIANTS.default,
        hover && 'transition-all duration-300 hover:bg-white/7 hover:border-white/12 hover:shadow-card-hover cursor-pointer',
        glow  && 'shadow-glow-sm',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
})

/* ── Subcomponents ─────────────────────────────────────────── */

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={cn('px-6 pt-5 pb-0', className)} {...props}>
      {children}
    </div>
  )
}

export function CardBody({ children, className, ...props }) {
  return (
    <div className={cn('px-6 py-5', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div className={cn('px-6 pb-5 pt-0 border-t border-white/6 mt-1', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className, ...props }) {
  return (
    <h3 className={cn('font-semibold text-white text-base leading-tight', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardSubtitle({ children, className, ...props }) {
  return (
    <p className={cn('text-sm text-slate-400 mt-1', className)} {...props}>
      {children}
    </p>
  )
}

export default Card
