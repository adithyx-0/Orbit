/**
 * Shared Framer Motion animation variants.
 * Import these instead of defining inline animations per component.
 */

// ── Easing curves ────────────────────────────────────────────
export const EASE_OUT   = [0.25, 0.4,  0.25, 1]
export const EASE_SPRING = [0.175, 0.885, 0.32, 1.1]
export const EASE_SMOOTH = [0.4, 0, 0.2, 1]

// ── Fade ─────────────────────────────────────────────────────
export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: EASE_OUT } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
}

export const fadeInUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
  exit:    { opacity: 0, y: 8, transition: { duration: 0.2 } },
}

export const fadeInDown = {
  hidden:  { opacity: 0, y: -12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE_OUT } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
}

// ── Scale ─────────────────────────────────────────────────────
export const scaleIn = {
  hidden:  { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: EASE_OUT } },
  exit:    { opacity: 0, scale: 0.96, transition: { duration: 0.15 } },
}

// ── Slide ─────────────────────────────────────────────────────
export const slideInLeft = {
  hidden:  { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: EASE_OUT } },
  exit:    { opacity: 0, x: -10, transition: { duration: 0.2 } },
}

export const slideInRight = {
  hidden:  { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: EASE_OUT } },
  exit:    { opacity: 0, x: 10, transition: { duration: 0.2 } },
}

// ── Stagger container + child ─────────────────────────────────
export const staggerContainer = {
  hidden:  {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren:   0.05,
    },
  },
}

export const staggerItem = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE_OUT } },
}

// ── Page transition (wraps <Outlet> content) ──────────────────
export const pageTransition = {
  hidden:  { opacity: 0, y: 10 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.35, ease: EASE_OUT },
  },
  exit: {
    opacity: 0, y: -6,
    transition: { duration: 0.2 },
  },
}

// ── Modal ─────────────────────────────────────────────────────
export const modalBackdrop = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.15 } },
}

export const modalContent = {
  hidden:  { opacity: 0, scale: 0.96, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: EASE_OUT } },
  exit:    { opacity: 0, scale: 0.97, y: 4,  transition: { duration: 0.15 } },
}

// ── Mobile sidebar ────────────────────────────────────────────
export const sidebarSlide = {
  hidden:  { x: -288, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.3, ease: EASE_OUT } },
  exit:    { x: -288, opacity: 0, transition: { duration: 0.22, ease: EASE_SMOOTH } },
}

// ── Card hover (use with whileHover) ──────────────────────────
export const cardHoverProps = {
  whileHover: { y: -2, transition: { duration: 0.2, ease: EASE_OUT } },
  whileTap:   { scale: 0.99 },
}

// ── Button tap ────────────────────────────────────────────────
export const buttonTap = {
  whileTap: { scale: 0.97 },
}
