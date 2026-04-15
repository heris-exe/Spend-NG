/**
 * Supabase client for database and auth.
 * Uses Vite env vars: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
 * Create a .env file from .env.example and add your project keys from the Supabase dashboard.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const REMEMBER_ME_KEY = 'spendng_remember_me'

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase env vars missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env. Using mock (no persistence).'
  )
}

const browserStorage = {
  getRememberMe() {
    if (typeof window === 'undefined') return true
    try {
      return window.localStorage.getItem(REMEMBER_ME_KEY) !== '0'
    } catch {
      return true
    }
  },
  setRememberMe(rememberMe) {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(REMEMBER_ME_KEY, rememberMe ? '1' : '0')
    } catch {
      // ignore storage write failures in private browsing
    }
  },
}

const supabaseStorage = {
  getActiveStorage() {
    if (typeof window === 'undefined') return null
    return browserStorage.getRememberMe() ? window.localStorage : window.sessionStorage
  },
  getItem(key) {
    const activeStorage = this.getActiveStorage()
    if (!activeStorage) return null
    const value = activeStorage.getItem(key)
    if (value != null) return value
    // Fallback helps when the remember-me mode changes between sessions.
    const fallbackStorage = activeStorage === window.localStorage ? window.sessionStorage : window.localStorage
    return fallbackStorage.getItem(key)
  },
  setItem(key, value) {
    const activeStorage = this.getActiveStorage()
    if (!activeStorage) return
    activeStorage.setItem(key, value)
  },
  removeItem(key) {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(key)
    window.sessionStorage.removeItem(key)
  },
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          storage: supabaseStorage,
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null

export { browserStorage }
