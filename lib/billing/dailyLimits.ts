/**
 * Daily AI usage caps for paid tiers — cost protection beyond monthly billing limits.
 * Free tier uses monthly TIER_LIMITS only.
 *
 * Override via env (optional):
 *   AI_DAILY_CAP_GENERATE=50
 *   AI_DAILY_CAP_REVIEW=50
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { SubscriptionTier } from './plans'
import type { BillingAction } from './guard'

function dailyCap(action: BillingAction): number {
  const key = action === 'generate' ? 'AI_DAILY_CAP_GENERATE' : 'AI_DAILY_CAP_REVIEW'
  const raw = process.env[key]
  const parsed = raw ? Number.parseInt(raw, 10) : NaN
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 50
}

/** Paid tiers get a daily hard cap; free tier is governed by monthly limits only. */
export function tierHasDailyCap(tier: SubscriptionTier): boolean {
  return tier === 'pro' || tier === 'team'
}

export async function getDailyUsageCount(
  supabase: SupabaseClient,
  userId: string,
  action: BillingAction,
): Promise<number> {
  const dayStart = new Date()
  dayStart.setUTCHours(0, 0, 0, 0)
  const since = dayStart.toISOString()
  const table = action === 'generate' ? 'contract_generations_history' : 'contract_reviews_history'

  // Fail-open on DB error: the daily cap is a cost-safety net layered on top of
  // monthly limits and rate limiting. A transient DB error must not hard-block a
  // paying customer — log it for ops instead.
  try {
    const { count, error } = await supabase
      .from(table)
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', since)
      .is('deleted_at', null)
    if (error) {
      console.error(`[dailyLimits] usage count query failed (${action}):`, error.message)
      return 0
    }
    return count ?? 0
  } catch (err) {
    console.error(`[dailyLimits] usage count threw (${action}):`, err instanceof Error ? err.message : err)
    return 0
  }
}

export async function checkDailyAiCap(
  supabase: SupabaseClient,
  userId: string,
  tier: SubscriptionTier,
  action: BillingAction,
): Promise<{ allowed: boolean; used: number; limit: number }> {
  if (!tierHasDailyCap(tier) || action === 'export') {
    return { allowed: true, used: 0, limit: -1 }
  }

  const limit = dailyCap(action)
  const used = await getDailyUsageCount(supabase, userId, action)
  return { allowed: used < limit, used, limit }
}
