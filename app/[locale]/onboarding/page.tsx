/**
 * First-time consent / onboarding gate.
 */

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingForm } from './OnboardingForm'
import { getMessages, isValidLocale } from '@/lib/i18n'
import { DEFAULT_LOCALE, type Locale } from '@/lib/contracts/types'

type PageParams = Promise<{ locale: string }>

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const { locale: raw } = await params
  const locale: Locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE
  const t = getMessages(locale)
  return {
    title: t.onboarding.welcomeTitle,
    robots: 'noindex',
  }
}

export default async function OnboardingPage({ params }: { params: PageParams }) {
  const { locale: raw } = await params
  const locale: Locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE
  const base = `/${locale}`
  const t = getMessages(locale)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`${base}/login`)

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()

  if (profile?.onboarding_completed) redirect(`${base}/dashboard`)

  return (
    <main style={{
      position: 'relative',
      zIndex: 1,
      minHeight: '100dvh',
      padding: '0 var(--space-md)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: 480 }}>

        <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            background: 'linear-gradient(135deg, var(--accent-aqua), var(--accent-violet))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1.2,
          }}>
            {t.meta.siteName}
          </h1>
          <p style={{
            fontSize: '0.85rem',
            color: 'var(--color-text-muted)',
            marginTop: 'var(--space-xs)',
          }}>
            {t.onboarding.consentSubtitle}
          </p>
        </div>

        <div className="glass-card" style={{ padding: 'var(--space-2xl)' }}>
          <h2 style={{
            fontSize: '1.15rem',
            fontWeight: 600,
            marginBottom: 'var(--space-xs)',
          }}>
            {t.onboarding.welcomeTitle}
          </h2>
          <p style={{
            fontSize: '0.82rem',
            color: 'var(--color-text-muted)',
            marginBottom: 'var(--space-xl)',
            lineHeight: 1.6,
          }}>
            {t.onboarding.welcomeLead}
          </p>

          <OnboardingForm locale={locale} />
        </div>

      </div>
    </main>
  )
}
