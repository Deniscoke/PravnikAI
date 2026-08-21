/**
 * POST /api/beta-signup
 *
 * Stores an address on the beta waitlist. Public and unauthenticated — the
 * point is to collect interest before paid launch.
 *
 * The database row is the record; the operator e-mail is only a notification.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit'
import { notifyOperator, isPlausibleEmail } from '@/lib/email/notify'

export const runtime = 'nodejs'

const MAX_SOURCE_LENGTH = 64

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req.headers)
  // Losing the limiter must not close the signup funnel — this endpoint costs
  // nothing per call and duplicates are collapsed by a unique index.
  const rl = await checkRateLimit(`beta-signup:${ip}`, {
    max: 5,
    windowMs: 60_000,
    whenUnavailable: 'allow',
  })
  if (!rl.allowed) {
    return rateLimitResponse(rl, 'Příliš mnoho pokusů. Zkuste to prosím za chvíli.')
  }

  let body: { email?: unknown; source?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Neplatný požadavek.' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim() : ''
  if (!isPlausibleEmail(email)) {
    return NextResponse.json(
      { error: 'Zadejte prosím platnou e-mailovou adresu.', code: 'INVALID_EMAIL' },
      { status: 400 },
    )
  }

  const source =
    typeof body.source === 'string' ? body.source.trim().slice(0, MAX_SOURCE_LENGTH) : null

  try {
    const serviceClient = await createServiceClient()
    const { error } = await serviceClient
      .from('beta_signups')
      .upsert({ email, source }, { onConflict: 'email', ignoreDuplicates: true })

    if (error) {
      console.error('[beta-signup] Failed to store address:', error.message)
      return NextResponse.json(
        { error: 'Registraci se nepodařilo uložit. Zkuste to prosím znovu.' },
        { status: 502 },
      )
    }
  } catch (err) {
    console.error('[beta-signup] Unexpected failure:', err)
    return NextResponse.json(
      { error: 'Registraci se nepodařilo uložit. Zkuste to prosím znovu.' },
      { status: 502 },
    )
  }

  // Best-effort; the row above is already saved.
  await notifyOperator({
    subject: `Právo365 — nová registrace do bety (${source ?? 'neznámý zdroj'})`,
    body: `E-mail: ${email}\nZdroj: ${source ?? '—'}\nČas: ${new Date().toISOString()}`,
    replyTo: email,
  })

  return NextResponse.json({ ok: true })
}
