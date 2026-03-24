/**
 * Onboarding page — PrávníkAI
 *
 * Server Component. Fetches profile from Supabase:
 *   - If user is already onboarded → redirect to /dashboard
 *   - Otherwise → render the onboarding form
 *
 * Middleware (proxy.ts) already guards this route — unauthenticated users
 * are redirected to /login before reaching here.
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingForm } from './OnboardingForm'

export const metadata = {
  title: 'Vítejte — PrávníkAI',
  robots: 'noindex',
}

export default async function OnboardingPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Middleware already handles this, but defense-in-depth
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()

  // Already onboarded — skip back to dashboard
  if (profile?.onboarding_completed) redirect('/dashboard')

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

        {/* Logo */}
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
            PrávníkAI
          </h1>
          <p style={{
            fontSize: '0.85rem',
            color: 'var(--color-text-muted)',
            marginTop: 'var(--space-xs)',
          }}>
            Než začnete, potřebujeme váš souhlas s podmínkami.
          </p>
        </div>

        {/* Onboarding card */}
        <div className="glass-card" style={{ padding: 'var(--space-2xl)' }}>
          <h2 style={{
            fontSize: '1.15rem',
            fontWeight: 600,
            marginBottom: 'var(--space-xs)',
          }}>
            Vítejte v PrávníkAI
          </h2>
          <p style={{
            fontSize: '0.82rem',
            color: 'var(--color-text-muted)',
            marginBottom: 'var(--space-xl)',
            lineHeight: 1.6,
          }}>
            PrávníkAI je nástroj pro asistenci při tvorbě a kontrole smluv podle
            českého práva. Nejde o právní poradenství — výstupy doporučujeme ověřit
            s kvalifikovaným právníkem.
          </p>

          <OnboardingForm />
        </div>

      </div>
    </main>
  )
}
