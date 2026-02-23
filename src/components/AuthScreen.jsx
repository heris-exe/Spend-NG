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

export function AuthScreen({ onSignIn, onSignUp, onForgotPassword, isLoading, error, message, sessionMessage }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotMessage, setForgotMessage] = useState(null)

  const displayMessage = sessionMessage ?? message

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSignUp) {
      await onSignUp(email, password)
    } else {
      await onSignIn(email, password)
    }
  }

  const handleForgotSubmit = async (e) => {
    e.preventDefault()
    if (!email?.trim()) return
    setForgotMessage(null)
    setForgotLoading(true)
    const { error: err } = await onForgotPassword(email.trim())
    setForgotLoading(false)
    if (err) {
      setForgotMessage(err.message)
      return
    }
    setForgotMessage('Check your email for a link to reset your password.')
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Spend NG</CardTitle>
          <CardDescription>
            {showForgotPassword
              ? 'Enter your email to receive a password reset link.'
              : isSignUp
                ? 'Create an account to sync expenses across devices.'
                : 'Sign in to access your expenses on this device.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showForgotPassword ? (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              {forgotMessage && (
                <p className={`text-sm rounded-md px-3 py-2 ${forgotMessage.includes('Check your email') ? 'text-foreground bg-muted' : 'text-destructive'}`} role="status">
                  {forgotMessage}
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="auth-forgot-email">Email</Label>
                <Input
                  id="auth-forgot-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Button type="submit" className="w-full" disabled={forgotLoading}>
                  {forgotLoading ? 'Sending…' : 'Send reset link'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setShowForgotPassword(false)
                    setForgotMessage(null)
                  }}
                >
                  Back to sign in
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {displayMessage && (
                <p className="text-sm text-foreground rounded-md bg-muted px-3 py-2" role="status">
                  {displayMessage}
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
              {!isSignUp && onForgotPassword && (
                <div className="text-right">
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-foreground underline focus:outline-none focus:underline"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot password?
                  </button>
                </div>
              )}
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
