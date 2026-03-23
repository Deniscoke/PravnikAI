/**
 * Supabase server client — PrávníkAI
 *
 * Used in server components, API routes, and server actions.
 * Reads session from cookies — the middleware keeps them fresh.
 *
 * Uses the public anon key + user JWT from cookies → RLS policies apply.
 * For admin operations, use createServiceClient() instead.
 *
 * IMPORTANT: This calls cookies() which makes the calling route/component dynamic.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates a Supabase client authenticated as the current user (via cookie session).
 * RLS policies apply — users can only access their own data.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // setAll can throw in Server Components where headers are read-only.
            // This is expected — the middleware handles session refresh.
          }
        },
      },
    },
  )
}

/**
 * Creates a Supabase client with the service role key — bypasses RLS.
 * Use ONLY for server-side admin operations (e.g., audit logging).
 *
 * NEVER expose this client to the browser.
 */
export async function createServiceClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {
          // Service client doesn't need to set user cookies
        },
      },
    },
  )
}
