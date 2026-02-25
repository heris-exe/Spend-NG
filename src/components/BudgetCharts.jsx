/**
 * Charts for budget vs spent and budget status (on track / near / over).
 * Gives a quick visual of how each budget compares to spending and overall health.
 */

import { useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { formatAmount } from '@/utils/helpers'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const AXIS_TICK = '#737373'
const BAR_LIMIT = '#737373'
const BAR_SPENT_OK = '#22d3ee'
const BAR_SPENT_NEAR = '#fbbf24'
const BAR_SPENT_OVER = '#ef4444'
const PIE_OK = '#22c55e'
const PIE_NEAR = '#f59e0b'
const PIE_OVER = '#ef4444'

/** Short label for chart: "Overall (Mo)" or "Food (Wk)" etc. */
function getBudgetChartLabel({ budget }) {
  const scope = budget.scope === 'overall' ? 'Overall' : (budget.category || 'Category')
  const period = budget.periodType === 'month' ? 'Mo' : budget.periodType === 'week' ? 'Wk' : 'Day'
  return `${scope} (${period})`
}

/** Build bar chart data: one row per budget with limit and spent for grouped comparison. */
function useBudgetBarData(budgetProgress) {
  return useMemo(() => {
    return budgetProgress.map(({ budget, spent, state }) => {
      const limit = Number(budget.amount) || 0
      return {
        name: getBudgetChartLabel({ budget }),
        fullName: `${budget.scope === 'overall' ? 'Overall' : budget.category || 'Category'} · ${budget.periodType}`,
        limit,
        spent,
        over: state === 'over' ? spent - limit : 0,
        state,
      }
    })
  }, [budgetProgress])
}

/** Build pie data: count of budgets by state (on track, near, over). */
function useBudgetStatusData(budgetProgress) {
  return useMemo(() => {
    const counts = { ok: 0, near: 0, over: 0 }
    budgetProgress.forEach(({ state }) => {
      if (state === 'over') counts.over++
      else if (state === 'near') counts.near++
      else counts.ok++
    })
    return [
      { name: 'On track', value: counts.ok, color: PIE_OK },
      { name: 'Near limit', value: counts.near, color: PIE_NEAR },
      { name: 'Over budget', value: counts.over, color: PIE_OVER },
    ].filter((d) => d.value > 0)
  }, [budgetProgress])
}

function BudgetBarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-sm shadow-md">
      <div className="font-medium text-foreground">{d.fullName}</div>
      <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
        <div>Limit: {formatAmount(d.limit)}</div>
        <div>Spent: {formatAmount(d.spent)}</div>
        {d.over > 0 && (
          <div className="text-destructive">Over by {formatAmount(d.over)}</div>
        )}
      </div>
    </div>
  )
}

function BudgetPieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-sm shadow-md">
      <div className="font-medium" style={{ color: d.color }}>{d.name}</div>
      <div className="text-muted-foreground">{d.value} budget{d.value !== 1 ? 's' : ''}</div>
    </div>
  )
}

const cardClass = 'overflow-hidden border-border bg-card shadow-sm transition-shadow hover:shadow-md rounded-xl'

/** Bar chart: Budget limit vs amount spent per budget. */
export function BudgetVsSpentChart({ budgetProgress }) {
  const data = useBudgetBarData(budgetProgress)

  if (data.length === 0) {
    return (
      <Card className={cardClass}>
        <CardHeader className="pb-2">
          <h3 className="text-sm font-medium text-foreground">Budget vs spent</h3>
          <p className="text-xs text-muted-foreground">Compare limit and spending per budget</p>
        </CardHeader>
        <CardContent className="py-8">
          <p className="text-center text-sm text-muted-foreground">Add budgets to see the chart.</p>
          <p className="mt-1 text-center text-xs text-muted-foreground">Use the form below to add one.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cardClass}>
      <CardHeader className="pb-2">
        <h3 className="text-sm font-medium text-foreground">Budget vs spent</h3>
        <p className="text-xs text-muted-foreground">Compare limit and spending per budget</p>
      </CardHeader>
      <CardContent className="px-0 pb-4 pt-0">
        <div className="h-[280px] w-full sm:h-[320px]" role="img" aria-label="Budget limit and amount spent per budget">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
            >
              <XAxis
                type="number"
                tick={{ fill: AXIS_TICK, fontSize: 11 }}
                tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={72}
                tick={{ fill: AXIS_TICK, fontSize: 11 }}
              />
              <Tooltip content={<BudgetBarTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                formatter={(value) => (value === 'limit' ? 'Budget limit' : 'Spent')}
              />
              <Bar dataKey="limit" fill={BAR_LIMIT} radius={[0, 4, 4, 0]} name="limit" />
              <Bar dataKey="spent" radius={[0, 4, 4, 0]} name="spent">
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      entry.state === 'over'
                        ? BAR_SPENT_OVER
                        : entry.state === 'near'
                          ? BAR_SPENT_NEAR
                          : BAR_SPENT_OK
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

/** Pie chart: How many budgets are on track, near limit, or over. */
export function BudgetStatusChart({ budgetProgress }) {
  const data = useBudgetStatusData(budgetProgress)

  if (data.length === 0) {
    return (
      <Card className={cardClass}>
        <CardHeader className="pb-2">
          <h3 className="text-sm font-medium text-foreground">Budget status</h3>
          <p className="text-xs text-muted-foreground">On track, near limit, or over</p>
        </CardHeader>
        <CardContent className="py-8">
          <p className="text-center text-sm text-muted-foreground">Add budgets to see status.</p>
          <p className="mt-1 text-center text-xs text-muted-foreground">Use the form below to add one.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cardClass}>
      <CardHeader className="pb-2">
        <h3 className="text-sm font-medium text-foreground">Budget status</h3>
        <p className="text-xs text-muted-foreground">On track, near limit, or over</p>
      </CardHeader>
      <CardContent className="px-0 pb-4 pt-0">
        <div className="mx-auto h-[240px] w-full max-w-[320px]" role="img" aria-label="Budget status overview">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={56}
                outerRadius={88}
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<BudgetPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

/** Skeleton for budget charts section. */
export function BudgetChartsSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Card className={cardClass}>
        <CardHeader className="pb-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="mt-1 h-3 w-48" />
        </CardHeader>
        <CardContent className="px-0 pb-4 pt-0">
          <div className="h-[280px] sm:h-[320px]">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
        </CardContent>
      </Card>
      <Card className={cardClass}>
        <CardHeader className="pb-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-1 h-3 w-40" />
        </CardHeader>
        <CardContent className="px-0 pb-4 pt-0">
          <div className="mx-auto h-[240px] w-full max-w-[320px]">
            <Skeleton className="h-full w-full rounded-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
