import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts'
import { useData } from '../context/DataContext.jsx'
import { currency, costPerHour } from '../lib/format.js'

export default function Analytics() {
  const { subscriptions, usage } = useData()

  const cphData = useMemo(() => {
    return subscriptions
      .filter(s => s.status !== 'cancelled')
      .map(s => ({
        name: s.name,
        costPerHour: costPerHour(s.cost, s.hoursThisMonth) || 0,
        cost: s.cost,
        hours: s.hoursThisMonth,
      }))
      .sort((a, b) => b.costPerHour - a.costPerHour)
  }, [subscriptions])

  const roiData = useMemo(() => {
    return subscriptions
      .filter(s => s.status === 'active')
      .map(s => ({
        name: s.name,
        utilization: Math.min(100, Math.round(((s.hoursThisMonth || 0) / 30) * 100)),
      }))
  }, [subscriptions])

  const totals = useMemo(() => {
    return usage.map(u => ({
      date: u.date.slice(5),
      total: (u.learning || 0) + (u.entertainment || 0) + (u.productivity || 0),
    }))
  }, [usage])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-slate-500">Cost-per-hour, utilization, and daily device usage.</p>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold mb-4">Cost per hour by service</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cphData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => '₹' + v} />
              <Tooltip formatter={(v) => currency(v)} />
              <Bar dataKey="costPerHour" fill="#3b63ff" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Utilization % (hrs vs. available)</h2>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roiData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={v => v + '%'} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
                <Tooltip formatter={(v) => v + '%'} />
                <Bar dataKey="utilization" fill="#10b981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold mb-4">Total daily usage (minutes)</h2>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={totals}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#3b63ff" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold mb-4">Breakdown table</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500">
              <tr className="border-b border-slate-100">
                <th className="text-left py-2">Service</th>
                <th className="text-right py-2">Monthly cost</th>
                <th className="text-right py-2">Hours</th>
                <th className="text-right py-2">Cost / hour</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cphData.map(r => (
                <tr key={r.name}>
                  <td className="py-2 font-medium">{r.name}</td>
                  <td className="py-2 text-right">{currency(r.cost)}</td>
                  <td className="py-2 text-right">{r.hours} h</td>
                  <td className="py-2 text-right">{r.costPerHour ? currency(r.costPerHour) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
