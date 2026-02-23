import { useState, useEffect } from 'react'
import { todayStr } from '../utils/helpers'
import { CATEGORIES, PAYMENT_METHODS } from '../constants'

export default function ExpenseForm({ onSubmit, editingExpense, onCancelEdit }) {
  const [date, setDate] = useState(todayStr())
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (editingExpense) {
      setDate(editingExpense.date)
      setCategory(editingExpense.category)
      setDescription(editingExpense.description)
      setAmount(editingExpense.amount ?? '')
      setPaymentMethod(editingExpense.paymentMethod || 'Cash')
      setNotes(editingExpense.notes || '')
    } else {
      setDate(todayStr())
      setCategory('')
      setDescription('')
      setAmount('')
      setPaymentMethod('Cash')
      setNotes('')
    }
  }, [editingExpense])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      date,
      category,
      description: description.trim(),
      amount,
      paymentMethod,
      notes: notes.trim(),
    })
    if (!editingExpense) {
      setDate(todayStr())
      setCategory('')
      setDescription('')
      setAmount('')
      setNotes('')
    }
  }

  return (
    <section className="add-expense">
      <h2>Add expense</h2>
      <form className="expense-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="form-row">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Choose...</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label htmlFor="description">Description</label>
          <input
            type="text"
            id="description"
            placeholder="What was it for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="form-row">
          <label htmlFor="amount">Amount (₦)</label>
          <input
            type="number"
            id="amount"
            min="0"
            step="0.01"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="form-row">
          <label htmlFor="paymentMethod">Payment method</label>
          <select
            id="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="form-row full">
          <label htmlFor="notes">Notes (optional)</label>
          <input
            type="text"
            id="notes"
            placeholder="Any extra notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {editingExpense ? 'Save changes' : 'Add expense'}
          </button>
          {editingExpense && (
            <button type="button" className="btn btn-secondary" onClick={onCancelEdit}>
              Cancel edit
            </button>
          )}
        </div>
      </form>
    </section>
  )
}
