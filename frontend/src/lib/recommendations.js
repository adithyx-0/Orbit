// Lightweight, deterministic "AI-style" recommendations generated from the
// user's subscription + usage data. A real ML model will replace this later.

import { costPerHour } from './format.js'

export function buildRecommendations(subscriptions, goals) {
  const recs = []

  for (const s of subscriptions) {
    if (s.status === 'cancelled') continue
    const cph = costPerHour(s.cost, s.hoursThisMonth)

    if (s.status === 'active' && s.hoursThisMonth === 0) {
      recs.push({
        id: 'rec_unused_' + s.id,
        severity: 'high',
        title: `${s.name} hasn't been used this month`,
        body: `You're paying ₹${s.cost} but recorded zero hours. Consider pausing or cancelling.`,
        action: 'Pause subscription',
        subscriptionId: s.id,
      })
      continue
    }

    if (cph && cph > 200) {
      recs.push({
        id: 'rec_expensive_' + s.id,
        severity: 'medium',
        title: `${s.name} is costing ₹${cph.toFixed(0)}/hour`,
        body: `Increase usage or downgrade the plan to improve ROI.`,
        action: 'Review plan',
        subscriptionId: s.id,
      })
    }
  }

  const learningGoal = goals.find(g => g.category === 'Learning' && g.progress < 60)
  if (learningGoal) {
    recs.push({
      id: 'rec_goal_' + learningGoal.id,
      severity: 'low',
      title: `You're behind on "${learningGoal.title}"`,
      body: `Schedule ${learningGoal.targetHoursPerWeek}h/week in morning slots — your focus is highest before noon.`,
      action: 'Open goal',
      goalId: learningGoal.id,
    })
  }

  const totalMonthly = subscriptions
    .filter(s => s.status === 'active')
    .reduce((acc, s) => acc + s.cost, 0)
  if (totalMonthly > 5000) {
    recs.push({
      id: 'rec_budget_cap',
      severity: 'medium',
      title: 'Monthly subscription spend is high',
      body: `You're at ₹${totalMonthly.toLocaleString('en-IN')}/month across active subs. Set a budget cap in Goals to stay on track.`,
      action: 'Set budget goal',
    })
  }

  return recs
}
