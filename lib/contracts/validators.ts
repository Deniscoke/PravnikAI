/**
 * Three-layer validation for contract form data.
 *
 * Layer 1 — UI:               Real-time, per-field (required, type, regex)
 * Layer 2 — Business-Legal:   Cross-field constraints with Czech law basis
 * Layer 3 — Generation:       Determines mode: complete | draft | review-needed
 */

import type {
  ContractSchema,
  NormalizedFormData,
  ValidationResult,
  ValidationIssue,
  ThreeLayerValidationResult,
  GenerationReadinessResult,
  GenerationMode,
} from './types'

// ─── Layer 1: UI Validation ───────────────────────────────────────────────────

/**
 * Validates individual field values against schema field definitions.
 * Run in real-time in the browser and again server-side before generation.
 */
export function validateUI(
  schema: ContractSchema,
  data: NormalizedFormData,
): ValidationResult {
  const issues: ValidationIssue[] = []

  // Validate party fields
  for (const party of schema.parties) {
    const partyData = data.parties.find((p) => p.partyId === party.id)

    for (const field of party.requiredFields) {
      const value = partyData?.fields[field.id]?.trim() ?? ''
      if (!value) {
        issues.push({
          fieldId: `${party.id}.${field.id}`,
          partyId: party.id,
          message: `${field.label} je povinné pole.`,
          severity: 'error',
        })
      }
    }
  }

  // Validate section fields
  for (const section of schema.sections) {
    const sectionData = data.sections[section.id] ?? {}

    // Check conditional — skip section if condition not met
    if (section.conditional) {
      const { fieldId, value: requiredValue } = section.conditional
      const controllingValue = getFieldValueFromData(data, fieldId)
      if (controllingValue !== requiredValue) continue
    }

    for (const field of section.fields) {
      // Check conditional — skip field if condition not met
      if (field.conditional) {
        const { fieldId, value: requiredValue } = field.conditional
        const controllingValue = sectionData[fieldId] ?? ''
        if (controllingValue !== requiredValue) continue
      }

      const value = (sectionData[field.id] ?? '').trim()

      if (field.required && !value) {
        issues.push({
          fieldId: `${section.id}.${field.id}`,
          message: `${field.label} je povinné pole.`,
          severity: 'error',
        })
        continue
      }

      if (!value) continue

      const v = field.validation
      if (!v) continue

      if (field.type === 'number') {
        const num = Number(value)
        if (isNaN(num)) {
          issues.push({ fieldId: `${section.id}.${field.id}`, message: `${field.label} musí být číslo.`, severity: 'error' })
        } else {
          if (v.min !== undefined && num < v.min) {
            issues.push({ fieldId: `${section.id}.${field.id}`, message: v.customMessage ?? `${field.label} musí být nejméně ${v.min}.`, severity: 'error' })
          }
          if (v.max !== undefined && num > v.max) {
            issues.push({ fieldId: `${section.id}.${field.id}`, message: v.customMessage ?? `${field.label} nesmí přesáhnout ${v.max}.`, severity: 'error' })
          }
        }
      }

      if (field.type === 'text' || field.type === 'textarea') {
        if (v.minLength && value.length < v.minLength) {
          issues.push({ fieldId: `${section.id}.${field.id}`, message: v.customMessage ?? `${field.label} musí mít alespoň ${v.minLength} znaků.`, severity: 'error' })
        }
        if (v.maxLength && value.length > v.maxLength) {
          issues.push({ fieldId: `${section.id}.${field.id}`, message: v.customMessage ?? `${field.label} nesmí mít více než ${v.maxLength} znaků.`, severity: 'error' })
        }
        if (v.pattern && !new RegExp(v.pattern).test(value)) {
          issues.push({ fieldId: `${section.id}.${field.id}`, message: v.customMessage ?? `${field.label} má nesprávný formát.`, severity: 'error' })
        }
      }
    }
  }

  return { valid: issues.filter((i) => i.severity === 'error').length === 0, issues }
}

// ─── Input Quality Guards ─────────────────────────────────────────────────────

/**
 * Detects junk, test, and placeholder values that should never appear in a
 * legal document. Results are merged into the Layer 1 (UI) ValidationResult
 * by runFullValidation() — no new layer type is needed.
 *
 * HARD ERRORS — block or strongly discourage generation:
 *   - Known junk/test words used as entire field value (asd, test, xxx, qwerty…)
 *   - All-same-character strings (aaa, 111…)
 *   - IČO: wrong format or obviously fake (00000000, 12345678…)
 *   - Email: invalid format or clearly fake domain
 *   - Literal placeholder strings ([doplnit], todo, tbd, n/a…)
 *   - All-digit name (12345 is not a legal person)
 *   - Same junk value repeated across 3+ fields
 *
 * SOFT WARNINGS — generation proceeds but user is alerted:
 *   - Name/company shorter than 3 non-space characters
 *   - Address with no digits (likely missing house number)
 *   - Address shorter than 8 characters
 *   - Test-like email domains (test@, @example., @foo.)
 *   - Date more than 5 years in the past or 10 years in the future
 */
export function validateInputQuality(
  schema: ContractSchema,
  data: NormalizedFormData,
): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  // ── Party fields ──────────────────────────────────────────────────────────
  for (const party of schema.parties) {
    const partyData = data.parties.find((p) => p.partyId === party.id)
    if (!partyData) continue

    for (const field of [...party.requiredFields, ...party.optionalFields]) {
      const value = partyData.fields[field.id]?.trim() ?? ''
      if (!value) continue

      const compositeId = `${party.id}.${field.id}`

      if (field.id === 'name') {
        issues.push(...checkName(value, compositeId, field.label, party.id))
      } else if (field.id === 'address') {
        issues.push(...checkAddress(value, compositeId, field.label))
      } else if (field.id === 'ico') {
        issues.push(...checkIco(value, compositeId, field.label))
      } else if (field.id === 'email') {
        issues.push(...checkEmail(value, compositeId, field.label))
      } else {
        issues.push(...checkPlaceholder(value, compositeId, field.label))
      }
    }
  }

  // ── Section fields ────────────────────────────────────────────────────────
  for (const section of schema.sections) {
    if (section.conditional) {
      const { fieldId, value: reqVal } = section.conditional
      if (getFieldValueFromData(data, fieldId) !== String(reqVal)) continue
    }

    const sectionData = data.sections[section.id] ?? {}

    for (const field of section.fields) {
      if (field.conditional) {
        const { fieldId, value: reqVal } = field.conditional
        if ((sectionData[fieldId] ?? '') !== String(reqVal)) continue
      }

      const value = (sectionData[field.id] ?? '').trim()
      if (!value) continue

      const compositeId = `${section.id}.${field.id}`

      if (field.type === 'text' || field.type === 'textarea') {
        issues.push(...checkPlaceholder(value, compositeId, field.label))
      } else if (field.type === 'email') {
        issues.push(...checkEmail(value, compositeId, field.label))
      } else if (field.type === 'date') {
        issues.push(...checkDatePlausibility(value, compositeId, field.label))
      }
    }
  }

  // ── Cross-field: same junk value in 3+ fields ─────────────────────────────
  issues.push(...checkRepeatedJunk(schema, data))

  return issues
}

// ─── Quality guard helpers ────────────────────────────────────────────────────

/**
 * Full-value junk words: keyboard walks, common test strings, placeholder words.
 * Only matched when the trimmed lowercase value IS exactly one of these words.
 * Substrings are intentionally not matched — "Testing Company s.r.o." is fine.
 */
const JUNK_EXACT: ReadonlySet<string> = new Set([
  // Keyboard walks
  'asd', 'asdf', 'asdfg', 'asdfgh', 'asdfghjk',
  'qwe', 'qwer', 'qwert', 'qwerty', 'qwertz',
  'zxc', 'zxcv', 'zxcvb', 'zxcvbn',
  // Generic test strings
  'test', 'tset', 'testing', 'testtest',
  'foo', 'bar', 'baz', 'foobar',
  'abc', 'abcd', 'abcde', 'abcdef',
  'xxx', 'yyy', 'zzz',
  '123', '1234', '12345', '123456', '1234567', '12345678',
  // Czech/Slovak placeholder words
  'doplnit', 'vyplnit', 'jmeno', 'firma', 'adresa', 'ulice',
  // English placeholder words
  'name', 'address', 'company', 'street', 'city',
  'todo', 'tbd', 'tba', 'wip', 'placeholder', 'sample', 'example',
  'na', 'n/a', 'none', 'null', 'undefined', 'empty',
])

/** Regex patterns that match literal placeholder strings anywhere in the value. */
const PLACEHOLDER_PATTERNS: ReadonlyArray<RegExp> = [
  /^\[doplnit/i,       // [doplnit: ...] or [DOPLNIT]
  /^\[fill/i,          // [fill in]
  /^<doplnit/i,        // <doplnit>
  /^<.*>$/,            // any <...> template marker
  /^\.{3,}$/,          // ... or ....
  /^x{3,}$/i,          // xxx, XXXX, …
  /^-{3,}$/,           // --- separator accidentally pasted
]

function isJunkExact(value: string): boolean {
  return JUNK_EXACT.has(value.toLowerCase().trim())
}

/** True when every non-space character is the same (e.g. "aaa", "1 1 1"). */
function isAllSameChar(value: string): boolean {
  const stripped = value.replace(/\s/g, '')
  return stripped.length >= 2 && /^(.)\1+$/.test(stripped)
}

function matchesPlaceholderPattern(value: string): boolean {
  return PLACEHOLDER_PATTERNS.some((p) => p.test(value.trim()))
}

// ── Per-type checkers ─────────────────────────────────────────────────────────

function checkName(
  value: string,
  fieldId: string,
  label: string,
  partyId: string,
): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  if (isJunkExact(value)) {
    return [{ fieldId, partyId, severity: 'error',
      message: `${label}: "${value}" je testovací hodnota. Zadejte skutečné jméno nebo obchodní firmu.` }]
  }
  if (isAllSameChar(value)) {
    return [{ fieldId, partyId, severity: 'error',
      message: `${label}: "${value}" obsahuje pouze opakující se znaky. Zadejte platné jméno.` }]
  }
  if (matchesPlaceholderPattern(value)) {
    return [{ fieldId, partyId, severity: 'error',
      message: `${label}: "${value}" je zástupný symbol. Zadejte skutečné jméno nebo obchodní firmu.` }]
  }
  if (/^\d+$/.test(value.replace(/\s/g, ''))) {
    return [{ fieldId, partyId, severity: 'error',
      message: `${label}: Jméno nesmí být tvořeno pouze číslicemi.` }]
  }
  if (value.replace(/\s/g, '').length < 3) {
    issues.push({ fieldId, partyId, severity: 'warning',
      message: `${label}: "${value}" je příliš krátké pro platné jméno nebo obchodní firmu.` })
  }

  return issues
}

function checkAddress(value: string, fieldId: string, label: string): ValidationIssue[] {
  if (isJunkExact(value)) {
    return [{ fieldId, severity: 'error',
      message: `${label}: "${value}" je testovací hodnota. Zadejte skutečnou adresu.` }]
  }
  if (isAllSameChar(value)) {
    return [{ fieldId, severity: 'error',
      message: `${label}: "${value}" obsahuje pouze opakující se znaky. Zadejte platnou adresu.` }]
  }
  if (matchesPlaceholderPattern(value)) {
    return [{ fieldId, severity: 'error',
      message: `${label}: "${value}" je zástupný symbol. Zadejte skutečnou adresu.` }]
  }
  if (value.trim().length < 8) {
    return [{ fieldId, severity: 'warning',
      message: `${label}: Adresa je příliš krátká — měla by obsahovat ulici, číslo popisné a město.` }]
  }
  if (!/\d/.test(value)) {
    return [{ fieldId, severity: 'warning',
      message: `${label}: Adresa neobsahuje žádné číslo — zkontrolujte, zda je uvedeno číslo popisné.` }]
  }
  return []
}

function checkIco(value: string, fieldId: string, label: string): ValidationIssue[] {
  const stripped = value.replace(/\s/g, '')

  if (!/^\d{8}$/.test(stripped)) {
    return [{ fieldId, severity: 'error',
      message: `${label}: IČO musí být přesně 8 číslic. Zadaná hodnota "${value}" má nesprávný formát.` }]
  }
  if (isAllSameChar(stripped)) {
    return [{ fieldId, severity: 'error',
      message: `${label}: "${value}" není platné IČO (všechny číslice jsou stejné).` }]
  }
  // Known test sequences
  if (stripped === '12345678' || stripped === '87654321') {
    return [{ fieldId, severity: 'error',
      message: `${label}: "${value}" je testovací IČO. Zadejte skutečné IČO registrovaného subjektu.` }]
  }
  return []
}

function checkEmail(value: string, fieldId: string, label: string): ValidationIssue[] {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
    return [{ fieldId, severity: 'error',
      message: `${label}: "${value}" není platná e-mailová adresa.` }]
  }

  const lower = value.toLowerCase()
  const testPatterns = ['@test.', '@example.', '@foo.', '@bar.', 'test@', 'asd@', 'xxx@']
  if (testPatterns.some((p) => lower.includes(p) || lower.startsWith(p))) {
    return [{ fieldId, severity: 'warning',
      message: `${label}: "${value}" vypadá jako testovací e-mailová adresa.` }]
  }
  return []
}

function checkPlaceholder(value: string, fieldId: string, label: string): ValidationIssue[] {
  if (matchesPlaceholderPattern(value)) {
    return [{ fieldId, severity: 'error',
      message: `${label}: "${value}" je zástupný symbol. Vyplňte skutečnou hodnotu nebo pole ponechte prázdné.` }]
  }
  if (isJunkExact(value)) {
    return [{ fieldId, severity: 'error',
      message: `${label}: "${value}" je testovací hodnota.` }]
  }
  if (isAllSameChar(value)) {
    return [{ fieldId, severity: 'error',
      message: `${label}: "${value}" obsahuje pouze opakující se znaky.` }]
  }
  return []
}

function checkDatePlausibility(value: string, fieldId: string, label: string): ValidationIssue[] {
  // Literal placeholder text (non-date string)
  if (/[a-zA-Z]/.test(value) && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return [{ fieldId, severity: 'error',
      message: `${label}: "${value}" není platné datum. Použijte formát RRRR-MM-DD.` }]
  }

  const date = new Date(value)
  if (isNaN(date.getTime())) return []

  const now = new Date()
  const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate())
  const tenYearsAhead = new Date(now.getFullYear() + 10, now.getMonth(), now.getDate())
  const issues: ValidationIssue[] = []

  if (date < fiveYearsAgo) {
    issues.push({ fieldId, severity: 'warning',
      message: `${label}: Datum ${value} je více než 5 let v minulosti. Zkontrolujte, zda je správné.` })
  }
  if (date > tenYearsAhead) {
    issues.push({ fieldId, severity: 'warning',
      message: `${label}: Datum ${value} je více než 10 let v budoucnosti. Zkontrolujte, zda je správné.` })
  }

  return issues
}

/**
 * Cross-field check: same junk value used in 3+ distinct text fields.
 * Only fires when the repeated value is itself junk (keyboard walk or all-same-char)
 * so legitimate repeated values (e.g. a company name in two fields) are never flagged.
 */
function checkRepeatedJunk(schema: ContractSchema, data: NormalizedFormData): ValidationIssue[] {
  const seen = new Map<string, string[]>() // normalized value → [compositeId]

  const record = (compositeId: string, raw: string) => {
    const norm = raw.toLowerCase().trim()
    if (norm.length < 2) return
    if (!seen.has(norm)) seen.set(norm, [])
    seen.get(norm)!.push(compositeId)
  }

  for (const party of schema.parties) {
    const partyData = data.parties.find((p) => p.partyId === party.id)
    for (const field of [...party.requiredFields, ...party.optionalFields]) {
      const value = partyData?.fields[field.id]?.trim() ?? ''
      if (value) record(`${party.id}.${field.id}`, value)
    }
  }
  for (const section of schema.sections) {
    const sectionData = data.sections[section.id] ?? {}
    for (const field of section.fields) {
      if (field.type !== 'text' && field.type !== 'textarea') continue
      const value = (sectionData[field.id] ?? '').trim()
      if (value) record(`${section.id}.${field.id}`, value)
    }
  }

  const issues: ValidationIssue[] = []
  for (const [norm, ids] of seen) {
    if (ids.length >= 3 && (isJunkExact(norm) || isAllSameChar(norm))) {
      issues.push({
        fieldId: ids[0],
        severity: 'error',
        message: `Testovací hodnota "${norm}" se opakuje v ${ids.length} polích (${ids.join(', ')}). Zadejte skutečné údaje.`,
      })
    }
  }
  return issues
}

// ─── Layer 2: Business-Legal Validation ──────────────────────────────────────

/**
 * Cross-field constraints grounded in Czech law.
 * These cannot be expressed as simple field-level rules.
 */
export function validateBusinessLegal(
  schema: ContractSchema,
  data: NormalizedFormData,
): ValidationResult {
  const issues: ValidationIssue[] = []
  const schemaId = schema.metadata.schemaId

  if (schemaId === 'pracovni-smlouva-v1') {
    issues.push(...validatePracovniSmlouva(data))
  }

  if (schemaId === 'najemni-smlouva-byt-v1') {
    issues.push(...validateNajemniSmlouva(data))
  }

  if (schemaId.startsWith('kupni-smlouva')) {
    issues.push(...validateKupniSmlouva(data))
  }

  return { valid: issues.filter((i) => i.severity === 'error').length === 0, issues }
}

function validatePracovniSmlouva(data: NormalizedFormData): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const nastup = data.sections['nastup'] ?? {}
  const mzda = data.sections['mzda'] ?? {}

  // § 35 ZP — zkušební doba nesmí přesáhnout 3 měsíce (6 pro vedoucí)
  if (nastup['probationPeriod'] === '6-mesicu') {
    issues.push({
      fieldId: 'nastup.probationPeriod',
      message: '6měsíční zkušební dobu lze sjednat pouze pro vedoucí zaměstnance (§ 35 odst. 1 ZP). Ověřte, zda zaměstnanec splňuje podmínky.',
      severity: 'warning',
      legalBasis: '§ 35 odst. 1 zák. č. 262/2006 Sb.',
    })
  }

  // § 39 ZP — pracovní poměr na dobu určitou max. 3 roky
  if (nastup['employmentType'] === 'dobu-urcitou' && nastup['startDate'] && nastup['endDate']) {
    const start = new Date(nastup['startDate'])
    const end = new Date(nastup['endDate'])
    const diffYears = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365)
    if (diffYears > 3) {
      issues.push({
        fieldId: 'nastup.endDate',
        message: 'Pracovní poměr na dobu určitou nesmí přesáhnout 3 roky (§ 39 odst. 2 ZP).',
        severity: 'error',
        legalBasis: '§ 39 odst. 2 zák. č. 262/2006 Sb.',
      })
    }
  }

  // § 111 ZP — minimální mzda
  const salary = Number(mzda['salaryAmount'])
  if (!isNaN(salary) && salary > 0 && salary < 18900) {
    issues.push({
      fieldId: 'mzda.salaryAmount',
      message: 'Sjednaná mzda je nižší než zákonná minimální mzda 18 900 Kč/měsíc (§ 111 ZP, platnost od 1. 1. 2024).',
      severity: 'error',
      legalBasis: '§ 111 zák. č. 262/2006 Sb. + nařízení vlády č. 339/2023 Sb.',
    })
  }

  // § 213 ZP — dovolená min. 4 týdny
  const vacation = Number(data.sections['pracovni-doba']?.['vacationDays'])
  if (!isNaN(vacation) && vacation < 4) {
    issues.push({
      fieldId: 'pracovni-doba.vacationDays',
      message: 'Dovolená musí být minimálně 4 týdny za rok (§ 213 ZP).',
      severity: 'error',
      legalBasis: '§ 213 zák. č. 262/2006 Sb.',
    })
  }

  return issues
}

function validateNajemniSmlouva(data: NormalizedFormData): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const najemne = data.sections['najemne'] ?? {}
  const jistota = data.sections['jistota'] ?? {}

  // § 2254 NOZ — jistota max. 3× měsíční nájemné
  const rent = Number(najemne['monthlyRent'])
  const deposit = Number(jistota['depositAmount'])
  if (!isNaN(rent) && !isNaN(deposit) && deposit > 0 && rent > 0) {
    if (deposit > rent * 3) {
      issues.push({
        fieldId: 'jistota.depositAmount',
        message: `Jistota ${deposit} Kč přesahuje trojnásobek měsíčního nájemného (${rent * 3} Kč). Maximální jistota dle § 2254 NOZ je ${rent * 3} Kč.`,
        severity: 'error',
        legalBasis: '§ 2254 zák. č. 89/2012 Sb. (NOZ)',
      })
    }
  }

  return issues
}

function validateKupniSmlouva(data: NormalizedFormData): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const predani = data.sections['predani'] ?? {}

  // Contractual sanity: handover date should not be in the past
  if (predani['handoverDate']) {
    const handover = new Date(predani['handoverDate'])
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (handover < today) {
      issues.push({
        fieldId: 'predani.handoverDate',
        message: 'Datum předání je v minulosti. Ověřte, zda se nejedná o chybu.',
        severity: 'warning',
      })
    }
  }

  return issues
}

// ─── Layer 3: Generation Readiness ───────────────────────────────────────────

/**
 * Determines whether enough data exists for a complete, draft, or review-needed generation.
 * Does NOT re-run Layer 1/2 — expects their results as input.
 */
export function assessGenerationReadiness(
  schema: ContractSchema,
  data: NormalizedFormData,
  uiResult: ValidationResult,
  businessResult: ValidationResult,
): GenerationReadinessResult {
  const missingRequired = uiResult.issues
    .filter((i) => i.severity === 'error')
    .map((i) => i.fieldId)

  const conflicts = businessResult.issues.filter((i) => i.severity === 'error')

  // Collect missing optional fields
  const missingOptional: string[] = []
  for (const section of schema.sections) {
    for (const field of section.fields) {
      if (field.required) continue
      const value = (data.sections[section.id]?.[field.id] ?? '').trim()
      if (!value) {
        missingOptional.push(`${section.id}.${field.id}`)
      }
    }
  }

  let mode: GenerationMode
  if (missingRequired.length > 0 || conflicts.length > 0) {
    mode = 'review-needed'
  } else if (missingOptional.length > 2) {
    mode = 'draft'
  } else {
    mode = 'complete'
  }

  return { mode, missingRequired, missingOptional, conflicts }
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

/**
 * Runs all three layers and the input-quality guards, returning the combined result.
 * Quality issues are merged into the UI result so the existing errorCount threshold
 * in route.ts naturally blocks submissions full of junk data.
 */
export function runFullValidation(
  schema: ContractSchema,
  data: NormalizedFormData,
): ThreeLayerValidationResult {
  const uiBase = validateUI(schema, data)
  const qualityIssues = validateInputQuality(schema, data)

  const ui: ValidationResult = {
    valid: uiBase.valid && !qualityIssues.some((i) => i.severity === 'error'),
    issues: [...uiBase.issues, ...qualityIssues],
  }

  const businessLegal = validateBusinessLegal(schema, data)
  const generationReadiness = assessGenerationReadiness(schema, data, ui, businessLegal)

  return { ui, businessLegal, generationReadiness }
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function getFieldValueFromData(data: NormalizedFormData, fieldId: string): string {
  // fieldId may be "sectionId.fieldId" or just "fieldId"
  const parts = fieldId.split('.')
  if (parts.length === 2) {
    return data.sections[parts[0]]?.[parts[1]] ?? ''
  }
  // Search all sections
  for (const section of Object.values(data.sections)) {
    if (fieldId in section) return section[fieldId]
  }
  return ''
}
