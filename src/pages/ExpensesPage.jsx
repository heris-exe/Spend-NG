/**
 * Expenses: full log, export/import, and category charts.
 * Single place to log, review, and analyze spending.
 */

import { useRef, useState } from 'react'
import ExpenseLog, { ExpenseLogSkeleton } from '@/components/ExpenseLog'
import ExpenseCharts, { ExpenseChartsSkeleton } from '@/components/ExpenseCharts'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, Upload, ChevronDown, RefreshCw, Plus, PiggyBank } from 'lucide-react'
import { useExpenseContext } from '@/contexts/ExpenseContext'
import { exportExpenses, parseImportFile } from '@/utils/exportImport'
import { formatAmount } from '@/utils/helpers'

export default function ExpensesPage() {
  const fileInputRef = useRef(null)
  const [importError, setImportError] = useState(null)
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false)
  const [budgetInput, setBudgetInput] = useState('')
  const [budgetDialogError, setBudgetDialogError] = useState(null)
  const {
    expenses,
    isLoading,
    loadExpenses,
    importProgress,
    importExpenses,
    handleEdit,
    openDeleteConfirm,
    openForm,
    weeklyBudgetAmount,
    weeklySpent,
    weeklyRemaining,
    setWeeklyBudgetAmount,
    isBudgetSaving,
  } = useExpenseContext()
  const isImporting = importProgress && !importProgress.done

  const handleExport = (format) => {
    exportExpenses(expenses, format)
  }

  const handleImportClick = () => {
    setImportError(null)
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      setImportError(null)
      const items = await parseImportFile(file)
      if (!items?.length) throw new Error('No valid expenses found in file.')
      await importExpenses(items)
    } catch (err) {
      console.error('Import failed', err)
      setImportError(
        err instanceof Error ? err.message : 'Failed to import file.'
      )
    }
  }

  const openBudgetDialog = () => {
    setBudgetDialogError(null)
    setBudgetInput(
      weeklyBudgetAmount != null ? String(weeklyBudgetAmount) : ''
    )
    setBudgetDialogOpen(true)
  }

  const handleSaveBudget = async () => {
    const value = Number(budgetInput)
    if (!Number.isFinite(value) || value < 0) {
      setBudgetDialogError('Enter a valid amount greater than or equal to 0.')
      return
    }
    try {
      await setWeeklyBudgetAmount(value)
      setBudgetDialogOpen(false)
    } catch (error) {
      setBudgetDialogError(
        error instanceof Error ? error.message : 'Could not save weekly budget.'
      )
    }
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-10">
      <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium text-foreground">Weekly budget</h3>
            {weeklyBudgetAmount != null ? (
              <p className="text-xs text-muted-foreground">
                Budget {formatAmount(weeklyBudgetAmount)} · Spent {formatAmount(weeklySpent)} ·{' '}
                {weeklyRemaining < 0 ? 'Over' : 'Remaining'} {formatAmount(Math.abs(weeklyRemaining || 0))}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                No weekly budget set yet.
              </p>
            )}
          </div>
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={openBudgetDialog}>
            <PiggyBank className="h-4 w-4" />
            {weeklyBudgetAmount != null ? 'Edit weekly budget' : 'Set weekly budget'}
          </Button>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">Expense log</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={openForm}
            className="min-h-[44px] touch-manipulation gap-2 sm:min-h-0"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Add expense
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-[44px] touch-manipulation gap-1 text-xs sm:min-h-0 sm:text-sm"
            onClick={() => loadExpenses()}
            disabled={isLoading}
            title="Refresh list"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-[44px] touch-manipulation gap-1 text-xs sm:min-h-0 sm:text-sm"
                disabled={!expenses || expenses.length === 0}
              >
                <Download className="h-4 w-4" />
                Export
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('json')}>
                JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('xlsx')}>
                Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-[44px] touch-manipulation gap-1 text-xs sm:min-h-0 sm:text-sm"
            onClick={handleImportClick}
            disabled={isImporting}
          >
            <Upload className="h-4 w-4" />
            {isImporting ? 'Importing…' : 'Import'}
          </Button>
        </div>
      </div>

      {importError && (
        <p
          className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive"
          role="alert"
        >
          {importError}
        </p>
      )}

      {isLoading ? (
        <ExpenseLogSkeleton />
      ) : (
        <ExpenseLog
          expenses={expenses}
          onEdit={handleEdit}
          onDelete={openDeleteConfirm}
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.csv,.xlsx,application/json,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        onChange={handleFileChange}
      />

      <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>{weeklyBudgetAmount != null ? 'Edit weekly budget' : 'Set weekly budget'}</DialogTitle>
            <DialogDescription>
              Set one budget amount for the current week (Sunday-Saturday).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label className="space-y-1 text-xs font-medium text-muted-foreground">
              <span>Amount (₦)</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                placeholder="0.00"
              />
            </label>
            {budgetDialogError && (
              <p className="text-xs text-destructive" role="alert">
                {budgetDialogError}
              </p>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              <Button type="button" onClick={handleSaveBudget} disabled={isBudgetSaving}>
                {isBudgetSaving ? 'Saving…' : 'Save budget'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setBudgetDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
