import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { modalBackdrop, modalContent } from '../lib/motion.js'

const MAX_WIDTHS = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

/**
 * Animated modal — preserves the existing `{ open, title, onClose, children }` API.
 * Added optional `size` prop: 'sm' | 'md' | 'lg' | 'xl' (default: 'md').
 */
export default function Modal({ open, title, onClose, children, size = 'md' }) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={modalBackdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
          aria-labelledby="modal-title"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Panel */}
          <motion.div
            className={`relative w-full ${MAX_WIDTHS[size] ?? MAX_WIDTHS.md} bg-surface-2 border border-white/10 rounded-2xl shadow-modal overflow-hidden`}
            variants={modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top accent gradient line */}
            <div className="accent-line" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/6">
              <h3 id="modal-title" className="text-base font-semibold text-white">
                {title}
              </h3>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/8 transition-colors"
                aria-label="Close"
              >
                <X size={17} />
              </motion.button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
