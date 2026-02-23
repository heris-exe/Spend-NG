import { useState, useMemo } from 'react'
import { getDayOfWeek, formatAmount } from '../utils/helpers'

/**
 * Table of expenses with optional date filter. Edit/Delete per row.
 */
export default function ExpenseLog({ expenses, onEdit, onDelete }) {
  const [filterDate, setFilterDate] = useState('')

  const filteredList = useMemo(() => {
    let list = expenses
    if (filterDate) {
      list = expenses.filter((e) => e.date === filterDate)
    }
    return [...list].sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date)
      return (b.id ?? 0) - (a.id ?? 0)
    })
  }, [expenses, filterDate])

  return (
    <section className="expense-log">
      <h2>Daily expense log</h2>
      <div className="log-controls">
        <label htmlFor="filterDate">Show date:</label>
        <input
          type="date"
          id="filterDate"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-small"
          onClick={() => setFilterDate('')}
        >
          Show all
        </button>
      </div>
      <div className="table-wrap">
        <table className="expense-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Day</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount (₦)</th>
              <th>Payment</th>
              <th>Notes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((exp) => (
              <tr key={exp.id}>
                <td>{exp.date}</td>
                <td>{getDayOfWeek(exp.date)}</td>
                <td>{exp.category}</td>
                <td>{exp.description}</td>
                <td className="amount">{formatAmount(exp.amount)}</td>
                <td>{exp.paymentMethod || '-'}</td>
                <td>{exp.notes || '-'}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => onEdit(exp)}
                    aria-label="Edit"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => onDelete(exp.id)}
                    aria-label="Delete"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={`empty-message ${filteredList.length > 0 ? 'hidden' : ''}`}>
        No expenses yet. Add one above.
      </p>
    </section>
  )
}
