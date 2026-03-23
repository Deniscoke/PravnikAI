/**
 * Account Management API — PrávníkAI
 *
 * Scaffolded routes for GDPR-required account operations.
 * These are TODO-marked for full implementation.
 *
 * Future endpoints:
 *   GET  /api/account         — Get account data
 *   GET  /api/account/export  — GDPR Article 15: data export (right of access)
 *   DELETE /api/account       — Account deletion (right to erasure)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch profile + preferences
  const [{ data: profile }, { data: preferences }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('user_preferences').select('*').eq('user_id', user.id).single(),
  ])

  return NextResponse.json({
    id: user.id,
    email: user.email,
    profile,
    preferences,
  })
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // TODO: Implement full account deletion flow:
  //
  // 1. Export user data (for GDPR right of access compliance)
  //    - profiles, contract_generations_history, contract_reviews_history, user_preferences
  //
  // 2. Delete user data from public tables
  //    - ON DELETE CASCADE handles this via auth.users FK
  //
  // 3. Keep anonymized audit trail
  //    - private.audit_events.user_id is SET NULL on user deletion
  //
  // 4. Delete the auth user
  //    - Requires service role: supabase.auth.admin.deleteUser(user.id)
  //    - Import createServiceClient from '@/lib/supabase/server'
  //
  // 5. Sign out and clear session cookies
  //
  // For now, return a 501 Not Implemented response.

  return NextResponse.json(
    {
      error: 'Smazání účtu zatím není k dispozici. Kontaktujte nás na info.indiweb@gmail.com.',
      code: 'NOT_IMPLEMENTED',
    },
    { status: 501 },
  )
}
