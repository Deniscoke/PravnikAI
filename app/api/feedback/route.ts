/**
 * POST /api/feedback
 *
 * In-app product feedback during beta. Works for signed-out visitors too —
 * the whole point is to hear from people who bounced before registering.
 *
 * The database row is the record; the operator e-mail is only a notification.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit'
import { notifyOperator, isPlausibleEmail } from '@/lib/email/notify'

export const runtime = 'nodejs'

const MIN_MESSAGE_LENGTH = 5
const MAX_MESSAGE_LENGTH = 4000
const MAX_URL_LENGTH = 500

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req.headers)
  const rl = await checkRateLimit(`feedback:${ip}`, {
    max: 5,
    windowMs: 60_000,
    whenUnavailable: 'allow',
  })
  if (!rl.allowed) {
    return rateLimitResponse(rl, 'Příliš mnoho zpráv. Zkuste to prosím za chvíli.')
  }

  let body: { message?: unknown; email?: unknown; pageUrl?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Neplatný požadavek.' }, { status: 400 })
  }

  const message = typeof body.message === 'string' ? body.message.trim() : ''
  if (message.length < MIN_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: 'Napište prosím alespoň krátkou zprávu.', code: 'MESSAGE_TOO_SHORT' },
      { status: 400 },
    )
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: 'Zpráva je příliš dlouhá.', code: 'MESSAGE_TOO_LONG' },
      { status: 413 },
    )
  }

  const rawEmail = typeof body.email === 'string' ? body.email.trim() : ''
  const email = rawEmail && isPlausibleEmail(rawEmail) ? rawEmail : null
  const pageUrl =
    typeof body.pageUrl === 'string' ? body.pageUrl.trim().slice(0, MAX_URL_LENGTH) : null

  // Associate with the account when someone is signed in — optional context.
  let userId: string | null = null
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    userId = user?.id ?? null
  } catch {
    // Signed-out visitors are expected here.
  }

  try {
    const serviceClient = await createServiceClient()
    const { error } = await serviceClient
      .from('feedback')
      .insert({ message, email, page_url: pageUrl, user_id: userId })

    if (error) {
      console.error('[feedback] Failed to store message:', error.message)
      return NextResponse.json(
        { error: 'Zprávu se nepodařilo odeslat. Zkuste to prosím znovu.' },
        { status: 502 },
      )
    }
  } catch (err) {
    console.error('[feedback] Unexpected failure:', err)
    return NextResponse.json(
      { error: 'Zprávu se nepodařilo odeslat. Zkuste to prosím znovu.' },
      { status: 502 },
    )
  }

  await notifyOperator({
    subject: 'Právo365 — nová zpětná vazba',
    body:
      `${message}\n\n---\n` +
      `Od: ${email ?? 'neuvedeno'}\n` +
      `Uživatel: ${userId ?? 'nepřihlášen'}\n` +
      `Stránka: ${pageUrl ?? '—'}\n` +
      `Čas: ${new Date().toISOString()}`,
    ...(email ? { replyTo: email } : {}),
  })

  return NextResponse.json({ ok: true })
}
