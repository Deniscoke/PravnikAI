/**
 * Operator notifications — Právo365
 *
 * Sends a plain-text e-mail to the operator when something worth knowing
 * happens (a beta signup, a piece of feedback). Delivery is best-effort:
 * the database write is the record of truth, this is just the nudge.
 *
 * Configuration (all optional — without them the module is a no-op):
 *   RESEND_API_KEY        — enables sending
 *   FEEDBACK_TO_EMAIL     — recipient (defaults to the support address)
 *   FEEDBACK_FROM_EMAIL   — verified sender in Resend
 */

import { Resend } from 'resend'

const DEFAULT_TO = 'info.indiweb@gmail.com'
/** Resend's shared sender works without a verified domain. */
const DEFAULT_FROM = 'Právo365 <onboarding@resend.dev>'

export interface NotifyInput {
  subject: string
  body: string
  /** Address to set as Reply-To, when the sender left one. */
  replyTo?: string
}

/**
 * Fire-and-forget notification. Never throws — a failed e-mail must not fail
 * the request that triggered it.
 */
export async function notifyOperator({ subject, body, replyTo }: NotifyInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) return

  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: process.env.FEEDBACK_FROM_EMAIL?.trim() || DEFAULT_FROM,
      to: process.env.FEEDBACK_TO_EMAIL?.trim() || DEFAULT_TO,
      subject,
      text: body,
      ...(replyTo ? { replyTo } : {}),
    })

    if (error) {
      console.error('[notify] Resend rejected the message:', error.message)
    }
  } catch (err) {
    console.error('[notify] Failed to send operator notification:', err instanceof Error ? err.message : err)
  }
}

/** Basic shape check — deliverability is proven by sending, not by regex. */
export function isPlausibleEmail(value: string): boolean {
  const trimmed = value.trim()
  if (trimmed.length < 5 || trimmed.length > 254) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)
}
