/**
 * Account Management API — PrávníkAI
 *
 * GET  /api/account   — Get account data (profile + preferences)
 * DELETE /api/account — GDPR Article 17: Right to erasure (account deletion)
 *
 * The DELETE handler:
 *   1. Authenticates the user
 *   2. Deletes user data from public tables (cascade handles most via FK)
 *   3. Deletes the auth user via service role (admin.deleteUser)
 *   4. Signs out and clears session
 *
 * Security:
 *   - Requires valid session (getUser validates JWT server-side)
 *   - Service client used only for admin.deleteUser()
 *   - ON DELETE CASCADE on auth.users FK handles public table cleanup
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

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
  // Rate limit account deletion — prevent abuse (3 attempts per 10 minutes)
  const ip = getClientIp(req.headers)
  const { allowed: rlAllowed, resetAt } = checkRateLimit(`delete:${ip}`, { max: 3, windowMs: 600_000 })
  if (!rlAllowed) {
    return NextResponse.json(
      { error: 'Příliš mnoho pokusů o smazání. Zkuste to za chvíli.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)) } },
    )
  }

  // ── 1. Authenticate ────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // ── 2. Delete user data from public tables ─────────────────────────────
    // ON DELETE CASCADE on the auth.users FK handles:
    //   - profiles (id → auth.users.id)
    //   - user_preferences (user_id → auth.users.id)
    //   - contract_generations_history (user_id → auth.users.id)
    //   - contract_reviews_history (user_id → auth.users.id)
    //
    // Audit events: user_id is SET NULL on deletion (anonymized trail preserved)
    //
    // We explicitly delete here as a safety net in case CASCADE isn't configured:
    await Promise.all([
      supabase.from('contract_generations_history').delete().eq('user_id', user.id),
      supabase.from('contract_reviews_history').delete().eq('user_id', user.id),
      supabase.from('user_preferences').delete().eq('user_id', user.id),
      supabase.from('profiles').delete().eq('id', user.id),
    ])

    // ── 3. Delete auth user (requires service role) ────────────────────────
    const serviceClient = await createServiceClient()
    const { error: deleteError } = await serviceClient.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('[account/delete] Failed to delete auth user:', deleteError)
      return NextResponse.json(
        { error: 'Nepodařilo se smazat účet. Kontaktujte nás na info.indiweb@gmail.com.' },
        { status: 500 },
      )
    }

    // ── 4. Sign out (clear cookies) ─────────────────────────────────────────
    await supabase.auth.signOut()

    return NextResponse.json({
      success: true,
      message: 'Váš účet a všechna data byla úspěšně smazána.',
    })
  } catch (err) {
    console.error('[account/delete] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Při mazání účtu došlo k chybě. Kontaktujte nás na info.indiweb@gmail.com.' },
      { status: 500 },
    )
  }
}
