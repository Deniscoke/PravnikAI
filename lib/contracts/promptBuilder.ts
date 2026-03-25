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
  DraftingPosture,
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
  const missingSet = new Set(missingFields)

  const userPromptParts = [
    '# ZADÁNÍ PRO GENEROVÁNÍ SMLOUVY',
    buildContextSection(schema),
    buildDataSection(schema, data, missingSet),
    buildMissingSection(schema, data, missingFields),
    buildInstructionSection(mode),
    buildOutputStructureSection(schema),
    buildQualityCheckSection(mode),
  ]

  if (posture && hasPostureContent(posture)) {
    userPromptParts.push(buildPostureSection(posture, schema))
  }

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
        '**Výstup musí být řádný právní text v češtině — nikoli seznam odrážek ani výčet polí.**',
        'Placeholdery `[DOPLNIT: ...]` vkládej přímo do vět na místě, kde chybějící údaj patří.',
        '',
        '- Kde chybí volitelné údaje ze sekce C, vlož `[DOPLNIT: {popis čeho přesně}]` inline do věty',
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
        '**KLÍČOVÉ: Výstup musí být VŽDY řádný právní text v češtině — nikoli seznam odrážek ani tabulka polí.**',
        'Každý článek smlouvy napiš jako souvětí/odstavec v právní češtině (vzor: "Prodávající [DOPLNIT: Jméno], bytem ⚠️ ZKONTROLOVAT — [DOPLNIT: Adresa prodávajícího], tímto prodává..."). Placeholdery ⚠️ ZKONTROLOVAT — [DOPLNIT: ...] vkládej přímo do vět na místě, kde chybějící údaj patří — NIKDY jako samostatnou odrážku mimo větu.',
        '',
        '- Pro každé chybějící povinné pole (sekce C) vlož inline do věty: `⚠️ ZKONTROLOVAT — [DOPLNIT: {popis čeho}]`',
        '- Na samý začátek dokumentu přidej prominentní varování:',
        '  `⚠️ NEÚPLNÁ KOSTRA — Pouze orientační podklad. Před podpisem vyžaduje právní kontrolu.`',
        '- Bezprostředně za varováním uveď číslovaný seznam všech chybějících povinných polí ze sekce C',
        '- Text v tomto stavu slouží pouze jako podklad — nesmí být použit bez odborné kontroly',
        '- Struktura dokumentu: použij Článek I., Článek II. atd. — každý článek obsahuje celé odstavce právní prózy, ne odrážky',
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
    '- Obsah každého článku: celé odstavce právní prózy v češtině — NIKDY odrážky, tabulky ani výčty polí',
    '- Chybějící údaje: vlož `[DOPLNIT: popis]` nebo `⚠️ ZKONTROLOVAT — [DOPLNIT: popis]` přímo do věty jako součást souvětí — NIKDY jako samostatnou odrážku',
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

// ─── Section F: Quality self-check ──────────────────────────────────────────

/**
 * Instructs the model to perform an internal quality check before finalizing
 * the output. Placed last in the prompt for maximum recency weight.
 */
function buildQualityCheckSection(mode: GenerationMode): string {
  return [
    '## F) ZÁVĚREČNÁ KONTROLA KVALITY — PROVEĎ PŘED ODEVZDÁNÍM',
    '',
    'Před odevzdáním textu interně prověř tyto body. Pokud nalezneš problém, OPRAV ho přímo v textu:',
    '',
    '1. **Nejednoznačnosti:** Existuje formulace s více možnými výklady? → Přeformuluj jednoznačně.',
    '2. **Vnitřní rozpory:** Protiřečí si klauzule, data, částky nebo lhůty? → Sjednoť.',
    '3. **Chybějící klauzule:** Chybí pro tento typ smlouvy esenciální ustanovení dle českého práva? → Doplň.',
    '4. **Definované pojmy:** Jsou všechny definované pojmy (velké písmeno) definovány při prvním použití a používány konzistentně? → Oprav.',
    '5. **Placeholdery:** Vymyslel jsi konkrétní údaj, který nebyl v sekci B? → Nahraď [DOPLNIT: ...].',
    '6. **Zákonné odkazy:** Jsou citace (§) správné a existující v českém právu? → Oprav nebo odstraň.',
    '7. **Praktická vymahatelnost:** Je smlouva prakticky proveditelná a vymahatelná? → Doplň chybějící mechanismy.',
    ...(mode === 'complete' ? [
      '8. **Úplnost:** Je text kompletní a připravený k právní kontrole? Nejsou v něm zbytné [DOPLNIT] placeholdery pro data, která JSOU dostupná v sekci B?',
    ] : []),
  ].join('\n')
}

// ─── Section G: Drafting posture ─────────────────────────────────────────────

/** Returns true when the posture object has at least one meaningful field. */
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

/**
 * Injects explicit drafting strategy instructions derived from the posture.
 * Placed last in the prompt to carry the highest recency weight.
 *
 * Design invariants:
 * - Never overrides safety rules from Section D
 * - Never invents facts — only influences clause selection and wording posture
 * - Consumer context always activates mandatory Czech consumer-protection framing
 */
function buildPostureSection(posture: DraftingPosture, schema: ContractSchema): string {
  const lines: string[] = [
    '## G) INSTRUKCE K ZASTOUPENÍ A OBCHODNÍ STRATEGII',
    '',
    '> Tato sekce upřesňuje smluvní strategii a postoj při tvorbě textu.',
    '> NEPŘEKRÝVÁ bezpečnostní pravidla z části D. Data NIKDY nevymýšlej.',
    '',
  ]

  // ── Represented party ────────────────────────────────────────────────────
  if (posture.draftingSide) {
    const party = schema.parties.find((p) => p.id === posture.draftingSide)
    const partyLabel = party ? `**${party.label}** (${party.role})` : `**${posture.draftingSide}**`
    lines.push(
      `### Zastoupená strana`,
      `Smlouvu navrhuješ v zájmu strany ${partyLabel}.`,
      'Formuluj klauzule tak, aby chránily a zvýhodňovaly tuto stranu v mezích dovolené autonomie vůle.',
      '',
    )
  }

  // ── Risk tolerance ────────────────────────────────────────────────────────
  if (posture.riskTolerance) {
    const riskMap: Record<NonNullable<DraftingPosture['riskTolerance']>, string[]> = {
      conservative: [
        '### Tolerance rizika: KONZERVATIVNÍ',
        '- Preferuj formulace s minimálním rizikem pro zastoupenou stranu',
        '- Upřednostňuj kogentní normy před dispozitivními tam, kde chrání zastoupenou stranu',
        '- Zařaď silné záruky, smluvní pokuty pro druhou stranu a přísné podmínky předání',
        '- Vyhni se vágním formulacím jako „dle dohody stran" bez konkrétního obsahu',
      ],
      balanced: [
        '### Tolerance rizika: VYVÁŽENÁ',
        '- Vyváž zájmy obou stran — standardní obchodní formulace pro první kolo vyjednávání',
        '- Zařaď standardní sankce a odpovědnostní klauzule bez extremních vychýlení',
      ],
      aggressive: [
        '### Tolerance rizika: AGRESIVNÍ',
        '- Maximalizuj výhody pro zastoupenou stranu v mezích dovolené autonomie vůle (§ 1 odst. 2 NOZ)',
        '- Zařaď formulace minimalizující záruky druhé strany a maximalizující tvá práva',
        '- Lze použít tvrdé odpovědnostní klauzule a jednostranně výhodné podmínky',
        '- POZOR: spotřebitelské smlouvy mají kogentní limity — § 1813 NOZ zakazuje zakázaná ujednání',
      ],
    }
    lines.push(...riskMap[posture.riskTolerance], '')
  }

  // ── Negotiation posture ───────────────────────────────────────────────────
  if (posture.negotiationPosture) {
    const postureMap: Record<NonNullable<DraftingPosture['negotiationPosture']>, string[]> = {
      'client-protective': [
        '### Vyjednávací postoj: MAXIMÁLNÍ OCHRANA KLIENTA',
        '- Silné záruky a opravné prostředky pro zastoupenou stranu',
        '- Přísné podmínky jednostranného odstoupení od smlouvy v prospěch zastoupené strany',
        '- Tvrdé smluvní pokuty pro druhou stranu při prodlení nebo porušení',
      ],
      neutral: [
        '### Vyjednávací postoj: NEUTRÁLNÍ',
        '- Vyvážený text vhodný jako výchozí pozice pro vyjednávání',
        '- Symetrické práva a povinnosti obou stran',
      ],
      compromise: [
        '### Vyjednávací postoj: KOMPROMISNÍ',
        '- Navrhuj kompromisní formulace usnadňující rychlé uzavření',
        '- Přijatelná ústupky — menší ochrana, ale realisticky akceptovatelné podmínky',
      ],
    }
    lines.push(...postureMap[posture.negotiationPosture], '')
  }

  // ── Transaction context ───────────────────────────────────────────────────
  if (posture.transactionContext) {
    const contextMap: Record<NonNullable<DraftingPosture['transactionContext']>, string[]> = {
      B2B: [
        '### Transakční kontext: B2B (podnikatel — podnikatel)',
        '- Jde o vztah mezi podnikateli — lze uplatnit širší smluvní volnost (§ 1 odst. 2 NOZ)',
        '- Spotřebitelská ochrana se NEAPLIKUJE — strany jsou rovnocenné',
      ],
      consumer: [
        '### Transakční kontext: B2C (podnikatel — spotřebitel)',
        '⚠️ **POVINNÉ: Spotřebitelská ochrana dle § 1810–1867 NOZ**',
        '- Zakázaná ujednání dle § 1813 NOZ NESMÍ být zahrnuta',
        '- Právo na odstoupení od smlouvy (§ 1829–1851 NOZ) musí být zmíněno tam, kde se aplikuje',
        '- Vyhni se formulacím omezujícím zákonná práva spotřebitele',
        '- Formulace musí být srozumitelná průměrnému spotřebiteli (§ 1812 odst. 2 NOZ)',
      ],
      employment: [
        '### Transakční kontext: PRACOVNĚPRÁVNÍ',
        '- Vztah se řídí zákoníkem práce (zák. č. 262/2006 Sb.) — KOGENTNÍ normy',
        '- Minimální práva zaměstnance nesmí být snížena pod zákonné minimum',
        '- Minimální mzda a zákonná náhrada mzdy jsou pevné spodní meze',
      ],
      other: [
        '### Transakční kontext: OSTATNÍ',
        '- Aplikuj standardní českoprávní zásady pro daný typ smlouvy',
      ],
    }
    lines.push(...contextMap[posture.transactionContext], '')
  }

  // ── Must-include clauses ──────────────────────────────────────────────────
  if (posture.mustIncludeClauses?.length) {
    lines.push('### Klauzule, které MUSÍ být v textu:')
    for (const clause of posture.mustIncludeClauses) {
      lines.push(`- ${clause}`)
    }
    lines.push('')
  }

  // ── Must-avoid clauses ────────────────────────────────────────────────────
  if (posture.mustAvoidClauses?.length) {
    lines.push('### Klauzule nebo formulace, které NESMÍ být v textu:')
    for (const clause of posture.mustAvoidClauses) {
      lines.push(`- ${clause}`)
    }
    lines.push('')
  }

  // ── Special commercial notes ──────────────────────────────────────────────
  if (posture.specialCommercialNotes) {
    lines.push(
      '### Zvláštní obchodní kontext:',
      posture.specialCommercialNotes,
      '',
    )
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
