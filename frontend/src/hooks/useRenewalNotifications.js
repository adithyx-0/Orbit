import { useEffect, useCallback, useState } from 'react'
import { useData } from '../context/DataContext.jsx'

const NOTIFY_KEY = 'prosit_notify_date'
const WINDOW_DAYS = 7

function daysUntil(dateStr) {
  if (!dateStr) return null
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000)
}

export function useRenewalNotifications() {
  const { subscriptions } = useData()
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  )

  const upcoming = subscriptions.filter(s => {
    if (s.status !== 'active') return false
    const d = daysUntil(s.renewsOn)
    return d !== null && d >= 0 && d <= WINDOW_DAYS
  }).sort((a, b) => daysUntil(a.renewsOn) - daysUntil(b.renewsOn))

  const fire = useCallback(() => {
    if (typeof Notification === 'undefined') return
    if (Notification.permission !== 'granted') return
    if (upcoming.length === 0) return
    const today = new Date().toISOString().slice(0, 10)
    if (localStorage.getItem(NOTIFY_KEY) === today) return
    upcoming.forEach(s => {
      const d = daysUntil(s.renewsOn)
      const when = d === 0 ? 'today' : d === 1 ? 'tomorrow' : `in ${d} days`
      new Notification(`${s.name} renews ${when}`, {
        body: `₹${s.cost} will be charged${s.paymentMethod ? ` via ${s.paymentMethod}` : ''}.`,
        icon: '/favicon.svg',
      })
    })
    localStorage.setItem(NOTIFY_KEY, today)
  }, [upcoming])

  // Fire once when subscriptions are loaded
  useEffect(() => {
    if (subscriptions.length > 0) fire()
  }, [subscriptions.length, fire])

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return
    const result = await Notification.requestPermission()
    setPermission(result)
    if (result === 'granted') {
      localStorage.removeItem(NOTIFY_KEY)
      fire()
    }
  }, [fire])

  return { permission, upcoming, requestPermission }
}
