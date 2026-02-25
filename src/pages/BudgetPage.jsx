/**
 * Budget: set and track category/overall budgets.
 * Dedicated page so budget management isn’t buried in the main feed.
 */

import BudgetManager from '@/components/BudgetManager'
import {
  BudgetVsSpentChart,
  BudgetStatusChart,
  BudgetChartsSkeleton,
} from '@/components/BudgetCharts'
import { useBudgetContext } from '@/contexts/BudgetContext'

export default function BudgetPage() {
  const {
    budgetProgress,
    addBudget,
    updateBudget,
    removeBudget,
    isLoading: budgetsLoading,
  } = useBudgetContext()

  return (
    <div className="flex flex-col gap-6 sm:gap-10">
      <h2 className="text-lg font-semibold text-foreground">Budgets</h2>

      <section aria-label="Budget overview charts">
        {budgetsLoading ? (
          <BudgetChartsSkeleton />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            <BudgetVsSpentChart budgetProgress={budgetProgress} />
            <BudgetStatusChart budgetProgress={budgetProgress} />
          </div>
        )}
      </section>

      <BudgetManager
        budgetProgress={budgetProgress}
        onAddBudget={addBudget}
        onUpdateBudget={updateBudget}
        onRemoveBudget={removeBudget}
        isLoading={budgetsLoading}
      />
    </div>
  )
}
