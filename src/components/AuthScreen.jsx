/**
 * Login / Sign up screen when Supabase is configured but user isn't signed in.
 * Uses the same card and form styles as the rest of the app.
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function AuthScreen({ onSignIn, onSignUp, isLoading, error, message }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSignUp) {
      await onSignUp(email, password)
    } else {
      await onSignIn(email, password)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Expense Tracker</CardTitle>
          <CardDescription>
            {isSignUp
              ? 'Create an account to sync expenses across devices.'
              : 'Sign in to access your expenses on this device.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
              <p className="text-sm text-foreground rounded-md bg-muted px-3 py-2" role="status">
                {message}
              </p>
            )}
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error.message}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="auth-email">Email</Label>
              <Input
                id="auth-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auth-password">Password</Label>
              <Input
                id="auth-password"
                type="password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Please wait…' : isSignUp ? 'Sign up' : 'Sign in'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setIsSignUp((v) => !v)
                  setPassword('')
                }}
              >
                {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
