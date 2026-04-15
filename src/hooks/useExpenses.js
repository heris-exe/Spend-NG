/**
 * Encapsulates expense list state, cloud API sync, and CRUD actions.
 * Data is loaded from and saved to Supabase so it syncs across devices for the signed-in user.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../services/expenseApi'
import { fetchWeeklyBudget, upsertWeeklyBudget } from '../services/budgetApi'
import { useAuth } from '@/contexts/AuthContext'
import { getCurrentWeekRangeYmd } from '@/utils/helpers'

function isAuthError(error) {
  const msg = error?.message?.toLowerCase() ?? ''
  return msg.includes('not signed') || msg.includes('session') || msg.includes('auth') || msg.includes('jwt') || msg.includes('refresh')
}

export function useExpenses() {
  const { signOut, setSessionMessage } = useAuth()
  const [expenses, setExpenses] = useState([])
  const [editingExpense, setEditingExpense] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [importProgress, setImportProgress] = useState(null)
  const [weeklyBudgetAmount, setWeeklyBudgetAmountState] = useState(null)
  const [isBudgetSaving, setIsBudgetSaving] = useState(false)
  const [budgetError, setBudgetError] = useState(null)

  const loadExpenses = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    setBudgetError(null)
    const [{ data, error }, { data: budgetData, error: budgetLoadError }] = await Promise.all([
      fetchExpenses(),
      fetchWeeklyBudget(),
    ])
    setIsLoading(false)
    if (error) {
      if (isAuthError(error)) {
        setSessionMessage?.('Session expired. Please sign in again.')
        signOut?.()
        return
      }
      setLoadError(error)
      setExpenses([])
      return
    }
    setExpenses(data || [])
    if (budgetLoadError) {
      setBudgetError(budgetLoadError?.message ?? 'Could not load weekly budget.')
      setWeeklyBudgetAmountState(null)
    } else {
      setWeeklyBudgetAmountState(budgetData?.amount ?? null)
    }
  }, [signOut, setSessionMessage])

  useEffect(() => {
    loadExpenses()
  }, [loadExpenses])

  const closeModal = () => {
    setFormOpen(false)
    setEditingExpense(null)
  }

  const handleAdd = async (payload) => {
    if (editingExpense) {
      const { data, error } = await updateExpense(editingExpense.id, payload)
      if (error) {
        console.error('Update failed', error)
        throw error
      }
      setExpenses((prev) =>
        prev.map((e) => (e.id === editingExpense.id ? { ...e, ...data } : e))
      )
    } else {
      const { data, error } = await createExpense(payload)
      if (error) {
        console.error('Create failed', error)
        throw error
      }
      setExpenses((prev) => [data, ...prev])
    }
    closeModal()
  }

  const handleEdit = (expense) => {
    setEditingExpense(expense)
  }

  const openDeleteConfirm = (expense) => {
    setDeleteTarget(expense)
    setDeleteError(null)
  }
  const closeDeleteConfirm = () => {
    setDeleteTarget(null)
    setDeleteError(null)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleteError(null)
    setIsDeleting(true)
    const { error } = await deleteExpense(deleteTarget.id)
    setIsDeleting(false)
    if (error) {
      console.error('Delete failed', error)
      setDeleteError(error?.message ?? 'Could not delete. Try again.')
      return
    }
    setExpenses((prev) => prev.filter((e) => e.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const importExpenses = async (items) => {
    if (!Array.isArray(items) || items.length === 0) return
    const total = items.length
    let imported = 0
    let failed = 0
    const inserted = []
    setImportProgress({ current: 0, total, imported: 0, failed: 0 })
    for (let i = 0; i < items.length; i++) {
      const { data, error } = await createExpense(items[i])
      if (error) failed++
      else if (data) {
        imported++
        inserted.push(data)
      }
      setImportProgress({ current: i + 1, total, imported, failed })
    }
    if (inserted.length > 0) {
      setExpenses((prev) => [...inserted, ...prev])
    }
    setImportProgress({ done: true, imported, failed, total })
    setTimeout(() => setImportProgress(null), 5000)
  }

  const setWeeklyBudgetAmount = async (amount) => {
    setIsBudgetSaving(true)
    setBudgetError(null)
    const numeric = Number(amount)
    if (!Number.isFinite(numeric) || numeric < 0) {
      setIsBudgetSaving(false)
      throw new Error('Weekly budget must be zero or greater.')
    }
    const { data, error } = await upsertWeeklyBudget(numeric)
    setIsBudgetSaving(false)
    if (error) {
      setBudgetError(error?.message ?? 'Could not save weekly budget.')
      throw error
    }
    setWeeklyBudgetAmountState(data?.amount ?? 0)
  }

  const weeklySpent = useMemo(() => {
    const { weekStartStr, weekEndStr } = getCurrentWeekRangeYmd()
    return expenses.reduce((sum, expense) => {
      if (expense.date >= weekStartStr && expense.date <= weekEndStr) {
        return sum + (Number(expense.amount) || 0)
      }
      return sum
    }, 0)
  }, [expenses])
  const weeklyRemaining = weeklyBudgetAmount != null ? weeklyBudgetAmount - weeklySpent : null
  const weeklyProgress =
    weeklyBudgetAmount != null && weeklyBudgetAmount > 0
      ? Math.min((weeklySpent / weeklyBudgetAmount) * 100, 100)
      : 0

  return {
    expenses,
    editingExpense,
    formOpen,
    deleteTarget,
    isDeleting,
    deleteError,
    isModalOpen: formOpen || editingExpense !== null,
    isLoading,
    loadError,
    loadExpenses,
    importProgress,
    weeklyBudgetAmount,
    weeklySpent,
    weeklyRemaining,
    weeklyProgress,
    isBudgetSaving,
    budgetError,
    openForm: () => setFormOpen(true),
    closeModal,
    handleAdd,
    handleEdit,
    openDeleteConfirm,
    closeDeleteConfirm,
    confirmDelete,
    importExpenses,
    setWeeklyBudgetAmount,
  }
}
