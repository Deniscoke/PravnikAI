/**
 * Dashboard — PrávníkAI
 *
 * Server component that:
 *   1. Verifies auth (middleware already redirected if unauthenticated)
 *   2. Checks onboarding status — shows onboarding if not completed
 *   3. Fetches history (lightweight: no heavy content)
 *   4. Renders the dashboard UI
 *
 * Protected by middleware — only accessible to authenticated users.
 */

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { HistoryList } from '@/components/dashboard/HistoryList'
import { UserMenu } from '@/components/auth/UserMenu'
import { PricingSection } from '@/components/billing/PricingSection'
import type { SubscriptionTier } from '@/lib/billing/plans'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // ── Fetch profile ───────────────────────────────────────────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url, onboarding_completed')
    .eq('id', user.id)
    .single()

  // ── Onboarding gate — redirect to standalone onboarding page ────────────
  if (!profile?.onboarding_completed) {
    redirect('/onboarding')
  }

  // ── Fetch current subscription tier (UI cache — guard enforces real tier) ──
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('subscription_tier')
    .eq('user_id', user.id)
    .maybeSingle()

  const currentTier: SubscriptionTier = (prefs?.subscription_tier as SubscriptionTier) ?? 'free'

  // ── Fetch history (lightweight — no contract_text or review_result) ────
  const { data: generations } = await supabase
    .from('contract_generations_history')
    .select('id, schema_id, title, mode, status, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  const { data: reviews } = await supabase
    .from('contract_reviews_history')
    .select('id, detected_contract_type, title, overall_risk, status, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <main style={{ position: 'relative', zIndex: 1, minHeight: '100dvh', padding: '0 var(--space-md)' }}>
      <DashboardHeader />

      <div style={{ maxWidth: 920, margin: '0 auto', paddingBottom: 'var(--space-3xl)' }}>
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 'var(--space-xs)' }}>
            Historie
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            Vaše vygenerované smlouvy a provedené kontroly.
          </p>
        </div>

        <HistoryList
          generations={generations ?? []}
          reviews={reviews ?? []}
        />

        {/* Quick actions */}
        <div style={{
          display: 'flex', gap: 'var(--space-md)', justifyContent: 'center',
          marginTop: 'var(--space-2xl)', paddingTop: 'var(--space-lg)',
          borderTop: '1px solid var(--glass-border-subtle)',
        }}>
          <Link href="/generator" className="glass-btn glass-btn--primary" style={{ textDecoration: 'none' }}>
            Nová smlouva
          </Link>
          <Link href="/review" className="glass-btn glass-btn--ghost" style={{ textDecoration: 'none' }}>
            Kontrola smlouvy
          </Link>
        </div>

        {/* Pricing section — upsell for free users, plan overview for paid */}
        <div style={{
          paddingTop: 'var(--space-3xl)',
          borderTop: '1px solid var(--glass-border-subtle)',
          marginTop: 'var(--space-3xl)',
        }}>
          <PricingSection currentTier={currentTier} />
        </div>
      </div>
    </main>
  )
}

function DashboardHeader() {
  return (
    <header style={{ maxWidth: 920, margin: '0 auto', padding: 'var(--space-xl) 0 var(--space-lg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.8rem',
            background: 'linear-gradient(135deg, var(--accent-aqua), var(--accent-violet))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1.2,
          }}>
            PrávníkAI
          </h1>
        </Link>
        <UserMenu />
      </div>
    </header>
  )
}
