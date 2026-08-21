'use client'

import { useState } from 'react'

/**
 * Beta waitlist capture. Used before paid launch to build a list of people to
 * contact on the day billing opens.
 */
export function BetaSignupForm({ source, compact = false }: { source: string; compact?: boolean }) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (state === 'sending') return

    setState('sending')
    setError(null)
    try {
      const res = await fetch('/api/beta-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      })
      const data = (await res.json().catch(() => null)) as { error?: string } | null

      if (!res.ok) {
        setError(data?.error ?? 'Registraci se nepodařilo uložit.')
        setState('error')
        return
      }
      setState('done')
    } catch {
      setError('Registraci se nepodařilo uložit. Zkontrolujte připojení.')
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <p className="alert alert--success" role="status" style={{ margin: 0 }}>
        Děkujeme — ozveme se vám, jakmile spustíme ostrý provoz.
      </p>
    )
  }

  return (
    <form onSubmit={submit} style={{ margin: 0 }}>
      <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vas@email.cz"
          aria-label="E-mailová adresa"
          className="glass-input"
          style={{ flex: '1 1 220px', minWidth: 0 }}
        />
        <button
          type="submit"
          className="glass-btn glass-btn--primary"
          disabled={state === 'sending'}
        >
          {state === 'sending' ? 'Odesílám…' : 'Chci vědět o spuštění'}
        </button>
      </div>
      {!compact && (
        <p style={{ margin: '8px 0 0', fontSize: '0.76rem', color: 'var(--color-text-subtle)' }}>
          Pošleme jednu zprávu, až spustíme ostrý provoz. Žádný spam, odhlásíte se kdykoli.
        </p>
      )}
      {error && (
        <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: 'var(--accent-rose)' }} role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
