import { useState } from 'react'
import Dashboard from './components/Dashboard'
import ExpenseCharts from './components/ExpenseCharts'
import ExpenseForm from './components/ExpenseForm'
import ExpenseLog from './components/ExpenseLog'
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog'
import { AppHeader, AppFooter } from './components/layout'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useExpenses } from './hooks/useExpenses'
import { useAuth } from './contexts/AuthContext'
import { AuthScreen } from './components/AuthScreen'
import { SetupRequired } from './components/SetupRequired'

function App() {
  const { user, loading, isConfigured, signIn, signUp } = useAuth()
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState(null)
  const [authMessage, setAuthMessage] = useState(null)

  const handleSignIn = async (email, password) => {
    setAuthError(null)
    setAuthMessage(null)
    setAuthLoading(true)
    const { error } = await signIn(email, password)
    setAuthLoading(false)
    if (error) setAuthError(error)
  }

  const handleSignUp = async (email, password) => {
    setAuthError(null)
    setAuthMessage(null)
    setAuthLoading(true)
    const { data, error } = await signUp(email, password)
    setAuthLoading(false)
    if (error) {
      setAuthError(error)
      return
    }
    // Supabase often requires email confirmation: no session until they click the link.
    if (data?.user && !data?.session) {
      setAuthMessage('Account created. Check your email and click the confirmation link, then sign in below.')
    }
  }

  if (!isConfigured) return <SetupRequired />
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </div>
    )
  }
  if (!user) {
    return (
      <AuthScreen
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        isLoading={authLoading}
        error={authError}
        message={authMessage}
      />
    )
  }

  return <AppContent />
}

function AppContent() {
  const {
    expenses,
    editingExpense,
    isModalOpen,
    deleteTarget,
    isDeleting,
    openForm,
    closeModal,
    handleAdd,
    handleEdit,
    openDeleteConfirm,
    closeDeleteConfirm,
    confirmDelete,
    isLoading,
    loadError,
  } = useExpenses()

  return (
    <div className="min-h-screen w-full px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
      <AppHeader />

      <main className="py-4 sm:py-8">
        {loadError && (
          <p className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive" role="alert">
            {loadError.message}
          </p>
        )}
        {isLoading && (
          <p className="mb-4 text-sm text-muted-foreground">Loading expenses…</p>
        )}
        <div className="flex flex-col gap-6 sm:gap-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <Dashboard expenses={expenses} />
            <Button
              onClick={openForm}
              className="min-h-[44px] shrink-0 gap-2 sm:self-end"
            >
              <Plus className="h-4 w-4" />
              Add expense
            </Button>
          </div>
          <ExpenseCharts expenses={expenses} />
          <ExpenseLog
            expenses={expenses}
            onEdit={handleEdit}
            onDelete={openDeleteConfirm}
          />
        </div>
      </main>

      <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="rounded-xl border-border shadow-md sm:max-w-[480px] max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? 'Edit expense' : 'Add expense'}
            </DialogTitle>
            <DialogDescription>
              {editingExpense
                ? 'Update the transaction details below.'
                : 'Record a new transaction in ₦.'}
            </DialogDescription>
          </DialogHeader>
          <ExpenseForm
            onSubmit={handleAdd}
            editingExpense={editingExpense}
            onCancel={closeModal}
            onSuccess={closeModal}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        expense={deleteTarget}
        open={!!deleteTarget}
        onOpenChange={(open) => !open && closeDeleteConfirm()}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />

      <AppFooter />
    </div>
  )
}

export default App
