import { Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { formatAmount } from '@/utils/helpers'

/**
 * Custom delete confirmation modal. Shows the expense details so the user
 * knows exactly what they're removing. Replaces the native window.confirm.
 */
export function DeleteConfirmDialog({ expense, open, onOpenChange, onConfirm, isDeleting }) {
  if (!expense) return null

  const handleConfirm = async () => {
    await onConfirm()
    // Parent clears deleteTarget on success, which closes this dialog
  }

  const handleCancel = () => {
    if (!isDeleting) onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="rounded-xl border-border shadow-lg sm:max-w-[400px]"
        showCloseButton={!isDeleting}
        onPointerDownOutside={isDeleting ? (e) => e.preventDefault() : undefined}
        onEscapeKeyDown={isDeleting ? (e) => e.preventDefault() : undefined}
      >
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-4">
          <div className="flex shrink-0 items-center justify-center size-12 rounded-full bg-destructive/10 text-destructive">
            <Trash2 className="size-6" aria-hidden />
          </div>
          <div className="flex-1 space-y-1">
            <DialogHeader>
              <DialogTitle className="text-lg">Delete this expense?</DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                This can't be undone. The following will be removed:
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-left">
              <p className="font-medium text-foreground truncate">{expense.description}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {expense.date}
                {expense.category ? ` · ${expense.category}` : ''}
                {' · '}
                <span className="font-semibold tabular-nums text-foreground">
                  {formatAmount(expense.amount)}
                </span>
              </p>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
