/**
 * Supabase client for database and auth.
 * Uses Vite env vars: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
 * Create a .env file from .env.example and add your project keys from the Supabase dashboard.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase env vars missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env. Using mock (no persistence).'
  )
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null
