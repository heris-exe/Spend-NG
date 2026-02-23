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

export function useExpenses() {
  const [expenses, setExpenses] = useState([])
  const [editingExpense, setEditingExpense] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const loadExpenses = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    const { data, error } = await fetchExpenses()
    setIsLoading(false)
    if (error) {
      setLoadError(error)
      setExpenses([])
      return
    }
    setExpenses(data || [])
  }, [])

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
        return
      }
      setExpenses((prev) =>
        prev.map((e) => (e.id === editingExpense.id ? { ...e, ...data } : e))
      )
    } else {
      const { data, error } = await createExpense(payload)
      if (error) {
        console.error('Create failed', error)
        return
      }
      setExpenses((prev) => [data, ...prev])
    }
    closeModal()
  }

  const handleEdit = (expense) => {
    setEditingExpense(expense)
  }

  const openDeleteConfirm = (expense) => setDeleteTarget(expense)
  const closeDeleteConfirm = () => setDeleteTarget(null)

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    const { error } = await deleteExpense(deleteTarget.id)
    setIsDeleting(false)
    if (error) {
      console.error('Delete failed', error)
      return
    }
    setExpenses((prev) => prev.filter((e) => e.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return {
    expenses,
    editingExpense,
    formOpen,
    deleteTarget,
    isDeleting,
    isModalOpen: formOpen || editingExpense !== null,
    isLoading,
    loadError,
    loadExpenses,
    openForm: () => setFormOpen(true),
    closeModal,
    handleAdd,
    handleEdit,
    openDeleteConfirm,
    closeDeleteConfirm,
    confirmDelete,
  }
}
