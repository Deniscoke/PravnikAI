/**
 * Production-Grade Prompt Builder
 * Czech Legal Contract Generator — PrávníkAI
 * Jurisdiction: Czech Republic (CZ) only
 *
 * Architecture
 * ────────────
 * buildPrompt() is the single public entry point.
 * It assembles { systemPrompt, userPrompt } from five deterministic sections:
 *
 *   A) Contract context  — type, legal basis, party roles
 *   B) Filled data       — all provided values, grouped, formatted, with legal notes
 *   C) Missing data      — required vs. optional gaps, with explicit [DOPLNIT] markers
 *   D) Instructions      — mode-aware generation rules + inviolable safety constraints
 *   E) Output structure  — required document sections, formatting rules
 *
 * Safety guarantee
 * ────────────────
 * Section D explicitly prohibits the model from inventing any concrete datum
 * (names, addresses, IDs, dates, account numbers, parcel references) not
 * present in section B. Missing data must use [DOPLNIT: {description}].
 *
 * Provider-agnostic
 * ─────────────────
 * This file imports only from ./systemPrompt and ./types — zero LLM SDK coupling.
 * To change providers, only lib/llm/openaiClient.ts needs editing.
 */

import { buildSystemPrompt as assembleSystemPrompt } from './systemPrompt'
import type {
  ContractSchema,
  NormalizedFormData,
  GenerationMode,
  ContractField,
  PartyField,
  SelectOption,
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
  const { schema, data, mode, missingFields } = input
  const missingSet = new Set(missingFields)

  const userPromptParts = [
    '# ZADÁNÍ PRO GENEROVÁNÍ SMLOUVY',
    buildContextSection(schema),
    buildDataSection(schema, data, missingSet),
    buildMissingSection(schema, data, missingFields),
    buildInstructionSection(mode),
    buildOutputStructureSection(schema),
  ]

  return {
    systemPrompt: assembleSystemPrompt(schema.metadata.aiInstructions),
    userPrompt: userPromptParts.join('\n\n---\n\n'),
  }
}

// ─── Section A: Contract context ─────────────────────────────────────────────

/**
 * Provides the model with contract type, jurisdiction, full legal basis,
 * and the legal role of each contracting party.
 */
function buildContextSection(schema: ContractSchema): string {
  const { metadata, parties } = schema

  const lines: string[] = [
    '## A) KONTEXT SMLOUVY',
    '',
    `**Typ smlouvy:** ${metadata.name}`,
    `**Identifikátor schématu:** \`${metadata.schemaId}\` (verze ${metadata.version})`,
    `**Jurisdikce:** Česká republika — výhradně české právo, žádné jiné právní řády`,
    '',
    '**Právní základ (závazné prameny):**',
    ...metadata.legalBasis.map((basis) => `- ${basis}`),
    '',
    '**Smluvní strany a jejich zákonné role:**',
    ...parties.map((p) => `- **${p.label}** — ${p.role}`),
  ]

  return lines.join('\n')
}

// ─── Section B: Filled data ───────────────────────────────────────────────────

/**
 * Lists all provided field values grouped by party and section.
 * Fields in missingSet are skipped here — they appear in section C instead.
 * Select values are resolved to their human-readable labels.
 * Dates are formatted to Czech locale. Numbers use Czech locale formatting.
 * Legal notes (§ references) are shown inline next to each value.
 */
function buildDataSection(
  schema: ContractSchema,
  data: NormalizedFormData,
  missingSet: Set<string>,
): string {
  const lines: string[] = ['## B) VYPLNĚNÉ ÚDAJE']

  // ── Parties ──────────────────────────────────────────────────────────────
  lines.push('', '### Smluvní strany', '')

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
    lines.push(`*Role: ${party.role}*`)

    if (filledRows.length > 0) {
      lines.push(...filledRows)
    } else {
      lines.push('*(žádné vyplněné údaje pro tuto stranu)*')
    }

    lines.push('')
  }

  // ── Content sections ──────────────────────────────────────────────────────
  lines.push('### Obsah smlouvy', '')

  let anySectionHadData = false

  for (const section of schema.sections) {
    // Honour section-level conditional — skip if controlling field does not match
    if (section.conditional) {
      const { fieldId, value: requiredValue } = section.conditional
      const currentValue = resolveDataValue(data, fieldId)
      if (currentValue !== String(requiredValue)) continue
    }

    const sectionData = data.sections[section.id] ?? {}
    const filledRows: string[] = []

    for (const field of section.fields) {
      // Honour field-level conditional
      if (field.conditional) {
        const { fieldId, value: requiredValue } = field.conditional
        const currentValue = sectionData[fieldId] ?? ''
        if (currentValue !== String(requiredValue)) continue
      }

      const compositeId = `${section.id}.${field.id}`
      if (missingSet.has(compositeId)) continue

      const raw = (sectionData[field.id] ?? '').trim()
      if (!raw) continue

      const displayValue = formatFieldValue(field, raw)
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
    lines.push('*(obsah smlouvy není vyplněn)*', '')
  }

  return lines.join('\n')
}

// ─── Section C: Missing data ──────────────────────────────────────────────────

/**
 * Enumerates every missing field split into two tiers:
 *
 *   CRITICAL    — required fields (parties + sections); their absence blocks legal validity.
 *   SUPPLEMENTARY — optional fields that improve contract quality.
 *                   Includes optional party fields (IČO, e-mail, bankAccount, etc.) which
 *                   are NOT tracked by assessGenerationReadiness — scanned here from data.
 *
 * Each entry shows the composite ID, human label, legal note, and the exact
 * placeholder string the model must use when that datum is absent.
 */
function buildMissingSection(
  schema: ContractSchema,
  data: NormalizedFormData,
  missingFields: string[],
): string {
  const criticalMissing: string[] = []
  const supplementaryMissing: string[] = []
  const coveredIds = new Set<string>()

  // ── Process fields supplied by assessGenerationReadiness ─────────────────
  for (const compositeId of missingFields) {
    coveredIds.add(compositeId)
    const def = resolveFieldDefinition(schema, compositeId)
    if (!def) continue

    const line = formatMissingLine(compositeId, def)
    if (def.required) {
      criticalMissing.push(line)
    } else {
      supplementaryMissing.push(line)
    }
  }

  // ── Scan optional party fields not tracked by assessGenerationReadiness ──
  // assessGenerationReadiness only walks schema.sections; party optional fields
  // (IČO, email, phone, bankAccount, representative) are invisible to it.
  for (const party of schema.parties) {
    const partyData = data.parties.find((p) => p.partyId === party.id)
    for (const field of party.optionalFields) {
      const compositeId = `${party.id}.${field.id}`
      if (coveredIds.has(compositeId)) continue
      const value = partyData?.fields[field.id]?.trim() ?? ''
      if (value) continue // field is filled — not missing
      supplementaryMissing.push(
        formatMissingLine(compositeId, {
          label: field.label,
          required: false,
          legalNote: field.legalNote,
        }),
      )
    }
  }

  if (criticalMissing.length === 0 && supplementaryMissing.length === 0) {
    return [
      '## C) CHYBĚJÍCÍ ÚDAJE',
      '',
      '*Všechna relevantní pole jsou vyplněna.*',
      '*Generuj kompletní text smlouvy — nepoužívej žádné placeholdery pro dostupná data.*',
    ].join('\n')
  }

  const lines: string[] = ['## C) CHYBĚJÍCÍ ÚDAJE', '']

  if (criticalMissing.length > 0) {
    lines.push(
      '### ⚠️ Kriticky chybějící údaje',
      '*Bez těchto údajů není text smlouvy připraven k podpisu ani právní kontrole.*',
      '',
      ...criticalMissing,
      '',
    )
  }

  if (supplementaryMissing.length > 0) {
    lines.push(
      '### Doplňkové chybějící údaje',
      '*Neblokují platnost textu, ale jejich doplnění zlepší kvalitu smlouvy.*',
      '',
      ...supplementaryMissing,
      '',
    )
  }

  return lines.join('\n')
}

/** Formats a single missing-field entry for section C. */
function formatMissingLine(compositeId: string, def: FieldDefinition): string {
  const legalNote = def.legalNote ? ` *(${def.legalNote})*` : ''
  return `- \`${compositeId}\` → **${def.label}**${legalNote}\n  Placeholder: \`[DOPLNIT: ${def.label}]\``
}

// ─── Section D: Generation instructions ──────────────────────────────────────

/**
 * Combines mode-specific generation instructions with inviolable safety rules.
 * The safety rules are placed after the mode block to ensure they are read last
 * and thus have highest recency weight in the model's attention.
 */
function buildInstructionSection(mode: GenerationMode): string {
  const safetyRules: string[] = [
    '### ⚠️ BEZPEČNOSTNÍ PRAVIDLA — ZÁVAZNÁ, NEPŘEKROČITELNÁ:',
    '',
    '**Pravidlo 1 — Žádná vymyšlená data:**',
    'NIKDY nevymýšlej konkrétní hodnoty, které nejsou v sekci B. Týká se:',
    '- Jmen fyzických ani právnických osob',
    '- Adres, ulic, čísel popisných, PSČ, obcí',
    '- IČO, DIČ, rodných čísel, čísel osobních dokladů',
    '- Čísel parcel, listů vlastnictví, čísel jednotek, katastrálních území',
    '- Dat (uzavření smlouvy, předání, splatnosti, nástupu, účinnosti)',
    '- Čísel bankovních účtů, IBAN, variabilních symbolů',
    '- Výší smluvních pokut, úroků nebo jiných číselných hodnot',
    '',
    '**Pravidlo 2 — Placeholdery pro chybějící data:**',
    'Pro každý chybějící povinný údaj vlož výhradně: `[DOPLNIT: {popis konkrétního údaje}]`',
    'Pro chybějící volitelné údaje buď celý oddíl vynech, nebo vlož `[DOPLNIT: {popis}]`',
    '',
    '**Pravidlo 3 — Pouze české právo:**',
    'NIKDY nepoužívej slovenské právo, slovenské zákonné citace, slovenské vzory ani slovenskou terminologii.',
    'Při pochybnostech použij výhradně NOZ (zák. č. 89/2012 Sb.) nebo příslušný zvláštní zákon.',
    '',
    '**Pravidlo 4 — Žádné vymyšlené klauzule:**',
    'Nevymýšlej sankce, úroky z prodlení, penále, rozhodčí doložky ani jiné podmínky,',
    'které nevyplývají přímo z poskytnutých dat nebo z dispozitivních norem příslušného zákona.',
    '',
    '**Pravidlo 5 — Citace zákonů:**',
    'Zákonné citace ve tvaru `(§ X zák. č. Y/RRRR Sb.)` vlož pouze tam, kde posilují konkrétní ujednání',
    'nebo kde je vyžaduje schema (sekce A, právní základ). Nepoužívej citace automaticky ke každé větě.',
  ]

  return [
    '## D) POKYNY K GENEROVÁNÍ',
    '',
    buildModeBlock(mode),
    '',
    ...safetyRules,
  ].join('\n')
}

function buildModeBlock(mode: GenerationMode): string {
  switch (mode) {
    case 'complete':
      return [
        '### Generační mód: KOMPLETNÍ',
        '',
        'Všechna povinná pole jsou vyplněna.',
        'Vygeneruj **kompletní návrh smlouvy** určený k právní kontrole a podpisu.',
        '',
        '- Všechna data ze sekce B zahrň do smlouvy — nenahrazuj je placeholdery',
        '- Chybějící volitelné údaje ze sekce C buď celý oddíl vynech, nebo nahraď `[DOPLNIT: ...]`',
        '- Text smlouvy musí být úplný a připravený k právní kontrole a následnému podpisu',
        '- Neotvírej výstup komentářem — začni přímo textem smlouvy',
      ].join('\n')

    case 'draft':
      return [
        '### Generační mód: NÁVRH',
        '',
        'Povinná pole jsou vyplněna, ale chybí část volitelných polí.',
        'Vygeneruj **návrh textu smlouvy** s označenými mezerami pro chybějící údaje.',
        '',
        '- Kde chybí volitelné údaje ze sekce C, vlož `[DOPLNIT: {popis čeho přesně}]`',
        '- Na samý začátek dokumentu — před název smlouvy — přidej toto varování na vlastním řádku:',
        '  `NÁVRH — Text smlouvy určený k doplnění a právní kontrole před podpisem`',
        '- Text nesmí být podepsán, dokud nejsou doplněny všechny `[DOPLNIT]` placeholdery',
      ].join('\n')

    case 'review-needed':
      return [
        '### Generační mód: VYŽADUJE KONTROLU',
        '',
        '⚠️ **Chybí povinná pole. Vygenerovaný text není připraven k podpisu bez jejich doplnění.**',
        '',
        'Vygeneruj **orientační kostru smlouvy** s jasně vyznačenými neúplnými místy.',
        '',
        '- Pro každé chybějící povinné pole (sekce C) vlož: `⚠️ ZKONTROLOVAT — [DOPLNIT: {popis čeho}]`',
        '- Na samý začátek dokumentu přidej prominentní varování:',
        '  `⚠️ NEÚPLNÁ KOSTRA — Pouze orientační podklad. Před podpisem vyžaduje právní kontrolu.`',
        '- Bezprostředně za varováním uveď číslovaný seznam všech chybějících povinných polí ze sekce C',
        '- Text v tomto stavu slouží pouze jako podklad — nesmí být použit bez odborné kontroly',
      ].join('\n')
  }
}

// ─── Section E: Output structure ─────────────────────────────────────────────

/**
 * Specifies the required document sections in order, plus signature blocks,
 * and all formatting conventions (headings, citations, dates, money, signatures).
 */
function buildOutputStructureSection(schema: ContractSchema): string {
  const { outputStructure, name } = schema.metadata

  const documentSections = outputStructure.sections.map(
    (sectionTitle, index) => `${index + 1}. ${sectionTitle}`,
  )

  const signatureBlocks = schema.parties.map(
    (party, index) =>
      `${outputStructure.sections.length + index + 1}. Podpisový blok — ${party.label}`,
  )

  const lines: string[] = [
    '## E) POŽADOVANÁ STRUKTURA VÝSTUPU',
    '',
    `Generuj dokument **"${name}"** s těmito oddíly v uvedeném pořadí:`,
    '',
    ...documentSections,
    ...signatureBlocks,
    '',
    '**Formátovací pravidla:**',
    '- Nadpisy oddílů: Článek I., Článek II., ... (nebo § 1, § 2, ...)',
    '- Právní citace ve tvaru `(§ X zák. č. Y/RRRR Sb.)` vlož jen tam, kde posilují konkrétní ujednání',
    '- Data v českém formátu: `d. měsíce RRRR` — např. `15. března 2024`',
    '- Peněžní částky uváděj číselně; slovy pouze u kupní ceny, nájemného a smluvní pokuty',
    '- Každý podpisový blok: řádek pro jméno/název, funkce/role, místo a datum, řádek pro podpis',
    '- Výstup je POUZE čistý text smlouvy — bez komentářů, vysvětlení, záhlaví asistenta ani metadat',
  ]

  if (outputStructure.defaultJurisdictionClause) {
    lines.push(`- Soudní příslušnost: ${outputStructure.defaultJurisdictionClause}`)
  }

  if (outputStructure.requiresSignature) {
    lines.push('- Smlouva vyžaduje vlastnoruční podpis všech smluvních stran')
  }

  return lines.join('\n')
}

// ─── Utilities ────────────────────────────────────────────────────────────────

interface FieldDefinition {
  label: string
  required: boolean
  legalNote?: string
}

/**
 * Resolves a composite field ID (e.g. "predmet.subjectDescription" or
 * "prodavajici.name") to its schema definition.
 * Returns null if the composite ID does not match any known field.
 */
function resolveFieldDefinition(
  schema: ContractSchema,
  compositeId: string,
): FieldDefinition | null {
  const dotIndex = compositeId.indexOf('.')
  if (dotIndex === -1) return null

  const ownerId = compositeId.slice(0, dotIndex)
  const fieldId = compositeId.slice(dotIndex + 1)

  // Search party fields
  const party = schema.parties.find((p) => p.id === ownerId)
  if (party) {
    const field = [...party.requiredFields, ...party.optionalFields].find(
      (f) => f.id === fieldId,
    )
    if (field) {
      return { label: field.label, required: field.required, legalNote: field.legalNote }
    }
  }

  // Search section fields
  const section = schema.sections.find((s) => s.id === ownerId)
  if (section) {
    const field = section.fields.find((f) => f.id === fieldId)
    if (field) {
      return { label: field.label, required: field.required, legalNote: field.legalNote }
    }
  }

  return null
}

/**
 * Formats a raw form value for human-readable display in the prompt.
 * - select  → resolves to option label (never shows raw value key)
 * - date    → Czech locale: "15. března 2024"
 * - number  → Czech locale grouping: "10 000"
 * - other   → returned as-is
 */
function formatFieldValue(field: ContractField, raw: string): string {
  if (field.type === 'select' && field.options) {
    const option = field.options.find((o: SelectOption) => o.value === raw)
    if (option) return option.label
  }

  if (field.type === 'date') {
    const date = new Date(raw)
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('cs-CZ', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    }
  }

  if (field.type === 'number') {
    const num = Number(raw)
    if (!isNaN(num)) return num.toLocaleString('cs-CZ')
  }

  return raw
}

/**
 * Resolves a field value from NormalizedFormData using a composite or bare field ID.
 * Used exclusively for evaluating section/field conditional rules.
 */
function resolveDataValue(data: NormalizedFormData, fieldId: string): string {
  const parts = fieldId.split('.')

  if (parts.length === 2) {
    return data.sections[parts[0]]?.[parts[1]] ?? ''
  }

  // Bare field ID — scan all sections
  for (const sectionData of Object.values(data.sections)) {
    if (fieldId in sectionData) return sectionData[fieldId]
  }

  return ''
}

// ─── Legacy compatibility ──────────────────────────────────────────────────────

/**
 * @deprecated Use buildPrompt() which returns { systemPrompt, userPrompt }.
 * Kept only to avoid breaking any callers not yet migrated.
 * Returns the userPrompt string only.
 */
export function buildPromptFromComponents(
  schema: ContractSchema,
  data: NormalizedFormData,
  mode: GenerationMode,
  missingFields: string[],
): string {
  return buildPrompt({ schema, data, mode, missingFields }).userPrompt
}
