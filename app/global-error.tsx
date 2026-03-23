'use client'

/**
 * Root-level error boundary — PrávníkAI
 *
 * Catches errors in the root layout (layout.tsx) itself.
 * Must render its own <html> and <body> since the layout has failed.
 * Reports to Sentry before rendering a minimal fallback UI.
 */

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="cs">
      <body style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0b0e1a',
        fontFamily: 'system-ui, sans-serif',
        color: '#e0e0e0',
      }}>
        <div style={{
          maxWidth: 420,
          textAlign: 'center',
          padding: '2rem',
        }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>
            Nastala kritická chyba
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#999', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Omlouváme se za problém. Zkuste obnovit stránku.
            {error.digest && (
              <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.74rem', color: '#666' }}>
                Kód: {error.digest}
              </span>
            )}
          </p>
          <button
            onClick={reset}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.88rem',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #5ee7df, #b490ca)',
              color: '#0b0e1a',
            }}
          >
            Zkusit znovu
          </button>
          <p style={{ fontSize: '0.74rem', color: '#666', marginTop: '1.5rem' }}>
            Přetrvává problém?{' '}
            <a href="mailto:info.indiweb@gmail.com" style={{ color: '#999' }}>
              info.indiweb@gmail.com
            </a>
          </p>
        </div>
      </body>
    </html>
  )
}
