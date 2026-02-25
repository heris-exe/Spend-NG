/**
 * Provides budget state and actions. Must be used inside ExpenseProvider because
 * budget progress is computed from expenses (spent vs limit).
 */

import { createContext, useContext } from 'react'
import { useBudgets } from '@/hooks/useBudgets'
import { useExpenseContext } from '@/contexts/ExpenseContext'

const BudgetContext = createContext(null)

export function BudgetProvider({ children }) {
  const { expenses } = useExpenseContext()
  const value = useBudgets(expenses)
  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  )
}

export function useBudgetContext() {
  const ctx = useContext(BudgetContext)
  if (!ctx) throw new Error('useBudgetContext must be used within BudgetProvider')
  return ctx
}
