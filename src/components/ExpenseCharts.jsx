import { useMemo } from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts'
import { formatAmount } from '../utils/helpers'

/** Chart colors that match the app theme */
const CHART_COLORS = [
  '#58a6ff', // accent
  '#3fb950', // success
  '#d2a8ff',
  '#79c0ff',
  '#7ee787',
  '#ffa657',
  '#ff7b72',
  '#8b949e',
]

/**
 * Aggregates expenses by category for pie/bar charts.
 */
function useCategoryData(expenses) {
  return useMemo(() => {
    const byCategory = {}
    expenses.forEach((e) => {
      const cat = e.category || 'Other'
      const amt = Number(e.amount) || 0
      byCategory[cat] = (byCategory[cat] || 0) + amt
    })
    return Object.entries(byCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [expenses])
}

/**
 * Aggregates expenses by month (YYYY-MM) for trend chart.
 */
function useMonthlyData(expenses) {
  return useMemo(() => {
    const byMonth = {}
    expenses.forEach((e) => {
      const month = (e.date || '').slice(0, 7)
      if (!month) return
      const amt = Number(e.amount) || 0
      byMonth[month] = (byMonth[month] || 0) + amt
    })
    return Object.entries(byMonth)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [expenses])
}

/** Tooltip that shows ₦ and matches dark theme */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  const value = item.payload?.value ?? item.value
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-label">{label || item.name}</div>
      <div className="chart-tooltip-value">{formatAmount(value)}</div>
    </div>
  )
}

export default function ExpenseCharts({ expenses }) {
  const categoryData = useCategoryData(expenses)
  const monthlyData = useMonthlyData(expenses)

  if (expenses.length === 0) {
    return (
      <section className="expense-charts">
        <h2>Charts</h2>
        <p className="charts-empty">Add some expenses to see charts here.</p>
      </section>
    )
  }

  return (
    <section className="expense-charts">
      <h2>Charts</h2>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Spending by category</h3>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                  }
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3>Spending by month</h3>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  )
}
