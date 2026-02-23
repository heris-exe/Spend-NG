import { useState, useMemo } from 'react'
import { getDayOfWeek, formatAmount } from '../utils/helpers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CATEGORIES } from '@/constants'

export default function ExpenseLog({ expenses, onEdit, onDelete }) {
  const [filterDate, setFilterDate] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  const filteredList = useMemo(() => {
    let list = expenses
    if (filterDate) list = list.filter((e) => e.date === filterDate)
    if (filterCategory) list = list.filter((e) => (e.category || 'Other') === filterCategory)
    return [...list].sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date)
      return String(b.id ?? '').localeCompare(String(a.id ?? ''))
    })
  }, [expenses, filterDate, filterCategory])

  const dailyTotalsByDate = useMemo(() => {
    const map = {}
    filteredList.forEach((e) => {
      const d = e.date
      const amt = Number(e.amount) || 0
      map[d] = (map[d] || 0) + amt
    })
    return map
  }, [filteredList])

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-sm font-medium text-foreground tracking-tight">Daily expense log</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">View and filter by date or category</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="filterDate" className="text-xs text-muted-foreground">
            Date
          </label>
          <Input
            type="date"
            id="filterDate"
            className="h-10 w-full min-w-0 sm:h-9 sm:w-auto sm:min-w-[140px]"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          <label htmlFor="filterCategory" className="text-xs text-muted-foreground">
            Category
          </label>
          <Select value={filterCategory || 'all'} onValueChange={(v) => setFilterCategory(v === 'all' ? '' : v)}>
            <SelectTrigger id="filterCategory" className="h-10 w-full min-w-0 sm:h-9 sm:w-auto sm:min-w-[140px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="min-h-[44px] sm:min-h-0"
            onClick={() => { setFilterDate(''); setFilterCategory('') }}
          >
            Show all
          </Button>
        </div>
      </div>
      <Card className="overflow-hidden border-border bg-card shadow-sm transition-shadow hover:shadow-md rounded-xl">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="expense-log-table min-w-[720px] sm:min-w-0">
            <TableHeader>
              <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
                <TableHead className="h-11 text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</TableHead>
                <TableHead className="h-11 text-xs font-medium uppercase tracking-wider text-muted-foreground">Day</TableHead>
                <TableHead className="h-11 text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</TableHead>
                <TableHead className="h-11 text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</TableHead>
                <TableHead className="h-11 text-xs font-medium uppercase tracking-wider text-muted-foreground">Amount (₦)</TableHead>
                <TableHead className="h-11 whitespace-nowrap text-xs font-medium uppercase tracking-wider text-muted-foreground">Daily total</TableHead>
                <TableHead className="h-11 text-xs font-medium uppercase tracking-wider text-muted-foreground">Payment</TableHead>
                <TableHead className="h-11 text-xs font-medium uppercase tracking-wider text-muted-foreground">Notes</TableHead>
                <TableHead className="h-11 w-[120px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredList.map((exp, index) => {
                const isFirstRowForDate =
                  index === 0 || filteredList[index - 1].date !== exp.date
                return (
                <TableRow key={exp.id}>
                  <TableCell className="py-3 text-sm text-foreground">{exp.date}</TableCell>
                  <TableCell className="py-3 text-sm text-foreground">{getDayOfWeek(exp.date)}</TableCell>
                  <TableCell className="py-3 text-sm text-foreground">{exp.category}</TableCell>
                  <TableCell className="max-w-[200px] truncate py-3 text-sm text-foreground sm:max-w-none">{exp.description}</TableCell>
                  <TableCell className="amount-cell py-3 text-sm font-semibold tabular-nums tracking-tight whitespace-nowrap">
                    {formatAmount(exp.amount)}
                  </TableCell>
                  <TableCell className="text-muted-cell py-3 text-sm tabular-nums font-medium whitespace-nowrap">
                    {isFirstRowForDate ? formatAmount(dailyTotalsByDate[exp.date] ?? 0) : ''}
                  </TableCell>
                  <TableCell className="py-3 text-sm">{exp.paymentMethod || '-'}</TableCell>
                  <TableCell className="text-muted-cell max-w-[160px] truncate py-3 text-sm sm:max-w-none">{exp.notes || '-'}</TableCell>
                  <TableCell className="py-2 sm:py-3 text-sm">
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="min-h-[36px] min-w-[44px] text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onEdit(exp)}
                        aria-label="Edit"
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="min-h-[36px] min-w-[44px] text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onDelete(exp)}
                        aria-label="Delete"
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {filteredList.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 py-12 text-center text-sm text-muted-foreground">
          {filterDate || filterCategory ? 'No expenses match the selected filters.' : 'No expenses yet. Add one above.'}
        </div>
      )}
    </section>
  )
}
