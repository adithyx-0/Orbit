/**
 * PrositLogo — single source of truth for the Prosit "P" mark.
 * Uses an inline SVG so it renders crisply at any size.
 *
 * Props:
 *   size      — pixel dimension (width = height), default 32
 *   className — extra Tailwind / CSS classes
 */
export default function PrositLogo({ size = 32, className = '' }) {
  const id = 'pl-grad'   // static ID is fine; only one logo renders at a time
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Prosit logo"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4338CA" />
        </linearGradient>
      </defs>

      {/* Rounded square background */}
      <rect width="32" height="32" rx="8" fill={`url(#${id})`} />

      {/* P letterform — stem + bowl */}
      <path d="M9 23V9h7.5a5 5 0 010 10H12v4H9zm3-7h4.5a2 2 0 000-4H12v4z" fill="#fff" />
    </svg>
  )
}
