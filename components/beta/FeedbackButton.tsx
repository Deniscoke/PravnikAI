'use client'

import { useEffect, useState } from 'react'

/**
 * Floating feedback control, available on every page during beta.
 *
 * Works for signed-out visitors on purpose — the most valuable feedback comes
 * from people who left before creating an account.
 */
export function FeedbackButton() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  function close() {
    setOpen(false)
    if (state === 'done' || state === 'error') {
      setState('idle')
      setMessage('')
      setError(null)
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (state === 'sending') return

    setState('sending')
    setError(null)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          email,
          pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        }),
      })
      const data = (await res.json().catch(() => null)) as { error?: string } | null

      if (!res.ok) {
        setError(data?.error ?? 'Zprávu se nepodařilo odeslat.')
        setState('error')
        return
      }
      setState('done')
    } catch {
      setError('Zprávu se nepodařilo odeslat. Zkontrolujte připojení.')
      setState('error')
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Odeslat zpětnou vazbu"
        className="glass-btn"
        style={{
          position: 'fixed',
          right: 'var(--space-md)',
          bottom: 'var(--space-md)',
          zIndex: 900,
          fontSize: '0.78rem',
          padding: '8px 14px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.28)',
        }}
      >
        Zpětná vazba
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-title"
          onClick={close}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)', padding: 'var(--space-md)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 460,
              padding: 'var(--space-xl)',
              background: 'var(--color-overlay-surface)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
              isolation: 'isolate',
            }}
          >
            <h3 id="feedback-title" style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
              Jak se vám Právo365 používá?
            </h3>

            {state === 'done' ? (
              <>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--color-text-muted)' }}>
                  Děkujeme. Každá zpráva nám pomáhá — čteme je všechny.
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-lg)' }}>
                  <button type="button" className="glass-btn glass-btn--primary" onClick={close}>
                    Zavřít
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={submit}>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: 'var(--space-sm)' }}>
                  Právo365 je v beta verzi. Napište nám, co nefunguje, co chybí nebo co vás zmátlo.
                </p>

                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  maxLength={4000}
                  placeholder="Co byste zlepšili?"
                  aria-label="Vaše zpráva"
                  className="glass-input glass-textarea"
                  style={{ width: '100%' }}
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-mail (nepovinné — pokud chcete odpověď)"
                  aria-label="Váš e-mail (nepovinné)"
                  className="glass-input"
                  style={{ width: '100%', marginTop: 'var(--space-sm)' }}
                />

                {error && (
                  <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: 'var(--accent-rose)' }} role="alert">
                    {error}
                  </p>
                )}

                <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end', marginTop: 'var(--space-lg)', flexWrap: 'wrap' }}>
                  <button type="button" className="glass-btn glass-btn--ghost" onClick={close}>
                    Zrušit
                  </button>
                  <button type="submit" className="glass-btn glass-btn--primary" disabled={state === 'sending'}>
                    {state === 'sending' ? 'Odesílám…' : 'Odeslat'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
