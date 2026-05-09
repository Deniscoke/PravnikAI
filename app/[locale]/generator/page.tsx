'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { getSchemasByCategory, getSchema } from '@/lib/contracts/contractSchemas'
import { DynamicContractForm } from '@/components/contract/DynamicContractForm'
import type { GenerationHandle } from '@/components/contract/DynamicContractForm'
import { ContractResult } from '@/components/contract/ContractResult'
import type { GenerateContractResponse } from '@/lib/contracts/types'

// ── Category display config ─────────────────────────────────────────────────

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode }> = {
  'občanské': {
    label: 'Občanské právo',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  },
  'obchodní': {
    label: 'Obchodní právo',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  },
  'pracovní': {
    label: 'Pracovní právo',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  'nemovitosti': {
    label: 'Nemovitosti',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  },
}

// ── Schema icon mapping by schemaId ─────────────────────────────────────────

function getSchemaIcon(schemaId: string): React.ReactNode {
  const icons: Record<string, React.ReactNode> = {
    'kupni-smlouva-v1': <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
    'nda-smlouva-v1': <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    'pracovni-smlouva-v1': <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    'najemni-smlouva-byt-v1': <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    'smlouva-o-dilo-v1': <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  }
  return icons[schemaId] ?? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
}

// ── Page state ──────────────────────────────────────────────────────────────

type PageState = 'selecting' | 'filling' | 'generating' | 'result' | 'error'

// ── Loading step labels ─────────────────────────────────────────────────────

const GENERATION_STEPS = [
  'Validuji zadaná data…',
  'Připravuji právní kontext…',
  'Generuji text smlouvy…',
  'Kontroluji právní ustanovení…',
  'Dokončuji dokument…',
]

// ── Page ────────────────────────────────────────────────────────────────────

export default function GeneratorPage() {
  const [pageState, setPageState] = useState<PageState>('selecting')
  const [selectedSchemaId, setSelectedSchemaId] = useState<string | null>(null)
  const [result, setResult] = useState<GenerateContractResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [generationStep, setGenerationStep] = useState(0)

  // ── Async safety: AbortController + request identity ─────────────────────
  // AbortController cancels the in-flight fetch when the user navigates away.
  // requestId is a monotonic counter that guards against the TOCTOU gap where
  // a response arrives in the instant between user action and abort propagation.
  const abortControllerRef = useRef<AbortController | null>(null)
  const activeRequestIdRef = useRef(0)
  // Mirror pageState in a ref so callbacks can read current value without stale closures
  const pageStateRef = useRef<PageState>(pageState)
  pageStateRef.current = pageState

  /** Abort any in-flight generation request */
  const cancelGeneration = useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
  }, [])

  // Cleanup on unmount — cancel any in-flight request
  useEffect(() => {
    return () => { cancelGeneration() }
  }, [cancelGeneration])

  // Animate generation steps
  useEffect(() => {
    if (pageState !== 'generating') return
    setGenerationStep(0)
    const interval = setInterval(() => {
      setGenerationStep((s) => (s < GENERATION_STEPS.length - 1 ? s + 1 : s))
    }, 3000)
    return () => clearInterval(interval)
  }, [pageState])

  const schemasByCategory = getSchemasByCategory()
  const selectedSchema = selectedSchemaId ? getSchema(selectedSchemaId) : null

  function handleSelect(schemaId: string) {
    cancelGeneration()
    setSelectedSchemaId(schemaId)
    setPageState('filling')
    setResult(null)
    setErrorMessage(null)
  }

  function handleGenerating(): GenerationHandle {
    // Cancel any previous in-flight request (retry-while-pending protection)
    cancelGeneration()
    const controller = new AbortController()
    abortControllerRef.current = controller
    const requestId = ++activeRequestIdRef.current
    setPageState('generating')
    // Sync the ref immediately so callbacks running in the same tick
    // (e.g. instant mock fetch in tests) see the correct state
    pageStateRef.current = 'generating'
    return { signal: controller.signal, requestId }
  }

  function handleSuccess(res: GenerateContractResponse, requestId?: number) {
    // Stale response guard: reject if page left generating OR if requestId doesn't match
    if (pageStateRef.current !== 'generating') return
    if (requestId !== undefined && requestId !== activeRequestIdRef.current) return
    abortControllerRef.current = null
    setResult(res)
    setPageState('result')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleError(msg: string, requestId?: number) {
    // Stale response guard: ignore errors for cancelled/abandoned requests
    if (pageStateRef.current !== 'generating') return
    if (requestId !== undefined && requestId !== activeRequestIdRef.current) return
    abortControllerRef.current = null
    setErrorMessage(msg)
    setPageState('error')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function reset() {
    cancelGeneration()
    setPageState('selecting')
    setSelectedSchemaId(null)
    setResult(null)
    setErrorMessage(null)
  }

  function backToForm() {
    cancelGeneration()
    setPageState('filling')
    setResult(null)
    setErrorMessage(null)
  }

  return (
    <main style={{ position: 'relative', zIndex: 1, minHeight: '100dvh', padding: '0 var(--space-md)' }}>
      {/* ── Top bar ── */}
      <header style={{ maxWidth: 920, margin: '0 auto', padding: 'var(--space-xl) 0 var(--space-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', background: 'linear-gradient(135deg, var(--accent-aqua), var(--accent-violet))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1.2 }}>
              PrávníkAI
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)', marginTop: 2 }}>
              Generátor smluv · České právo
            </p>
          </div>

          {pageState !== 'selecting' && (
            <nav style={{ display: 'flex', gap: 'var(--space-xs)', alignItems: 'center' }}>
              <Breadcrumb
                steps={[
                  { label: 'Typ smlouvy', active: false, onClick: reset },
                  {
                    label: selectedSchema?.metadata.name ?? '',
                    active: pageState === 'filling' || pageState === 'generating' || pageState === 'error',
                    onClick: pageState === 'result' ? backToForm : undefined,
                  },
                  ...(pageState === 'generating' ? [{ label: 'Generování…', active: true }] : []),
                  ...(pageState === 'result' ? [{ label: 'Výsledek', active: true }] : []),
                ]}
              />
            </nav>
          )}
        </div>

        {/* Legal basis notice */}
        <div className="alert alert--info" style={{ marginTop: 'var(--space-md)', display: 'flex', gap: 'var(--space-sm)', alignItems: 'flex-start' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>
            Systém generuje smlouvy výhradně dle <strong>českého práva</strong> (NOZ č. 89/2012 Sb., ZP č. 262/2006 Sb., ZOK č. 90/2012 Sb.).
            Vygenerované dokumenty slouží jako návrh — vždy nechte finální verzi zkontrolovat advokátem.
          </span>
        </div>
      </header>

      {/* ── Content ── */}
      <div style={{ maxWidth: 920, margin: '0 auto', paddingBottom: 'var(--space-3xl)' }}>

        {/* STATE: selecting — dynamic catalog from schema registry */}
        {pageState === 'selecting' && (
          <section aria-labelledby="heading-select">
            <h2 id="heading-select" style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--space-lg)', color: 'var(--color-text-muted)' }}>
              Vyberte typ smlouvy
            </h2>

            {Object.entries(schemasByCategory).map(([category, schemas]) => {
              const catMeta = CATEGORY_META[category]
              return (
                <div key={category} style={{ marginBottom: 'var(--space-xl)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', marginBottom: 'var(--space-md)' }}>
                    <span style={{ color: 'var(--accent-violet)', display: 'flex' }}>{catMeta?.icon}</span>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      {catMeta?.label ?? category}
                    </h3>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-subtle)', background: 'var(--color-surface)', padding: '1px 8px', borderRadius: 'var(--radius-full)', border: '1px solid var(--glass-border)' }}>
                      {schemas.length}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-md)' }}>
                    {schemas.map((schema) => (
                      <button
                        key={schema.metadata.schemaId}
                        onClick={() => handleSelect(schema.metadata.schemaId)}
                        className="glass-card contract-type-card"
                        style={{ padding: 'var(--space-xl)', textAlign: 'left', cursor: 'pointer', border: '1px solid var(--glass-border)', background: 'var(--color-surface)', color: 'var(--color-text)', transition: 'all 150ms ease', width: '100%' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                          <span style={{ color: 'var(--accent-aqua)' }}>{getSchemaIcon(schema.metadata.schemaId)}</span>
                        </div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 'var(--space-2xs)' }}>
                          {schema.metadata.name}
                        </h4>
                        <p style={{ fontSize: '0.83rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-sm)', lineHeight: 1.5 }}>
                          {schema.metadata.description}
                        </p>
                        <span style={{ fontSize: '0.7rem', color: 'var(--accent-aqua)', fontFamily: 'monospace', opacity: 0.8 }}>
                          {schema.metadata.legalBasis.join(' · ')}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}

            {/* Trust markers */}
            <div className="trust-bar" style={{ display: 'flex', gap: 'var(--space-lg)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--space-2xl)', paddingTop: 'var(--space-lg)', borderTop: '1px solid var(--glass-border-subtle)' }}>
              <TrustMarker icon={<ShieldIcon />} text="Server-side zpracování" />
              <TrustMarker icon={<LockIcon />} text="API klíč nikdy na klientu" />
              <TrustMarker icon={<ScaleIcon />} text="Výhradně české právo" />
              <TrustMarker icon={<CheckCircleIcon />} text="3-vrstvová validace" />
            </div>
          </section>
        )}

        {/* STATE: filling — kept mounted (hidden) during generating/error to preserve form data */}
        {selectedSchemaId && (
          <section
            aria-labelledby="heading-form"
            style={{ display: (pageState === 'filling' || pageState === 'generating' || pageState === 'error') ? undefined : 'none' }}
          >
            <div style={{
              display: pageState === 'filling' ? 'flex' : 'none',
              alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)',
            }}>
              <h2 id="heading-form" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                {selectedSchema?.metadata.name}
              </h2>
              <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: 'var(--accent-aqua)', opacity: 0.7 }}>
                {selectedSchema?.metadata.legalBasis.join(' · ')}
              </span>
            </div>
            <div style={{ display: pageState === 'filling' ? undefined : 'none' }}>
              <DynamicContractForm
                schemaId={selectedSchemaId}
                onSuccess={handleSuccess}
                onError={handleError}
                onGenerating={handleGenerating}
              />
            </div>
          </section>
        )}

        {/* STATE: generating — animated loading skeleton */}
        {pageState === 'generating' && (
          <section aria-live="polite" aria-busy="true">
            <div className="glass-card" style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
              {/* Animated spinner */}
              <div style={{ marginBottom: 'var(--space-xl)' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-aqua)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ animation: 'spin 1.5s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              </div>

              <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
                Generuji {selectedSchema?.metadata.name?.toLowerCase()}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-xl)' }}>
                AI analyzuje právní kontext a připravuje text smlouvy dle českého práva.
              </p>

              {/* Step progress */}
              <div style={{ maxWidth: 360, margin: '0 auto', textAlign: 'left' }}>
                {GENERATION_STEPS.map((step, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-sm)',
                      padding: '8px 0',
                      opacity: i <= generationStep ? 1 : 0.3,
                      transition: 'opacity 0.4s ease',
                    }}
                  >
                    {i < generationStep ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-aqua)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : i === generationStep ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-aqua)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    ) : (
                      <div style={{ width: 16, height: 16, borderRadius: '50%', border: '1.5px solid var(--glass-border)' }} />
                    )}
                    <span style={{ fontSize: '0.82rem', color: i <= generationStep ? 'var(--color-text)' : 'var(--color-text-subtle)' }}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>

              {/* Skeleton preview */}
              <div style={{ marginTop: 'var(--space-xl)', opacity: 0.5 }}>
                <div className="skeleton-line skeleton-line--title" />
                <div className="skeleton-line" />
                <div className="skeleton-line" />
                <div className="skeleton-line skeleton-line--short" />
              </div>
            </div>
          </section>
        )}

        {/* STATE: error */}
        {pageState === 'error' && (
          <section>
            <div className="alert alert--error" style={{ marginBottom: 'var(--space-lg)' }}>
              <strong>Chyba při generování:</strong> {errorMessage}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
              <button className="glass-btn glass-btn--primary" onClick={backToForm}>
                Zkusit znovu
              </button>
              <button className="glass-btn glass-btn--ghost" onClick={reset}>
                Změnit typ smlouvy
              </button>
            </div>
          </section>
        )}

        {/* STATE: result */}
        {pageState === 'result' && result && (
          <ContractResult
            result={result}
            contractName={selectedSchema?.metadata.name ?? 'Smlouva'}
            onBack={backToForm}
            onReset={reset}
          />
        )}
      </div>
    </main>
  )
}

// ── Breadcrumb ────────────────────────────────────────────────────────────────

function Breadcrumb({ steps }: { steps: { label: string; active: boolean; onClick?: () => void }[] }) {
  return (
    <ol style={{ display: 'flex', alignItems: 'center', gap: 6, listStyle: 'none', fontSize: '0.8rem' }}>
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          {i > 0 && <li style={{ color: 'var(--color-text-subtle)' }} aria-hidden="true">›</li>}
          <li>
            {step.onClick ? (
              <button onClick={step.onClick} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-aqua)', fontSize: '0.8rem', padding: 0 }}>
                {step.label}
              </button>
            ) : (
              <span style={{ color: step.active ? 'var(--color-text)' : 'var(--color-text-subtle)' }}>
                {step.label}
              </span>
            )}
          </li>
        </React.Fragment>
      ))}
    </ol>
  )
}

// ── Trust marker ──────────────────────────────────────────────────────────────

function TrustMarker({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', fontSize: '0.78rem', color: 'var(--color-text-subtle)' }}>
      <span style={{ color: 'var(--accent-aqua)', display: 'flex', opacity: 0.7 }}>{icon}</span>
      {text}
    </div>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function ShieldIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
}

function LockIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
}

function ScaleIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H2v15h7c1.7 0 3 1.3 3 3V7c0-2.2-1.8-4-4-4z"/><path d="M16 3h6v15h-7c-1.7 0-3 1.3-3 3V7c0-2.2 1.8-4 4-4z"/></svg>
}

function CheckCircleIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
}
