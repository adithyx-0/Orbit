// Seed data shown until the backend is wired up.

export const seedSubscriptions = [
  {
    id: 'sub_seed_1',
    name: 'Netflix',
    category: 'Entertainment',
    cost: 649,
    billingCycle: 'monthly',
    renewsOn: '2026-05-03',
    status: 'active',
    hoursThisMonth: 12,
  },
  {
    id: 'sub_seed_2',
    name: 'Spotify',
    category: 'Entertainment',
    cost: 119,
    billingCycle: 'monthly',
    renewsOn: '2026-04-27',
    status: 'active',
    hoursThisMonth: 48,
  },
  {
    id: 'sub_seed_3',
    name: 'Coursera Plus',
    category: 'Learning',
    cost: 4133,
    billingCycle: 'monthly',
    renewsOn: '2026-05-10',
    status: 'active',
    hoursThisMonth: 6,
  },
  {
    id: 'sub_seed_4',
    name: 'Notion',
    category: 'Productivity',
    cost: 840,
    billingCycle: 'monthly',
    renewsOn: '2026-04-19',
    status: 'active',
    hoursThisMonth: 22,
  },
  {
    id: 'sub_seed_5',
    name: 'Adobe Creative Cloud',
    category: 'Productivity',
    cost: 1676,
    billingCycle: 'monthly',
    renewsOn: '2026-04-30',
    status: 'paused',
    hoursThisMonth: 0,
  },
  {
    id: 'sub_seed_6',
    name: 'Google One 200GB',
    category: 'Productivity',
    cost: 210,
    billingCycle: 'monthly',
    renewsOn: '2026-05-01',
    status: 'active',
    hoursThisMonth: 2,
  },
]

export const seedGoals = [
  {
    id: 'goal_seed_1',
    title: 'Finish ML specialization',
    targetHoursPerWeek: 6,
    category: 'Learning',
    deadline: '2026-06-30',
    progress: 35,
  },
  {
    id: 'goal_seed_2',
    title: 'Cut entertainment spend under ₹1000/mo',
    targetHoursPerWeek: 0,
    category: 'Budget',
    deadline: '2026-05-31',
    progress: 60,
  },
]

// Usage per day for the last 14 days (simulating device-agent data).
export const seedUsage = Array.from({ length: 14 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() - (13 - i))
  return {
    date: d.toISOString().slice(0, 10),
    learning: Math.round(30 + Math.random() * 90),
    entertainment: Math.round(40 + Math.random() * 140),
    productivity: Math.round(20 + Math.random() * 80),
  }
})
