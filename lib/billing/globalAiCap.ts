/**
 * Platform-wide daily cap on AI actions.
 *
 * Per-account limits bound what one user can spend; they do nothing about a
 * hundred accounts each spending their allowance on the same day. During beta
 * — when signups are free and unverified — this is the only limit that puts a
 * ceiling on the OpenAI bill.
 *
 * Counting spans every account, so it must run with the service role: under RLS
 * a user-scoped client only ever sees its own rows and the total would be wrong.
 *
 * Override via env:
 *   AI_GLOBAL_DAILY_CAP=150   (generations + reviews combined, per UTC day)
 */

import { createServiceClient } from '@/lib/supabase/server'
import type { BillingAction } from './guard'

const DEFAULT_GLOBAL_DAILY_CAP = 150

export interface GlobalCapResult {
  allowed: boolean
  used: number
  limit: number
}

function globalDailyCap(): number {
  const raw = process.env.AI_GLOBAL_DAILY_CAP
  const parsed = raw ? Number.parseInt(raw, 10) : NaN
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_GLOBAL_DAILY_CAP
}

/** True for the actions that cost an AI call. Exports are free to serve. */
export function isAiAction(action: BillingAction): boolean {
  return action === 'generate' || action === 'review'
}

/**
 * Counts today's AI actions across all accounts.
 *
 * Fails OPEN: a counting error must not take the product offline. The per-user
 * limits and the rate limiter still apply, so the exposure stays bounded.
 */
export async function checkGlobalDailyAiCap(action: BillingAction): Promise<GlobalCapResult> {
  const limit = globalDailyCap()

  if (!isAiAction(action)) {
    return { allowed: true, used: 0, limit: -1 }
  }

  const dayStart = new Date()
  dayStart.setUTCHours(0, 0, 0, 0)
  const since = dayStart.toISOString()

  try {
    const serviceClient = await createServiceClient()

    const [generations, reviews] = await Promise.all([
      serviceClient
        .from('contract_generations_history')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', since),
      serviceClient
        .from('contract_reviews_history')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', since),
    ])

    if (generations.error || reviews.error) {
      console.error(
        '[globalAiCap] Count failed:',
        generations.error?.message ?? reviews.error?.message,
      )
      return { allowed: true, used: 0, limit }
    }

    const used = (generations.count ?? 0) + (reviews.count ?? 0)

    if (used >= limit) {
      console.warn(`[globalAiCap] Platform daily AI cap reached: ${used}/${limit}`)
    }

    return { allowed: used < limit, used, limit }
  } catch (err) {
    console.error('[globalAiCap] Unexpected failure:', err instanceof Error ? err.message : err)
    return { allowed: true, used: 0, limit }
  }
}
