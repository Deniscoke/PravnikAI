'use client'

import React, { useState } from 'react'
import type { GenerateContractResponse, GenerationMode } from '@/lib/contracts/types'

interface ContractResultProps {
  result: GenerateContractResponse
  contractName: string
  onBack: () => void
  onReset: () => void
}

export function ContractResult({ result, contractName, onBack, onReset }: ContractResultProps) {
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(false)

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(result.contractText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for non-HTTPS or permission denied
      alert('Kopírování se nezdařilo. Zkuste to znovu nebo text vyberte ručně.')
    }
  }

  async function exportDocx() {
    setExporting(true)
    try {
      const res = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractText: result.contractText,
          contractName,
          mode: result.mode,
          schemaId: result.schemaId,
          generatedAt: result.generatedAt,
          legalBasis: result.legalBasis,
        }),
      })

      if (!res.ok) {
        const errorBody = await res.text().catch(() => '')
        console.error('[export-docx] Server error:', res.status, errorBody)
        throw new Error(`Server vrátil ${res.status}: ${errorBody}`)
      }

      const blob = await res.blob()
      if (blob.size === 0) {
        throw new Error('Server vrátil prázdný soubor')
      }

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${contractName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.docx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('[export-docx] Export failed:', err)
      alert('Export do DOCX se nezdařil. Zkuste to znovu.')
    } finally {
      setExporting(false)
    }
  }

  const modeBadge = modeToDisplay(result.mode)
  const errorWarnings = result.warnings.filter((w) => w.code === 'LEGAL_CONSTRAINT')
  const modeWarnings = result.warnings.filter((w) => w.code !== 'LEGAL_CONSTRAINT')

  return (
    <section aria-labelledby="result-heading">

      {/* ── Trust banner — always visible at top ── */}
      <div className="trust-banner" style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
        padding: 'var(--space-sm) var(--space-md)',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--glass-border-subtle)',
        borderRadius: 'var(--radius-sm)',
        marginBottom: 'var(--space-md)',
        fontSize: '0.75rem', color: 'var(--color-text-subtle)',
      }}>
        <ShieldIcon />
        <span>
          AI návrh · Vyžaduje kontrolu advokátem · Negeneruje právní poradenství dle zák. č. 85/1996 Sb.
        </span>
        <span style={{ marginLeft: 'auto', fontFamily: 'monospace', fontSize: '0.68rem', opacity: 0.7 }}>
          v{result.schemaId.split('-v')[1] ?? '1'}
        </span>
      </div>

      {/* ── Header row ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-xs)' }}>
            <h2 id="result-heading" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
              {contractName}
            </h2>
            <span className={`badge badge--${badgeClass(result.mode)}`}>
              {modeBadge.label}
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)' }}>
            Vygenerováno {formatDateTime(result.generatedAt)} · {result.schemaId}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
          <button className="glass-btn" onClick={copyToClipboard} aria-live="polite">
            {copied ? <><CheckIcon /> Zkopírováno</> : <><CopyIcon /> Kopírovat</>}
          </button>
          <button className="glass-btn" onClick={exportDocx} disabled={exporting}>
            {exporting ? <><SpinnerIcon /> Export…</> : <><DocxIcon /> DOCX</>}
          </button>
          <button className="glass-btn glass-btn--ghost" onClick={onBack}>
            Upravit
          </button>
          <button className="glass-btn glass-btn--ghost" onClick={onReset}>
            Nová smlouva
          </button>
        </div>
      </div>

      {/* ── Mode explanation ── */}
      <div className={`alert alert--${modeBadge.alertType}`} style={{ marginBottom: 'var(--space-md)' }}>
        <strong>{modeBadge.label}:</strong> {modeBadge.description}
      </div>

      {/* ── Legal warnings (Layer 2 issues) ── */}
      {errorWarnings.length > 0 && (
        <div style={{ marginBottom: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
          {errorWarnings.map((w, i) => (
            <div key={i} className="alert alert--warning" style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'flex-start' }}>
              <WarningIcon />
              <div>
                <div>{w.message}</div>
                {w.legalBasis && (
                  <div style={{ fontSize: '0.72rem', opacity: 0.75, marginTop: 2, fontFamily: 'monospace' }}>
                    {w.legalBasis}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Mode warnings (draft / review-needed) ── */}
      {modeWarnings.map((w, i) => (
        <div key={i} className="alert alert--info" style={{ marginBottom: 'var(--space-sm)' }}>
          {w.message}
        </div>
      ))}

      {/* ── Missing optional fields ── */}
      {result.missingFields.length > 0 && result.mode !== 'review-needed' && (
        <details style={{ marginBottom: 'var(--space-md)' }}>
          <summary style={{ cursor: 'pointer', fontSize: '0.82rem', color: 'var(--color-text-muted)', padding: 'var(--space-xs) 0', userSelect: 'none' }}>
            {result.missingFields.length} volitelných polí nebylo vyplněno (kliknutím zobrazíte)
          </summary>
          <div style={{ marginTop: 'var(--space-sm)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
            {result.missingFields.map((f) => (
              <code key={f} style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 4, color: 'var(--color-text-subtle)', fontFamily: 'monospace' }}>
                {f}
              </code>
            ))}
          </div>
        </details>
      )}

      {/* ── Legal basis chips ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)', marginBottom: 'var(--space-lg)' }}>
        {result.legalBasis.map((basis, i) => (
          <span key={i} style={{ fontSize: '0.7rem', padding: '2px 10px', borderRadius: 'var(--radius-full)', background: 'rgba(94,231,223,0.08)', border: '1px solid rgba(94,231,223,0.2)', color: 'var(--accent-aqua)', fontFamily: 'monospace' }}>
            {basis}
          </span>
        ))}
      </div>

      {/* ── Contract text ── */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 'var(--space-sm) var(--space-lg)', borderBottom: '1px solid var(--glass-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Text smlouvy
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-subtle)' }}>
            {result.contractText.length.toLocaleString('cs-CZ')} znaků
          </span>
        </div>
        <pre
          style={{
            padding: 'var(--space-xl)',
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '0.88rem',
            lineHeight: 1.8,
            color: 'var(--color-text)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxHeight: '70vh',
            overflowY: 'auto',
          }}
        >
          {result.contractText}
        </pre>
      </div>

      {/* ── Bottom actions ── */}
      <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', marginTop: 'var(--space-xl)', flexWrap: 'wrap' }}>
        <button className="glass-btn glass-btn--primary" onClick={copyToClipboard}>
          {copied ? <><CheckIcon /> Zkopírováno</> : <><CopyIcon /> Kopírovat do schránky</>}
        </button>
        <button className="glass-btn" onClick={exportDocx} disabled={exporting}>
          {exporting ? <><SpinnerIcon /> Exportuji…</> : <><DocxIcon /> Stáhnout DOCX</>}
        </button>
        <button className="glass-btn" onClick={onBack}>
          Upravit a vygenerovat znovu
        </button>
        <button className="glass-btn glass-btn--ghost" onClick={onReset}>
          Nová smlouva
        </button>
      </div>

      {/* ── Compliance disclaimer ── */}
      <div className="glass-card" style={{
        marginTop: 'var(--space-xl)',
        padding: 'var(--space-md) var(--space-lg)',
        display: 'flex',
        gap: 'var(--space-sm)',
        alignItems: 'flex-start',
        borderColor: 'var(--glass-border-subtle)',
      }}>
        <ShieldIcon />
        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-subtle)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--color-text-muted)' }}>Právní upozornění</strong>
          <br />
          Tento dokument byl vygenerován umělou inteligencí a slouží výhradně jako <strong>pracovní návrh</strong>.
          Před podpisem nebo právním použitím jej nechte zkontrolovat advokátem.
          Systém neposkytuje právní poradenství ve smyslu zák. č. 85/1996 Sb., o advokacii.
          Provozovatel nenese odpovědnost za obsah vygenerovaného textu ani za jeho právní účinky.
          <br />
          <span style={{ fontFamily: 'monospace', opacity: 0.6 }}>
            Schéma: {result.schemaId} · Mód: {result.mode} · {formatDateTime(result.generatedAt)}
          </span>
        </div>
      </div>
    </section>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function modeToDisplay(mode: GenerationMode): {
  label: string
  description: string
  alertType: 'info' | 'warning' | 'error'
} {
  switch (mode) {
    case 'complete':
      return {
        label: 'Kompletní smlouva',
        description: 'Všechna potřebná pole byla vyplněna. Smlouva je vygenerována bez mezer.',
        alertType: 'info',
      }
    case 'draft':
      return {
        label: 'Pracovní návrh',
        description: 'Povinná pole jsou vyplněna. Volitelné údaje chybí — v textu hledejte [DOPLNIT].',
        alertType: 'warning',
      }
    case 'review-needed':
      return {
        label: 'Vyžaduje kontrolu',
        description: 'Povinná pole chybí. V textu hledejte ⚠️ ZKONTROLOVAT a doplňte chybějící údaje.',
        alertType: 'error',
      }
  }
}

function badgeClass(mode: GenerationMode): string {
  switch (mode) {
    case 'complete': return 'complete'
    case 'draft': return 'draft'
    case 'review-needed': return 'review'
  }
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('cs-CZ', {
    day: 'numeric', month: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function CopyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1, opacity: 0.6 }} aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function DocxIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <polyline points="9 15 12 12 15 15" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ animation: 'spin 1s linear infinite' }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}
