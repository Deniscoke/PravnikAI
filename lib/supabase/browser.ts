/**
 * Supabase browser client — PrávníkAI
 *
 * Used in client components ('use client').
 * Uses the public anon key — safe for browser exposure when RLS is enabled.
 *
 * NEVER import the service role key here.
 */

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
