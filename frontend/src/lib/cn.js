/**
 * Combines class names, filtering out falsy values.
 * Drop-in replacement for clsx without the dependency.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
