'use client'

/**
 * DynamicContractForm
 *
 * Renders a contract form entirely from a ContractSchema.
 * No hard-coded fields — add a new schema and this component renders it automatically.
 *
 * Usage:
 *   <DynamicContractForm schemaId="kupni-smlouva-v1" onSuccess={(result) => ...} />
 */

import React, { useState, useCallback } from 'react'
import { getSchema } from '@/lib/contracts/contractSchemas'
import { validateUI } from '@/lib/contracts/validators'
import type {
  ContractSchema,
  ContractField,
  ContractParty,
  ContractSection,
  NormalizedFormData,
  NormalizedPartyData,
  PartyFieldId,
  GenerateContractResponse,
  ValidationIssue,
} from '@/lib/contracts/types'

// ─── Props ────────────────────────────────────────────────────────────────────

/** Returned by onGenerating to tie the request to a cancellation scope. */
export interface GenerationHandle {
  signal: AbortSignal
  requestId: number
}

interface DynamicContractFormProps {
  schemaId: string
  onSuccess?: (result: GenerateContractResponse, requestId?: number) => void
  onError?: (error: string, requestId?: number) => void
  /**
   * Called immediately before the API request.
   * Returns an AbortSignal + requestId to enable cancellation and
   * stale-response protection from the parent.
   */
  onGenerating?: () => GenerationHandle | void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DynamicContractForm({ schemaId, onSuccess, onError, onGenerating }: DynamicContractFormProps) {
  const schema = getSchema(schemaId)

  // Form state: parties + sections as flat records
  const [partyData, setPartyData] = useState<Record<string, Record<string, string>>>(
    Object.fromEntries(schema.parties.map((p) => [p.id, {}])),
  )
  const [sectionData, setSectionData] = useState<Record<string, Record<string, string>>>(
    Object.fromEntries(schema.sections.map((s) => [s.id, {}])),
  )
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [errorSummary, setErrorSummary] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = React.useRef<HTMLFormElement>(null)

  // ── Field change handlers ────────────────────────────────────────────────

  const handlePartyFieldChange = useCallback(
    (partyId: string, fieldId: string, value: string) => {
      setPartyData((prev) => ({
        ...prev,
        [partyId]: { ...prev[partyId], [fieldId]: value },
      }))
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[`${partyId}.${fieldId}`]
        if (Object.keys(next).length === 0) setErrorSummary(null)
        return next
      })
    },
    [],
  )

  const handleSectionFieldChange = useCallback(
    (sectionId: string, fieldId: string, value: string) => {
      setSectionData((prev) => ({
        ...prev,
        [sectionId]: { ...prev[sectionId], [fieldId]: value },
      }))
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[`${sectionId}.${fieldId}`]
        if (Object.keys(next).length === 0) setErrorSummary(null)
        return next
      })
    },
    [],
  )

  // ── Conditional visibility ───────────────────────────────────────────────

  const isSectionVisible = (section: ContractSection): boolean => {
    if (!section.conditional) return true
    const { fieldId, value } = section.conditional
    const [sId, fId] = fieldId.includes('.') ? fieldId.split('.') : [null, fieldId]
    const controlValue = sId ? sectionData[sId]?.[fId] : findValueAnywhere(fieldId)
    return controlValue === value
  }

  const isFieldVisible = (sectionId: string, field: ContractField): boolean => {
    if (!field.conditional) return true
    const { fieldId, value } = field.conditional
    const controlValue = sectionData[sectionId]?.[fieldId] ?? ''
    return controlValue === String(value)
  }

  const findValueAnywhere = (fieldId: string): string => {
    for (const values of Object.values(sectionData)) {
      if (fieldId in values) return values[fieldId]
    }
    return ''
  }

  // ── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Guard: prevent double-submit (Enter key bypasses disabled button)
    if (isSubmitting) return

    const normalized = buildNormalizedData(schema, partyData, sectionData)

    // Client-side Layer 1 validation
    const uiResult = validateUI(schema, normalized)
    if (!uiResult.valid) {
      const errorMap: Record<string, string> = {}
      for (const issue of uiResult.issues) {
        if (issue.severity === 'error') {
          errorMap[issue.fieldId] = issue.message
        }
      }
      const errorCount = Object.keys(errorMap).length
      setFieldErrors(errorMap)
      setErrorSummary(`Formulář obsahuje ${errorCount} ${errorCount === 1 ? 'chybu' : errorCount < 5 ? 'chyby' : 'chyb'} — opravte označená pole a zkuste to znovu.`)
      // Scroll to top of form so user sees the summary banner
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    setErrorSummary(null)

    setIsSubmitting(true)
    // Parent returns a GenerationHandle with signal + requestId for async safety
    const handle = onGenerating?.()
    const signal = handle?.signal
    const requestId = handle?.requestId
    try {
      const res = await fetch('/api/generate-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schemaId, formData: normalized }),
        signal,
      })

      const data = await res.json()

      if (!res.ok) {
        onError?.(data.error ?? 'Chyba při generování smlouvy.', requestId)
        return
      }

      onSuccess?.(data as GenerateContractResponse, requestId)
    } catch (err) {
      // Silently ignore aborted requests — the user navigated away intentionally
      if (err instanceof DOMException && err.name === 'AbortError') return
      onError?.('Síťová chyba. Zkuste to prosím znovu.', requestId)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="contract-form" noValidate>
      {/* Error summary banner */}
      {errorSummary && (
        <div className="alert alert--error" role="alert" aria-live="polite" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>{errorSummary}</span>
        </div>
      )}

      {/* Parties */}
      <div className="glass-card form-section">
        <h3 className="form-section__title">
          <span className="form-section__step">1</span>
          Smluvní strany
        </h3>
        {schema.parties.map((party) => (
          <PartyBlock
            key={party.id}
            party={party}
            values={partyData[party.id] ?? {}}
            errors={fieldErrors}
            onChange={handlePartyFieldChange}
          />
        ))}
      </div>

      {/* Sections */}
      {schema.sections.map((section, idx) => {
        if (!isSectionVisible(section)) return null
        return (
          <div key={section.id} className="glass-card form-section">
            <h3 className="form-section__title">
              <span className="form-section__step">{idx + 2}</span>
              {section.title}
            </h3>
            <div className="form-grid">
              {section.fields.map((field) => {
                if (!isFieldVisible(section.id, field)) return null
                const fieldKey = `${section.id}.${field.id}`
                return (
                  <FormField
                    key={field.id}
                    field={field}
                    value={sectionData[section.id]?.[field.id] ?? ''}
                    error={fieldErrors[fieldKey]}
                    onChange={(value) => handleSectionFieldChange(section.id, field.id, value)}
                  />
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Submit */}
      <div className="form-actions">
        <button
          type="submit"
          className="glass-btn glass-btn--primary form-submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <SpinnerIcon />
              Generuji smlouvu…
            </>
          ) : (
            <>
              <DocumentIcon />
              Vygenerovat smlouvu
            </>
          )}
        </button>
        <button type="reset" className="glass-btn glass-btn--ghost">
          Vymazat formulář
        </button>
      </div>
    </form>
  )
}

// ─── Party Block ──────────────────────────────────────────────────────────────

function PartyBlock({
  party,
  values,
  errors,
  onChange,
}: {
  party: ContractParty
  values: Record<string, string>
  errors: Record<string, string>
  onChange: (partyId: string, fieldId: string, value: string) => void
}) {
  return (
    <div className="party-block">
      <p className="party-block__label">{party.label}</p>
      <div className="form-grid">
        {[...party.requiredFields, ...party.optionalFields].map((field) => (
          <div
            key={field.id}
            className={`glass-input-wrap ${isWideField(field.id) ? 'form-field--full' : ''}`}
          >
            <label className="glass-input-label" htmlFor={`${party.id}-${field.id}`}>
              {field.label}
              {field.required && <span className="required-mark" aria-hidden="true"> *</span>}
            </label>
            <input
              id={`${party.id}-${field.id}`}
              className="glass-input"
              type={field.id === 'email' ? 'email' : field.id === 'phone' ? 'tel' : 'text'}
              value={values[field.id] ?? ''}
              onChange={(e) => onChange(party.id, field.id, e.target.value)}
              placeholder={field.id === 'address' ? 'Ulice, č.p., město, PSČ' : undefined}
              required={field.required}
              aria-describedby={field.legalNote ? `${party.id}-${field.id}-note` : undefined}
            />
            {field.legalNote && (
              <span id={`${party.id}-${field.id}-note`} className="glass-input-helper">
                {field.legalNote}
              </span>
            )}
            {errors[`${party.id}.${field.id}`] && (
              <span className="glass-input-helper" style={{ color: 'var(--accent-rose)' }} role="alert">
                {errors[`${party.id}.${field.id}`]}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Form Field ───────────────────────────────────────────────────────────────

function FormField({
  field,
  value,
  error,
  onChange,
}: {
  field: ContractField
  value: string
  error?: string
  onChange: (value: string) => void
}) {
  const isFullWidth = field.type === 'textarea' || field.id.includes('Description') || field.id.includes('Notes')
  const fieldId = `field-${field.id}`

  return (
    <div className={`glass-input-wrap ${isFullWidth ? 'form-field--full' : ''}`}>
      <label className="glass-input-label" htmlFor={fieldId}>
        {field.label}
        {field.required && <span className="required-mark" aria-hidden="true"> *</span>}
      </label>

      {field.type === 'select' && field.options ? (
        <select
          id={fieldId}
          className="glass-input glass-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
        >
          <option value="">— Vyberte —</option>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : field.type === 'textarea' ? (
        <textarea
          id={fieldId}
          className="glass-input glass-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          minLength={field.validation?.minLength}
          maxLength={field.validation?.maxLength}
          rows={4}
        />
      ) : field.type === 'checkbox' ? (
        <input
          id={fieldId}
          type="checkbox"
          className="glass-input"
          checked={value === 'true'}
          onChange={(e) => onChange(String(e.target.checked))}
        />
      ) : (
        <input
          id={fieldId}
          className="glass-input"
          type={field.type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          min={field.validation?.min}
          max={field.validation?.max}
        />
      )}

      {field.legalNote && (
        <span className="glass-input-helper">{field.legalNote}</span>
      )}
      {error && (
        <span className="glass-input-helper" style={{ color: 'var(--accent-rose)' }} role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function buildNormalizedData(
  schema: ContractSchema,
  partyData: Record<string, Record<string, string>>,
  sectionData: Record<string, Record<string, string>>,
): NormalizedFormData {
  const parties: NormalizedPartyData[] = schema.parties.map((party) => ({
    partyId: party.id,
    fields: partyData[party.id] as Record<PartyFieldId, string>,
  }))

  return {
    schemaId: schema.metadata.schemaId,
    parties,
    sections: sectionData,
  }
}

function isWideField(fieldId: string): boolean {
  return ['address', 'representative'].includes(fieldId)
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function DocumentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ animation: 'spin 1s linear infinite' }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}
