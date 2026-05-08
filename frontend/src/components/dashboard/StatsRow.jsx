import { motion } from 'framer-motion'
import { CreditCard, Clock, TrendingDown, AlertCircle } from 'lucide-react'
import StatCard from '../StatCard.jsx'
import { currency } from '../../lib/format.js'
import { EASE_OUT } from '../../lib/motion.js'

export default function StatsRow({ stats }) {
  const { monthly, totalHours, avgCph, unused, activeCount } = stats

  const cards = [
    {
      label: 'Monthly spend',
      value: currency(monthly),
      sub: `${activeCount} active subscription${activeCount !== 1 ? 's' : ''}`,
      icon: CreditCard,
      accent: 'brand',
    },
    {
      label: 'Hours tracked',
      value: `${totalHours.toFixed(1)} h`,
      sub: 'this month across services',
      icon: Clock,
      accent: 'indigo',
    },
    {
      label: 'Cost per hour',
      value: avgCph ? currency(avgCph) : '—',
      sub: avgCph ? 'lower is better' : 'no usage recorded yet',
      icon: TrendingDown,
      accent: 'emerald',
    },
    {
      label: 'Unused this month',
      value: String(unused),
      sub: unused === 0 ? 'All subscriptions active' : `${unused} with 0 hours`,
      icon: AlertCircle,
      accent: unused > 0 ? 'amber' : 'emerald',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.06, ease: EASE_OUT }}
        >
          <StatCard {...card} />
        </motion.div>
      ))}
    </div>
  )
}
