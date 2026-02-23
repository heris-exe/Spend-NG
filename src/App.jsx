import { useState, useEffect, useRef } from 'react'
import { STORAGE_KEY } from './constants'
import Dashboard from './components/Dashboard'
import seedExpenses from './data/seedExpenses.json'
import ExpenseCharts from './components/ExpenseCharts'
import ExpenseForm from './components/ExpenseForm'
import ExpenseLog from './components/ExpenseLog'
import './App.css'

/**
 * Load expenses from localStorage on mount.
 */
function loadExpenses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function App() {
  const [expenses, setExpenses] = useState([])
  const [editingExpense, setEditingExpense] = useState(null)
  const hasHydrated = useRef(false)

  // Hydrate from localStorage once on mount; if empty, prepopulate from Excel seed data
  useEffect(() => {
    const stored = loadExpenses()
    setExpenses(stored.length > 0 ? stored : seedExpenses)
    hasHydrated.current = true
  }, [])

  // Persist to localStorage when expenses change (after first load, so we don't overwrite)
  useEffect(() => {
    if (!hasHydrated.current) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses))
  }, [expenses])

  const handleAdd = (payload) => {
    if (editingExpense) {
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === editingExpense.id ? { ...e, ...payload } : e
        )
      )
      setEditingExpense(null)
    } else {
      setExpenses((prev) => [...prev, { id: Date.now(), ...payload }])
    }
  }

  const handleEdit = (expense) => {
    setEditingExpense(expense)
  }

  const handleCancelEdit = () => {
    setEditingExpense(null)
  }

  const handleDelete = (id) => {
    if (!window.confirm('Delete this expense?')) return
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Expense Tracker 2026</h1>
        <p className="tagline">Track daily expenses in ₦ — no Excel needed</p>
      </header>

      <Dashboard expenses={expenses} />

      <ExpenseCharts expenses={expenses} />

      <ExpenseForm
        onSubmit={handleAdd}
        editingExpense={editingExpense}
        onCancelEdit={handleCancelEdit}
      />

      <ExpenseLog
        expenses={expenses}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <footer className="footer">
        <p>Data is stored in your browser. Export/import coming soon.</p>
      </footer>
    </div>
  )
}

export default App
