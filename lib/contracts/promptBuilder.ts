/**
 * Production-Grade Prompt Builder — multi-jurisdiction (CZ / DE / UK)
 *
 * Architecture
 * ────────────
 * buildPrompt() is the single public entry point.
 * It assembles { systemPrompt, userPrompt } from sections A–G in the language
 * dictated by the schema's `jurisdiction` field. All locale-specific copy lives
 * in lib/contracts/prompts/{cz,de,uk}.ts and is selected per-call.
 *
 *   A) Contract context  — type, legal basis, party roles
 *   B) Filled data       — all provided values, grouped, formatted, with legal notes
 *   C) Missing data      — required vs. optional gaps with placeholder examples
 *   D) Instructions      — mode-aware generation rules + inviolable safety rules
 *   E) Output structure  — required document sections, formatting rules
 *   F) Quality self-check — internal QA before delivery
 *   G) Drafting posture  — optional; represented party, risk, negotiation context
 *
 * Safety guarantee
 * ────────────────
 * Section D explicitly prohibits the model from inventing any concrete datum
 * (names, addresses, IDs, dates, account numbers, parcel references) not
 * present in section B. Missing data must use the per-jurisdiction placeholder.
 *
 * Provider-agnostic
 * ─────────────────
 * This file imports only from ./systemPrompt, ./prompts and ./types — zero LLM SDK coupling.
 */

import { buildSystemPrompt as assembleSystemPrompt } from './systemPrompt'
import { getPromptBundle, type PromptLang } from './prompts'
import type {
  ContractSchema,
  NormalizedFormData,
  GenerationMode,
  ContractField,
  PartyField,
  SelectOption,
  DraftingPosture,
  Jurisdiction,
} from './types'

// ─── Public types ─────────────────────────────────────────────────────────────

export interface PromptInput {
  schema: ContractSchema
  data: NormalizedFormData
  mode: GenerationMode
  /**
   * Composite field IDs with no value, supplied by assessGenerationReadiness().
   * Format: "sectionId.fieldId" or "partyId.fieldId"
   */
  missingFields: string[]
  /** Drafting posture — controls clause selection and wording strategy. Optional. */
  posture?: DraftingPosture
}

export interface BuiltPrompt {
  systemPrompt: string
  userPrompt: string
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Assembles the complete { systemPrompt, userPrompt } pair for a contract
 * generation request. This is the only function route.ts needs to call.
 *
 * Deterministic: identical input always produces identical output.
 */
export function buildPrompt(input: PromptInput): BuiltPrompt {
  const { schema, data, mode, missingFields, posture } = input
  const jurisdiction = schema.metadata.jurisdiction
  const bundle = getPromptBundle(jurisdiction)
  const lang = bundle.promptLang
  const missingSet = new Set(missingFields)

  const userPromptParts = [
    lang.userPromptHeading,
    buildContextSection(schema, lang, jurisdiction),
    buildDataSection(schema, data, missingSet, lang, jurisdiction),
    buildMissingSection(schema, data, missingFields, lang, jurisdiction),
    buildInstructionSection(mode, lang),
    buildOutputStructureSection(schema, lang),
    buildQualityCheckSection(mode, lang),
  ]

  if (posture && hasPostureContent(posture)) {
    userPromptParts.push(buildPostureSection(posture, schema, lang))
  }

  return {
    systemPrompt: assembleSystemPrompt(schema.metadata.aiInstructions, jurisdiction),
    userPrompt: userPromptParts.join('\n\n---\n\n'),
  }
}

// ─── Section A: Contract context ─────────────────────────────────────────────

function buildContextSection(schema: ContractSchema, lang: PromptLang, jurisdiction: Jurisdiction): string {
  const { metadata, parties } = schema

  // Resolve a localized jurisdiction value if the schema is for a different one
  // than the prompt language defaults to (defensive — schemas should match).
  const jurisdictionValue =
    jurisdiction === metadata.jurisdiction
      ? lang.jurisdictionValue
      : `${metadata.jurisdiction}`

  const lines: string[] = [
    lang.contextHeading,
    '',
    `${lang.contractTypeLabel} ${metadata.name}`,
    `${lang.schemaIdLabel} \`${metadata.schemaId}\` (${lang.schemaVersionPrefix} ${metadata.version})`,
    `${lang.jurisdictionLabel} ${jurisdictionValue}`,
    '',
    lang.legalBasisLabel,
    ...metadata.legalBasis.map((basis) => `- ${basis}`),
    '',
    lang.partiesIntro,
    ...parties.map((p) => `- **${p.label}** — ${p.role}`),
  ]

  return lines.join('\n')
}

// ─── Section B: Filled data ───────────────────────────────────────────────────

function buildDataSection(
  schema: ContractSchema,
  data: NormalizedFormData,
  missingSet: Set<string>,
  lang: PromptLang,
  jurisdiction: Jurisdiction,
): string {
  const lines: string[] = [lang.dataHeading]

  // ── Parties ──────────────────────────────────────────────────────────────
  lines.push('', lang.partiesSubheading, '')

  for (const party of schema.parties) {
    const partyData = data.parties.find((p) => p.partyId === party.id)
    const allPartyFields: PartyField[] = [...party.requiredFields, ...party.optionalFields]
    const filledRows: string[] = []

    for (const field of allPartyFields) {
      const compositeId = `${party.id}.${field.id}`
      if (missingSet.has(compositeId)) continue

      const value = partyData?.fields[field.id]?.trim() ?? ''
      if (!value) continue

      const note = field.legalNote ? `\n  *(${field.legalNote})*` : ''
      filledRows.push(`- **${field.label}:** ${value}${note}`)
    }

    lines.push(`#### ${party.label}`)
    lines.push(`*${lang.partyRolePrefix} ${party.role}*`)

    if (filledRows.length > 0) {
      lines.push(...filledRows)
    } else {
      lines.push(lang.noPartyData)
    }

    lines.push('')
  }

  // ── Content sections ──────────────────────────────────────────────────────
  lines.push(lang.contentSubheading, '')

  let anySectionHadData = false

  for (const section of schema.sections) {
    if (section.conditional) {
      const { fieldId, value: requiredValue } = section.conditional
      const currentValue = resolveDataValue(data, fieldId)
      if (currentValue !== String(requiredValue)) continue
    }

    const sectionData = data.sections[section.id] ?? {}
    const filledRows: string[] = []

    for (const field of section.fields) {
      if (field.conditional) {
        const { fieldId, value: requiredValue } = field.conditional
        const currentValue = sectionData[fieldId] ?? ''
        if (currentValue !== String(requiredValue)) continue
      }

      const compositeId = `${section.id}.${field.id}`
      if (missingSet.has(compositeId)) continue

      const raw = (sectionData[field.id] ?? '').trim()
      if (!raw) continue

      const displayValue = formatFieldValue(field, raw, jurisdiction)
      const note = field.legalNote ? `\n  *(${field.legalNote})*` : ''
      filledRows.push(`- **${field.label}:** ${displayValue}${note}`)
    }

    if (filledRows.length > 0) {
      anySectionHadData = true
      lines.push(`#### ${section.title}`)
      lines.push(...filledRows)
      lines.push('')
    }
  }

  if (!anySectionHadData) {
    lines.push(lang.noContentData, '')
  }

  return lines.join('\n')
}

// ─── Section C: Missing data ──────────────────────────────────────────────────

function buildMissingSection(
  schema: ContractSchema,
  data: NormalizedFormData,
  missingFields: string[],
  lang: PromptLang,
  jurisdiction: Jurisdiction,
): string {
  const criticalMissing: string[] = []
  const supplementaryMissing: string[] = []
  const coveredIds = new Set<string>()

  for (const compositeId of missingFields) {
    coveredIds.add(compositeId)
    const def = resolveFieldDefinition(schema, compositeId)
    if (!def) continue

    const line = formatMissingLine(compositeId, def, lang, jurisdiction)
    if (def.required) {
      criticalMissing.push(line)
    } else {
      supplementaryMissing.push(line)
    }
  }

  for (const party of schema.parties) {
    const partyData = data.parties.find((p) => p.partyId === party.id)
    for (const field of party.optionalFields) {
      const compositeId = `${party.id}.${field.id}`
      if (coveredIds.has(compositeId)) continue
      const value = partyData?.fields[field.id]?.trim() ?? ''
      if (value) continue
      supplementaryMissing.push(
        formatMissingLine(
          compositeId,
          { label: field.label, required: false, legalNote: field.legalNote },
          lang,
          jurisdiction,
        ),
      )
    }
  }

  if (criticalMissing.length === 0 && supplementaryMissing.length === 0) {
    return [lang.missingHeading, '', lang.allFieldsFilled, lang.generateCompleteHint].join('\n')
  }

  const lines: string[] = [lang.missingHeading, '']

  if (criticalMissing.length > 0) {
    lines.push(lang.criticalMissingHeading, lang.criticalMissingDesc, '', ...criticalMissing, '')
  }

  if (supplementaryMissing.length > 0) {
    lines.push(lang.optionalMissingHeading, lang.optionalMissingDesc, '', ...supplementaryMissing, '')
  }

  return lines.join('\n')
}

function formatMissingLine(
  compositeId: string,
  def: FieldDefinition,
  lang: PromptLang,
  jurisdiction: Jurisdiction,
): string {
  const legalNote = def.legalNote ? ` *(${def.legalNote})*` : ''
  const placeholderToken = getPromptBundle(jurisdiction).placeholders.fillToken
  return (
    `- \`${compositeId}\` → **${def.label}**${legalNote}\n` +
    `  ${lang.placeholderLabel} \`${placeholderToken}: ${def.label}]\``
  )
}

// ─── Section D: Generation instructions ──────────────────────────────────────

function buildInstructionSection(mode: GenerationMode, lang: PromptLang): string {
  return [
    lang.instructionsHeading,
    '',
    buildModeBlock(mode, lang),
    '',
    lang.safetyRulesBlock,
  ].join('\n')
}

function buildModeBlock(mode: GenerationMode, lang: PromptLang): string {
  switch (mode) {
    case 'complete': return lang.modeCompleteBlock
    case 'draft':    return lang.modeDraftBlock
    case 'review-needed': return lang.modeReviewBlock
  }
}

// ─── Section E: Output structure ─────────────────────────────────────────────

function buildOutputStructureSection(schema: ContractSchema, lang: PromptLang): string {
  const { outputStructure, name } = schema.metadata

  const documentSections = outputStructure.sections.map(
    (sectionTitle, index) => `${index + 1}. ${sectionTitle}`,
  )

  const signatureBlocks = schema.parties.map(
    (party, index) =>
      `${outputStructure.sections.length + index + 1}. ${lang.signatureBlockSuffix} — ${party.label}`,
  )

  const lines: string[] = [
    lang.outputHeading,
    '',
    lang.outputIntro.replace('{name}', name),
    '',
    ...documentSections,
    ...signatureBlocks,
    '',
    lang.formattingHeading,
    ...lang.formattingRules.map((r) => `- ${r}`),
  ]

  if (outputStructure.defaultJurisdictionClause) {
    lines.push(`- ${lang.jurisdictionClauseLabel} ${outputStructure.defaultJurisdictionClause}`)
  }

  if (outputStructure.requiresSignature) {
    lines.push(`- ${lang.signatureRequiredLine}`)
  }

  return lines.join('\n')
}

// ─── Section F: Quality self-check ──────────────────────────────────────────

function buildQualityCheckSection(mode: GenerationMode, lang: PromptLang): string {
  return [
    lang.qualityCheckHeading,
    '',
    lang.qualityCheckIntro,
    '',
    ...lang.qualityCheckBullets,
    ...(mode === 'complete' ? [lang.qualityCheckBulletComplete] : []),
  ].join('\n')
}

// ─── Section G: Drafting posture ─────────────────────────────────────────────

function hasPostureContent(posture: DraftingPosture): boolean {
  return !!(
    posture.draftingSide ||
    posture.riskTolerance ||
    posture.negotiationPosture ||
    posture.transactionContext ||
    posture.mustIncludeClauses?.length ||
    posture.mustAvoidClauses?.length ||
    posture.specialCommercialNotes
  )
}

function buildPostureSection(
  posture: DraftingPosture,
  schema: ContractSchema,
  lang: PromptLang,
): string {
  const lines: string[] = [
    lang.postureHeading,
    '',
    lang.postureIntro,
    '',
  ]

  if (posture.draftingSide) {
    const party = schema.parties.find((p) => p.id === posture.draftingSide)
    const partyLabel = party ? `**${party.label}** (${party.role})` : `**${posture.draftingSide}**`
    lines.push(
      lang.postureRepresentedHeading,
      lang.postureRepresentedBody.replace('{party}', partyLabel),
      '',
    )
  }

  if (posture.riskTolerance) {
    const riskMap: Record<NonNullable<DraftingPosture['riskTolerance']>, string[]> = {
      conservative: lang.postureRiskConservative,
      balanced: lang.postureRiskBalanced,
      aggressive: lang.postureRiskAggressive,
    }
    lines.push(...riskMap[posture.riskTolerance], '')
  }

  if (posture.negotiationPosture) {
    const postureMap: Record<NonNullable<DraftingPosture['negotiationPosture']>, string[]> = {
      'client-protective': lang.postureNegProtective,
      neutral: lang.postureNegNeutral,
      compromise: lang.postureNegCompromise,
    }
    lines.push(...postureMap[posture.negotiationPosture], '')
  }

  if (posture.transactionContext) {
    const contextMap: Record<NonNullable<DraftingPosture['transactionContext']>, string[]> = {
      B2B: lang.postureContextB2B,
      consumer: lang.postureContextConsumer,
      employment: lang.postureContextEmployment,
      other: lang.postureContextOther,
    }
    lines.push(...contextMap[posture.transactionContext], '')
  }

  if (posture.mustIncludeClauses?.length) {
    lines.push(lang.postureMustIncludeHeading)
    for (const clause of posture.mustIncludeClauses) {
      lines.push(`- ${clause}`)
    }
    lines.push('')
  }

  if (posture.mustAvoidClauses?.length) {
    lines.push(lang.postureMustAvoidHeading)
    for (const clause of posture.mustAvoidClauses) {
      lines.push(`- ${clause}`)
    }
    lines.push('')
  }

  if (posture.specialCommercialNotes) {
    lines.push(lang.postureSpecialHeading, posture.specialCommercialNotes, '')
  }

  return lines.join('\n')
}

// ─── Utilities ────────────────────────────────────────────────────────────────

interface FieldDefinition {
  label: string
  required: boolean
  legalNote?: string
}

function resolveFieldDefinition(schema: ContractSchema, compositeId: string): FieldDefinition | null {
  const dotIndex = compositeId.indexOf('.')
  if (dotIndex === -1) return null

  const ownerId = compositeId.slice(0, dotIndex)
  const fieldId = compositeId.slice(dotIndex + 1)

  const party = schema.parties.find((p) => p.id === ownerId)
  if (party) {
    const field = [...party.requiredFields, ...party.optionalFields].find((f) => f.id === fieldId)
    if (field) {
      return { label: field.label, required: field.required, legalNote: field.legalNote }
    }
  }

  const section = schema.sections.find((s) => s.id === ownerId)
  if (section) {
    const field = section.fields.find((f) => f.id === fieldId)
    if (field) {
      return { label: field.label, required: field.required, legalNote: field.legalNote }
    }
  }

  return null
}

function formatFieldValue(field: ContractField, raw: string, jurisdiction: Jurisdiction): string {
  if (field.type === 'select' && field.options) {
    const option = field.options.find((o: SelectOption) => o.value === raw)
    if (option) return option.label
  }

  const localeMap: Record<Jurisdiction, string> = {
    CZ: 'cs-CZ',
    DE: 'de-DE',
    UK: 'en-GB',
  }
  const locale = localeMap[jurisdiction]

  if (field.type === 'date') {
    const date = new Date(raw)
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    }
  }

  if (field.type === 'number') {
    const num = Number(raw)
    if (!isNaN(num)) return num.toLocaleString(locale)
  }

  return raw
}

function resolveDataValue(data: NormalizedFormData, fieldId: string): string {
  const parts = fieldId.split('.')

  if (parts.length === 2) {
    return data.sections[parts[0]]?.[parts[1]] ?? ''
  }

  for (const sectionData of Object.values(data.sections)) {
    if (fieldId in sectionData) return sectionData[fieldId]
  }

  return ''
}

// ─── Legacy compatibility ──────────────────────────────────────────────────────

/**
 * @deprecated Use buildPrompt() which returns { systemPrompt, userPrompt }.
 */
export function buildPromptFromComponents(
  schema: ContractSchema,
  data: NormalizedFormData,
  mode: GenerationMode,
  missingFields: string[],
): string {
  return buildPrompt({ schema, data, mode, missingFields }).userPrompt
}
