/**
 * Export expenses to JSON, CSV, or XLSX and parse import files (JSON, CSV, or XLSX).
 * Used by the toolbar Export/Import actions.
 */

import * as XLSX from 'xlsx'

const COLUMNS = ['date', 'category', 'description', 'amount', 'paymentMethod', 'notes']

function expenseToRow(e) {
  return {
    date: e.date ?? '',
    category: e.category ?? '',
    description: e.description ?? '',
    amount: e.amount ?? '',
    paymentMethod: e.paymentMethod ?? '',
    notes: e.notes ?? '',
  }
}

function rowToPayload(row) {
  return {
    date: String(row.date ?? '').trim() || new Date().toISOString().slice(0, 10),
    category: String(row.category ?? '').trim() || 'Other',
    description: String(row.description ?? '').trim(),
    amount: row.amount != null ? String(row.amount) : '',
    paymentMethod: String(row.paymentMethod ?? '').trim() || 'Cash',
    notes: String(row.notes ?? '').trim(),
  }
}

/** Escape a CSV field (wrap in quotes if needed, escape " as "") */
function csvEscape(value) {
  const s = String(value ?? '')
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

/**
 * Export expenses to a file. format: 'json' | 'csv' | 'xlsx'
 * Triggers a download in the browser.
 */
export function exportExpenses(expenses, format) {
  if (!Array.isArray(expenses) || expenses.length === 0) return
  const dateStr = new Date().toISOString().slice(0, 10)

  if (format === 'json') {
    const blob = new Blob([JSON.stringify(expenses, null, 2)], {
      type: 'application/json',
    })
    downloadBlob(blob, `expenses-${dateStr}.json`)
    return
  }

  const rows = expenses.map(expenseToRow)

  if (format === 'csv') {
    const header = COLUMNS.join(',')
    const lines = rows.map((r) => COLUMNS.map((c) => csvEscape(r[c])).join(','))
    const csv = [header, ...lines].join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    downloadBlob(blob, `expenses-${dateStr}.csv`)
    return
  }

  if (format === 'xlsx') {
    const ws = XLSX.utils.json_to_sheet(rows, { header: COLUMNS })
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Expenses')
    XLSX.writeFile(wb, `expenses-${dateStr}.xlsx`)
    return
  }
}

/**
 * Parse an imported file (JSON, CSV, or XLSX) and return an array of expense payloads
 * suitable for importExpenses(). Returns Promise<Array<{ date, category, description, amount, paymentMethod, notes }>>.
 */
export function parseImportFile(file) {
  const name = (file.name || '').toLowerCase()
  const ext = name.endsWith('.json')
    ? 'json'
    : name.endsWith('.csv')
      ? 'csv'
      : name.endsWith('.xlsx') || name.endsWith('.xls')
        ? 'xlsx'
        : null

  if (ext === 'json') {
    return file.text().then((text) => {
      const parsed = JSON.parse(text)
      if (!Array.isArray(parsed)) throw new Error('JSON file must contain an array of expenses.')
      return parsed.map(rowToPayload)
    })
  }

  if (ext === 'csv') {
    return file.text().then((text) => {
      const lines = text.split(/\r?\n/).filter((line) => line.trim())
      if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row.')
      const header = parseCsvLine(lines[0])
      const norm = (s) => String(s).toLowerCase().replace(/\s+/g, '')
      const colIndex = (key) => {
        const k = norm(key)
        return header.findIndex((h) => norm(h) === k)
      }
      const idx = {
        date: colIndex('date'),
        category: colIndex('category'),
        description: colIndex('description'),
        amount: colIndex('amount'),
        paymentMethod: colIndex('payment method') >= 0 ? colIndex('payment method') : colIndex('paymentMethod'),
        notes: colIndex('notes'),
      }
      const rows = []
      for (let i = 1; i < lines.length; i++) {
        const cells = parseCsvLine(lines[i])
        const get = (key) => (idx[key] >= 0 && idx[key] < cells.length ? cells[idx[key]] : '')
        rows.push(
          rowToPayload({
            date: get('date'),
            category: get('category'),
            description: get('description'),
            amount: get('amount'),
            paymentMethod: get('paymentMethod'),
            notes: get('notes'),
          })
        )
      }
      return rows
    })
  }

  if (ext === 'xlsx') {
    return file.arrayBuffer().then((buf) => {
      const wb = XLSX.read(buf, { type: 'array' })
      const first = wb.SheetNames[0]
      if (!first) throw new Error('Excel file has no sheets.')
      const data = XLSX.utils.sheet_to_json(wb.Sheets[first], { defval: '' })
      if (!Array.isArray(data) || data.length === 0) throw new Error('Excel sheet is empty.')
      return data.map((row) => rowToPayload(row))
    })
  }

  return Promise.reject(new Error('Unsupported file type. Use .json, .csv, or .xlsx'))
}

function parseCsvLine(line) {
  const out = []
  let i = 0
  while (i < line.length) {
    if (line[i] === '"') {
      let s = ''
      i++
      while (i < line.length) {
        if (line[i] === '"') {
          i++
          if (line[i] === '"') {
            s += '"'
            i++
          } else break
        } else {
          s += line[i++]
        }
      }
      out.push(s)
    } else {
      let s = ''
      while (i < line.length && line[i] !== ',') s += line[i++]
      out.push(s.trim())
      if (line[i] === ',') i++
    }
  }
  return out
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
