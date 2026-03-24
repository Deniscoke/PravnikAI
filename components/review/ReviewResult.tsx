'use client'

import React, { useState } from 'react'
import type { ReviewContractResponse, RiskLevel } from '@/lib/review/types'

interface ReviewResultProps {
  result: ReviewContractResponse
  onNewReview: string | (() => void)
}

export function ReviewResult({ result, onNewReview }: ReviewResultProps) {
  const [copied, setCopied] = useState(false)
  const risk = riskMeta(result.overallRisk)

  async function copyToClipboard() {
    try {
      const text = formatReviewAsText(result)
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('Kopírování se nezdařilo. Zkuste to znovu nebo text vyberte ručně.')
    }
  }

  return (
    <section aria-labelledby="review-heading">

      {/* ── Trust banner ── */}
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
          AI-asistovaná kontrola · Neslouží jako právní poradenství · Konzultujte advokáta
        </span>
        <span style={{ marginLeft: 'auto', fontFamily: 'monospace', fontSize: '0.68rem', opacity: 0.7 }}>
          review-v1
        </span>
      </div>

      {/* ── Risk banner ── */}
      <div className={`alert alert--${risk.alertType}`} style={{
        marginBottom: 'var(--space-lg)',
        display: 'flex', gap: 'var(--space-md)', alignItems: 'center',
      }}>
        <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{risk.emoji}</span>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 4 }}>
            <h2 id="review-heading" style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>
              {risk.label}
            </h2>
            <span className={`badge badge--${badgeClass(result.overallRisk)}`}>
              {result.overallRisk.toUpperCase()}
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', margin: 0, opacity: 0.9 }}>
            {result.summary}
          </p>
        </div>
      </div>

      {/* ── Detected contract type + assumptions ── */}
      {(result.detectedContractType || result.assumptions?.length) && (
        <div className="glass-card" style={{ padding: 'var(--space-md) var(--space-lg)', marginBottom: 'var(--space-md)' }}>
          {result.detectedContractType && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: result.assumptions?.length ? 'var(--space-sm)' : 0 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Rozpoznaný typ:
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                {result.detectedContractType}
              </span>
            </div>
          )}
          {result.assumptions && result.assumptions.length > 0 && (
            <details style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              <summary style={{ cursor: 'pointer', userSelect: 'none' }}>
                AI předpoklady ({result.assumptions.length})
              </summary>
              <ul style={{ marginTop: 'var(--space-xs)', paddingLeft: 'var(--space-lg)' }}>
                {result.assumptions.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </details>
          )}
        </div>
      )}

      {/* ── Risky clauses ── */}
      {result.riskyClauses.length > 0 && (
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 'var(--space-md)' }}>
            <WarningIcon /> Rizikové klauzule ({result.riskyClauses.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {result.riskyClauses.map((clause, i) => {
              const meta = riskMeta(clause.severity)
              return (
                <div key={i} className="glass-card" style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-xs)' }}>
                    <span className={`badge badge--${badgeClass(clause.severity)}`} style={{ fontSize: '0.65rem' }}>
                      {meta.shortLabel}
                    </span>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 600, margin: 0 }}>
                      {clause.title}
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.83rem', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: '0 0 var(--space-xs)' }}>
                    {clause.explanation}
                  </p>
                  {clause.suggestedRevision && (
                    <div style={{
                      background: 'rgba(94,231,223,0.05)',
                      border: '1px solid rgba(94,231,223,0.15)',
                      borderRadius: 'var(--radius-sm)',
                      padding: 'var(--space-sm) var(--space-md)',
                      fontSize: '0.8rem',
                      color: 'var(--accent-aqua)',
                    }}>
                      <strong>Navrhovaná úprava:</strong> {clause.suggestedRevision}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Missing clauses ── */}
      {result.missingClauses.length > 0 && (
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 'var(--space-md)' }}>
            <PlusIcon /> Chybějící klauzule ({result.missingClauses.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {result.missingClauses.map((clause, i) => (
              <div key={i} className="glass-card" style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 600, margin: '0 0 var(--space-xs)' }}>
                  {clause.title}
                </h4>
                <p style={{ fontSize: '0.83rem', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: '0 0 var(--space-xs)' }}>
                  {clause.reason}
                </p>
                {clause.suggestedClause && (
                  <div style={{
                    background: 'rgba(94,231,223,0.05)',
                    border: '1px solid rgba(94,231,223,0.15)',
                    borderRadius: 'var(--radius-sm)',
                    padding: 'var(--space-sm) var(--space-md)',
                    fontSize: '0.8rem',
                    color: 'var(--accent-aqua)',
                  }}>
                    <strong>Navrhovaná klauzule:</strong> {clause.suggestedClause}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Negotiation flags ── */}
      {result.negotiationFlags.length > 0 && (
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 'var(--space-md)' }}>
            <FlagIcon /> Vyjednávací body ({result.negotiationFlags.length})
          </h3>
          <div className="glass-card" style={{ padding: 'var(--space-md) var(--space-lg)' }}>
            <ul style={{ margin: 0, paddingLeft: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
              {result.negotiationFlags.map((flag, i) => (
                <li key={i} style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                  {flag}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── Legal basis ── */}
      {result.legalBasis && result.legalBasis.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)', marginBottom: 'var(--space-lg)' }}>
          {result.legalBasis.map((basis, i) => (
            <span key={i} style={{
              fontSize: '0.7rem', padding: '2px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(94,231,223,0.08)',
              border: '1px solid rgba(94,231,223,0.2)',
              color: 'var(--accent-aqua)', fontFamily: 'monospace',
            }}>
              {basis}
            </span>
          ))}
        </div>
      )}

      {/* ── Lawyer review recommendation ── */}
      {result.lawyerReviewRequired && (
        <div className="alert alert--warning" style={{
          marginBottom: 'var(--space-lg)',
          display: 'flex', gap: 'var(--space-sm)', alignItems: 'flex-start',
        }}>
          <ScaleIcon />
          <div>
            <strong>Doporučení:</strong> Před podpisem nechte tuto smlouvu zkontrolovat advokátem.
            AI analýza identifikovala body, které vyžadují odborné právní posouzení.
          </div>
        </div>
      )}

      {/* ── Actions ── */}
      <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', marginTop: 'var(--space-xl)', flexWrap: 'wrap' }}>
        <button className="glass-btn glass-btn--primary" onClick={copyToClipboard}>
          {copied ? <><CheckIcon /> Zkopírováno</> : <><CopyIcon /> Kopírovat analýzu</>}
        </button>
        {typeof onNewReview === 'string' ? (
          <a href={onNewReview} className="glass-btn glass-btn--ghost" style={{ textDecoration: 'none' }}>
            Nová kontrola
          </a>
        ) : (
          <button className="glass-btn glass-btn--ghost" onClick={onNewReview}>
            Nová kontrola
          </button>
        )}
      </div>

      {/* ── Disclaimer ── */}
      <div className="glass-card" style={{
        marginTop: 'var(--space-xl)',
        padding: 'var(--space-md) var(--space-lg)',
        display: 'flex', gap: 'var(--space-sm)', alignItems: 'flex-start',
        borderColor: 'var(--glass-border-subtle)',
      }}>
        <ShieldIcon />
        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-subtle)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--color-text-muted)' }}>Právní upozornění</strong>
          <br />
          {result.disclaimer}
          <br />
          <span style={{ fontFamily: 'monospace', opacity: 0.6 }}>
            Mód: {result.reviewMode} · Riziko: {result.overallRisk} · {formatDateTime(result.reviewedAt)}
          </span>
        </div>
      </div>
    </section>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function riskMeta(level: RiskLevel): { label: string; shortLabel: string; alertType: string; emoji: string } {
  switch (level) {
    case 'low':
      return { label: 'Nízké riziko', shortLabel: 'Nízké', alertType: 'info', emoji: '✅' }
    case 'medium':
      return { label: 'Střední riziko', shortLabel: 'Střední', alertType: 'warning', emoji: '⚠️' }
    case 'high':
      return { label: 'Vysoké riziko', shortLabel: 'Vysoké', alertType: 'error', emoji: '🔴' }
  }
}

function badgeClass(level: RiskLevel): string {
  switch (level) {
    case 'low': return 'complete'
    case 'medium': return 'draft'
    case 'high': return 'review'
  }
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('cs-CZ', {
    day: 'numeric', month: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatReviewAsText(result: ReviewContractResponse): string {
  const lines: string[] = [
    `KONTROLA SMLOUVY — PrávníkAI`,
    `Celkové riziko: ${result.overallRisk.toUpperCase()}`,
    ``,
    `SHRNUTÍ`,
    result.summary,
    ``,
  ]

  if (result.riskyClauses.length > 0) {
    lines.push(`RIZIKOVÉ KLAUZULE`)
    result.riskyClauses.forEach((c, i) => {
      lines.push(`${i + 1}. [${c.severity.toUpperCase()}] ${c.title}`)
      lines.push(`   ${c.explanation}`)
      if (c.suggestedRevision) lines.push(`   → Navrhovaná úprava: ${c.suggestedRevision}`)
    })
    lines.push(``)
  }

  if (result.missingClauses.length > 0) {
    lines.push(`CHYBĚJÍCÍ KLAUZULE`)
    result.missingClauses.forEach((c, i) => {
      lines.push(`${i + 1}. ${c.title}`)
      lines.push(`   ${c.reason}`)
      if (c.suggestedClause) lines.push(`   → Navrhovaná klauzule: ${c.suggestedClause}`)
    })
    lines.push(``)
  }

  if (result.negotiationFlags.length > 0) {
    lines.push(`VYJEDNÁVACÍ BODY`)
    result.negotiationFlags.forEach((f, i) => lines.push(`${i + 1}. ${f}`))
    lines.push(``)
  }

  lines.push(`---`)
  lines.push(result.disclaimer)

  return lines.join('\n')
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ShieldIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1, opacity: 0.6 }} aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
}

function WarningIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
}

function PlusIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
}

function FlagIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} aria-hidden="true"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
}

function ScaleIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true"><path d="M8 3H2v15h7c1.7 0 3 1.3 3 3V7c0-2.2-1.8-4-4-4z"/><path d="M16 3h6v15h-7c-1.7 0-3 1.3-3 3V7c0-2.2 1.8-4 4-4z"/></svg>
}

function CopyIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
}

function CheckIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
}
