/**
 * Dashboard — protected account overview and history.
 */

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { HistoryList } from '@/components/dashboard/HistoryList'
import { UserMenu } from '@/components/auth/UserMenu'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { PricingSection } from '@/components/billing/PricingSection'
import { BillingAlert } from '@/components/billing/BillingAlert'
import type { SubscriptionTier } from '@/lib/billing/plans'
import { getMessages, isValidLocale } from '@/lib/i18n'
import { DEFAULT_LOCALE, type Locale } from '@/lib/contracts/types'
import { Suspense } from 'react'

type DashboardParams = Promise<{ locale: string }>

export default async function DashboardPage({ params }: { params: DashboardParams }) {
  const { locale: raw } = await params
  const locale: Locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE
  const base = `/${locale}`
  const t = getMessages(locale)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`${base}/login`)

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url, onboarding_completed')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_completed) {
    redirect(`${base}/onboarding`)
  }

  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('subscription_tier')
    .eq('user_id', user.id)
    .maybeSingle()

  const currentTier: SubscriptionTier = (prefs?.subscription_tier as SubscriptionTier) ?? 'free'

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
      <header style={{ maxWidth: 920, margin: '0 auto', padding: 'var(--space-xl) 0 var(--space-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-md)', flexWrap: 'wrap' }}>
          <LanguageSwitcher />
          <UserMenu />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <Link href={base} style={{ textDecoration: 'none' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.8rem',
              background: 'linear-gradient(135deg, var(--accent-aqua), var(--accent-violet))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1.2,
            }}>
              {t.meta.siteName}
            </h1>
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: 920, margin: '0 auto', paddingBottom: 'var(--space-3xl)' }}>
        <Suspense fallback={null}>
          <BillingAlert />
        </Suspense>

        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 'var(--space-xs)' }}>
            {t.accountMenu.history}
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            {t.dashboard.historySubtitle}
          </p>
        </div>

        <HistoryList locale={locale} generations={generations ?? []} reviews={reviews ?? []} />

        <div style={{
          display: 'flex', gap: 'var(--space-md)', justifyContent: 'center',
          marginTop: 'var(--space-2xl)', paddingTop: 'var(--space-lg)',
          borderTop: '1px solid var(--glass-border-subtle)',
        }}>
          <Link href={`${base}/generator`} className="glass-btn glass-btn--primary" style={{ textDecoration: 'none' }}>
            {t.result.newContract}
          </Link>
          <Link href={`${base}/review`} className="glass-btn glass-btn--ghost" style={{ textDecoration: 'none' }}>
            {t.nav.review}
          </Link>
        </div>

        <div style={{
          paddingTop: 'var(--space-3xl)',
          borderTop: '1px solid var(--glass-border-subtle)',
          marginTop: 'var(--space-3xl)',
        }} id="cenik">
          <PricingSection currentTier={currentTier} />
        </div>
      </div>
    </main>
  )
}
