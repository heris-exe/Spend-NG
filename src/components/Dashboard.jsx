import { useMemo } from 'react'
import { formatAmount, todayStr } from '../utils/helpers'

/**
 * Dashboard shows three stat cards: today, this month, all time.
 * useMemo avoids recalculating on every render when expenses haven't changed.
 */
export default function Dashboard({ expenses }) {
  const { totalToday, totalMonth, totalAll } = useMemo(() => {
    const today = todayStr()
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()

    let totalToday = 0
    let totalMonth = 0
    let totalAll = 0

    expenses.forEach((e) => {
      const amt = Number(e.amount) || 0
      totalAll += amt
      if (e.date === today) totalToday += amt
      const d = new Date(e.date + 'T12:00:00')
      if (d.getFullYear() === year && d.getMonth() === month) totalMonth += amt
    })

    return { totalToday, totalMonth, totalAll }
  }, [expenses])

  return (
    <section className="dashboard">
      <h2>Dashboard</h2>
      <div className="stats">
        <div className="stat-card today">
          <span className="stat-label">Today</span>
          <span className="stat-value">{formatAmount(totalToday)}</span>
        </div>
        <div className="stat-card month">
          <span className="stat-label">This month</span>
          <span className="stat-value">{formatAmount(totalMonth)}</span>
        </div>
        <div className="stat-card all">
          <span className="stat-label">All time</span>
          <span className="stat-value">{formatAmount(totalAll)}</span>
        </div>
      </div>
    </section>
  )
}
