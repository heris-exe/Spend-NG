import { supabase } from '../lib/supabase'

function rowToWeeklyBudget(row) {
  if (!row) return null
  return {
    id: row.id,
    amount: Number(row.amount) || 0,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  }
}

export async function fetchWeeklyBudget() {
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') }
  }
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: authError || new Error('Not signed in') }
  }

  const { data, error } = await supabase
    .from('weekly_budgets')
    .select('id, amount, created_at, updated_at')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) return { data: null, error }
  return { data: rowToWeeklyBudget(data), error: null }
}

export async function upsertWeeklyBudget(amount) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') }
  }
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: authError || new Error('Not signed in') }
  }

  const row = {
    user_id: user.id,
    amount: Number(amount) || 0,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('weekly_budgets')
    .upsert(row, { onConflict: 'user_id' })
    .select('id, amount, created_at, updated_at')
    .maybeSingle()

  if (error) return { data: null, error }
  return { data: rowToWeeklyBudget(data), error: null }
}
