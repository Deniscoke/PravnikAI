'use client'

/**
 * Global error boundary — PrávníkAI
 *
 * Catches unhandled runtime errors in any route segment.
 * Shows a friendly Czech error message with retry option
 * instead of a blank white screen.
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-xl)',
      fontFamily: 'var(--font-body)',
    }}>
      <div style={{
        maxWidth: 420,
        textAlign: 'center',
        background: 'var(--glass-white)',
        backdropFilter: 'var(--blur-md)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-2xl)',
        boxShadow: 'var(--shadow-glass)',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.4rem',
          color: 'var(--color-text)',
          marginBottom: 'var(--space-sm)',
        }}>
          Něco se pokazilo
        </h2>
        <p style={{
          fontSize: '0.88rem',
          color: 'var(--color-text-muted)',
          lineHeight: 1.6,
          marginBottom: 'var(--space-lg)',
        }}>
          Omlouváme se za problém. Zkuste to prosím znovu.
          {error.digest && (
            <span style={{
              display: 'block',
              marginTop: 'var(--space-xs)',
              fontSize: '0.74rem',
              color: 'var(--color-text-subtle)',
            }}>
              Kód chyby: {error.digest}
            </span>
          )}
        </p>
        <button
          onClick={reset}
          style={{
            padding: '10px 24px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.88rem',
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
            background: 'linear-gradient(135deg, var(--accent-aqua), var(--accent-violet))',
            color: '#0b0e1a',
            boxShadow: '0 4px 16px rgba(94,231,223,0.25)',
          }}
        >
          Zkusit znovu
        </button>
        <p style={{
          fontSize: '0.74rem',
          color: 'var(--color-text-subtle)',
          marginTop: 'var(--space-lg)',
        }}>
          Přetrvává problém?{' '}
          <a href="mailto:info.indiweb@gmail.com" style={{ color: 'var(--color-text-muted)' }}>
            info.indiweb@gmail.com
          </a>
        </p>
      </div>
    </div>
  )
}
