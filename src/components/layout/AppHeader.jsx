import { LogOut } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

export default function AppHeader() {
  const { user, signOut, isConfigured } = useAuth()

  return (
    <header className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card px-4 py-4 shadow-sm sm:px-5 sm:py-5">
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Expense Tracker 2026
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Track daily expenses in ₦ — no Excel needed
        </p>
      </div>
      <div className="flex items-center gap-2">
        {isConfigured && user && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => signOut()}
            title="Sign out"
            className="shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
        <ThemeToggle />
      </div>
    </header>
  )
}
