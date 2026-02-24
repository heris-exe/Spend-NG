/**
 * Auth context: provides current user and sign-in/up/out to the app.
 * When Supabase isn't configured, user is null and we treat as "no auth" (demo mode).
 */

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sessionMessage, setSessionMessage] = useState(null)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    if (!supabase) return { error: new Error('Supabase not configured') }
    return supabase.auth.signInWithPassword({ email, password })
  }

  const signUp = async (email, password) => {
    if (!supabase) return { error: new Error('Supabase not configured') }
    return supabase.auth.signUp({ email, password })
  }

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  const resetPasswordForEmail = async (email) => {
    if (!supabase) return { error: new Error('Supabase not configured') }
    return supabase.auth.resetPasswordForEmail({ email })
  }

  /**
   * Sign in with Google (OAuth). Redirects the user to Google, then back to this app.
   * - Dev: set VITE_APP_URL=http://localhost:5173 (or leave unset to use current origin).
   * - Prod: set VITE_APP_URL=https://your-domain.com (e.g. https://spendng.vercel.app).
   * Supabase Dashboard → Authentication → URL Configuration: set Site URL to the same
   * production URL (not localhost:3000); add it to Redirect URLs so OAuth returns there.
   */
  const signInWithGoogle = async () => {
    if (!supabase) return { error: new Error('Supabase not configured') }
    let redirectUrl =
      typeof window !== 'undefined'
        ? (import.meta.env.VITE_APP_URL || window.location.origin)
        : undefined
    // If we're on a real host but VITE_APP_URL is localhost (e.g. wrong env), prefer current origin
    if (
      typeof window !== 'undefined' &&
      redirectUrl &&
      (redirectUrl.startsWith('http://localhost:') || redirectUrl.startsWith('http://127.0.0.1'))
    ) {
      const origin = window.location.origin
      if (!origin.startsWith('http://localhost') && !origin.startsWith('http://127.0.0.1')) {
        redirectUrl = origin
      }
    }
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    })
  }

  const value = {
    user,
    loading,
    isConfigured: !!supabase,
    sessionMessage,
    setSessionMessage,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    resetPasswordForEmail,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
