/**
 * Billing plan definitions — PrávníkAI
 *
 * Single source of truth for tier names, usage limits, Stripe price mapping,
 * and UI display metadata (Czech labels, pricing, recommended flags).
 *
 * Price IDs come from env vars so test/live modes use different Stripe products.
 * Pro tier supports both monthly and yearly billing intervals.
 *
 * IMPORTANT: The `SubscriptionTier` type here must match the CHECK constraint
 * in the `user_preferences.subscription_tier` column AND the TypeScript types
 * in `lib/supabase/types.ts`.
 */

// ─── Tier type (shared across billing + Supabase types) ──────────────────────

export type SubscriptionTier = 'free' | 'pro' | 'team'

export type BillingInterval = 'monthly' | 'yearly'

// ─── Per-tier usage limits ───────────────────────────────────────────────────
// -1 means unlimited. Limits reset each billing period (calendar month for free).

export interface TierLimits {
  generations: number
  reviews: number
  exports: number
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: { generations: 3, reviews: 3, exports: 5 },
  pro:  { generations: -1, reviews: -1, exports: -1 },
  team: { generations: -1, reviews: -1, exports: -1 },
} as const

// ─── Plan display metadata (Czech UI) ────────────────────────────────────────

export interface PlanPricing {
  /** Monthly price in EUR (for display). 0 for free tier. */
  monthly: number
  /** Yearly price per month in EUR (for display). null if no yearly option. */
  yearlyPerMonth: number | null
  /** Yearly total in EUR (for display). null if no yearly option. */
  yearlyTotal: number | null
  /** Currency code for display */
  currency: 'EUR'
}

export interface PlanInfo {
  tier: SubscriptionTier
  name: string
  description: string
  features: string[]
  pricing: PlanPricing
  /** Whether to highlight this plan in the UI (e.g., "Nejpopulárnější") */
  recommended: boolean
  /** Badge text shown on the plan card (e.g., "Nejpopulárnější") */
  badge: string | null
}

export const PLAN_INFO: Record<SubscriptionTier, PlanInfo> = {
  free: {
    tier: 'free',
    name: 'Zdarma',
    description: 'Pro jednotlivce — základní přístup',
    features: [
      '3 generování smluv / měsíc',
      '3 AI kontroly / měsíc',
      '5 DOCX exportů / měsíc',
      'Základní typy smluv',
    ],
    pricing: { monthly: 0, yearlyPerMonth: null, yearlyTotal: null, currency: 'EUR' },
    recommended: false,
    badge: null,
  },
  pro: {
    tier: 'pro',
    name: 'Pro',
    description: 'Pro advokáty a právníky',
    features: [
      'Neomezené generování smluv',
      'Neomezené AI kontroly',
      'Neomezené DOCX exporty',
      'Všechny typy smluv',
      'Prioritní podpora',
    ],
    pricing: { monthly: 19, yearlyPerMonth: 15, yearlyTotal: 180, currency: 'EUR' },
    recommended: true,
    badge: 'Nejpopulárnější',
  },
  team: {
    tier: 'team',
    name: 'Tým',
    description: 'Pro advokátní kanceláře',
    features: [
      'Neomezené generování smluv',
      'Neomezené AI kontroly',
      'Neomezené DOCX exporty',
      'Všechny typy smluv',
      'Prioritní podpora',
      'Správa týmu',
    ],
    pricing: { monthly: 49, yearlyPerMonth: null, yearlyTotal: null, currency: 'EUR' },
    recommended: false,
    badge: null,
  },
}

// ─── Stripe price ID mapping ─────────────────────────────────────────────────
// Maps env-provided Stripe Price IDs → our internal tier.
// Free tier has no Stripe price (no subscription needed).
// Pro tier has two Price IDs (monthly + yearly), both map to 'pro'.

function buildPriceToTierMap(): Map<string, SubscriptionTier> {
  const map = new Map<string, SubscriptionTier>()

  const proMonthly = process.env.STRIPE_PRO_MONTHLY_PRICE_ID
  const proYearly = process.env.STRIPE_PRO_YEARLY_PRICE_ID
  const teamMonthly = process.env.STRIPE_TEAM_MONTHLY_PRICE_ID

  if (proMonthly) map.set(proMonthly, 'pro')
  if (proYearly) map.set(proYearly, 'pro')
  if (teamMonthly) map.set(teamMonthly, 'team')

  return map
}

// Lazy-initialized at first call (env vars available after module load in Next.js)
let _priceToTierMap: Map<string, SubscriptionTier> | null = null

function getPriceToTierMap(): Map<string, SubscriptionTier> {
  if (!_priceToTierMap) {
    _priceToTierMap = buildPriceToTierMap()
  }
  return _priceToTierMap
}

/**
 * Maps a Stripe Price ID to our internal subscription tier.
 * Returns 'free' if the price ID is not recognized (fail-safe).
 */
export function mapStripePriceToPlan(stripePriceId: string): SubscriptionTier {
  return getPriceToTierMap().get(stripePriceId) ?? 'free'
}

/**
 * Returns the Stripe Price ID for a given tier + interval.
 * Returns null for free tier (no Stripe product).
 *
 * Pro supports monthly/yearly. Team is monthly-only (for now).
 * Defaults to monthly if interval is not specified.
 */
export function getStripePriceId(
  tier: SubscriptionTier,
  interval: BillingInterval = 'monthly',
): string | null {
  if (tier === 'free') return null

  if (tier === 'pro') {
    return interval === 'yearly'
      ? (process.env.STRIPE_PRO_YEARLY_PRICE_ID ?? null)
      : (process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? null)
  }

  if (tier === 'team') {
    return process.env.STRIPE_TEAM_MONTHLY_PRICE_ID ?? null
  }

  return null
}
