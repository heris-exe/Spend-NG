/**
 * Encapsulates expense list state, cloud API sync, and CRUD actions.
 * Data is loaded from and saved to Supabase so it syncs across devices for the signed-in user.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../services/expenseApi'
import { useAuth } from '@/contexts/AuthContext'

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

  const loadExpenses = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    const { data, error } = await fetchExpenses()
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
    openForm: () => setFormOpen(true),
    closeModal,
    handleAdd,
    handleEdit,
    openDeleteConfirm,
    closeDeleteConfirm,
    confirmDelete,
    importExpenses,
  }
}
