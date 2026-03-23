'use client'

/**
 * Login page — PrávníkAI
 *
 * Simple, focused sign-in page with Google OAuth.
 * Middleware redirects here when unauthenticated users access protected routes.
 * Middleware also redirects AWAY from here if already authenticated.
 */

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { GoogleSignInButton } from '@/components/auth/UserMenu'

export default function LoginPage() {
  return (
    <main style={{ position: 'relative', zIndex: 1, minHeight: '100dvh', padding: '0 var(--space-md)' }}>
      <div style={{ maxWidth: 440, margin: '0 auto', paddingTop: 'var(--space-3xl)' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
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
          </Link>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: 'var(--space-xs)' }}>
            Přihlaste se pro uložení historie a přístup k dalším funkcím.
          </p>
        </div>

        {/* Error message */}
        <Suspense>
          <LoginError />
        </Suspense>

        {/* Sign-in card */}
        <div className="glass-card" style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>
            Přihlášení
          </h2>

          <Suspense>
            <LoginButton />
          </Suspense>

          <p style={{
            fontSize: '0.72rem',
            color: 'var(--color-text-subtle)',
            marginTop: 'var(--space-lg)',
            lineHeight: 1.6,
          }}>
            Přihlášením souhlasíte se zpracováním údajů nezbytných pro fungování služby.
            Používáme výhradně přihlášení přes Google — vaše heslo nikdy neukládáme.
          </p>
        </div>

        {/* Back link */}
        <div style={{ textAlign: 'center', marginTop: 'var(--space-lg)' }}>
          <Link href="/" style={{ fontSize: '0.82rem', color: 'var(--accent-aqua)', textDecoration: 'none' }}>
            ← Zpět na hlavní stránku
          </Link>
        </div>
      </div>
    </main>
  )
}

function LoginError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  if (!error) return null

  return (
    <div className="alert alert--error" style={{ marginBottom: 'var(--space-lg)' }}>
      Přihlášení se nezdařilo. Zkuste to prosím znovu.
    </div>
  )
}

function LoginButton() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || undefined

  return <GoogleSignInButton redirectTo={redirect} />
}
