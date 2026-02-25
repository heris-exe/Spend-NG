/**
 * Expenses: full log, export/import, and category charts.
 * Single place to log, review, and analyze spending.
 */

import { useRef, useState } from 'react'
import ExpenseLog, { ExpenseLogSkeleton } from '@/components/ExpenseLog'
import ExpenseCharts, { ExpenseChartsSkeleton } from '@/components/ExpenseCharts'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, Upload, ChevronDown, RefreshCw, Plus } from 'lucide-react'
import { useExpenseContext } from '@/contexts/ExpenseContext'
import { exportExpenses, parseImportFile } from '@/utils/exportImport'

export default function ExpensesPage() {
  const fileInputRef = useRef(null)
  const [importError, setImportError] = useState(null)
  const {
    expenses,
    isLoading,
    loadExpenses,
    importProgress,
    importExpenses,
    handleEdit,
    openDeleteConfirm,
    openForm,
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

  return (
    <div className="flex flex-col gap-6 sm:gap-10">
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

      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Spending by category
        </h2>
        {isLoading ? (
          <ExpenseChartsSkeleton />
        ) : (
          <ExpenseCharts expenses={expenses} />
        )}
      </section>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.csv,.xlsx,application/json,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
