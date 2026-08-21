/**
 * Statutory values used by validators, schemas and prompts — Právo365
 *
 * WHY THIS FILE EXISTS
 *
 * Legal numbers were previously spread across validators, schema definitions and
 * prompt text. When the law changed, some copies were updated and others were
 * not: the app shipped a 2024 minimum wage and a pre-flexinovela probation limit
 * long after both had changed, which let an unlawful contract pass validation.
 *
 * Every statutory value now lives here exactly once, carrying the provision it
 * comes from, the date it took effect, where it was verified and when. That last
 * field is the point: it turns "is this still true?" from a guess into something
 * a human can check on a schedule.
 *
 * HOW TO UPDATE
 *
 * 1. Confirm the value against the official source (see `source`).
 * 2. Change `value` and `effectiveFrom`, set `lastVerified` to today.
 * 3. Run the tests — several assert on these values deliberately, so a silent
 *    drift shows up as a failure.
 *
 * See docs/PRAVNI_ZDROJE.md for the review cadence and the list of laws to watch.
 */

export interface LegalFact<T> {
  value: T
  /** Provision this follows from */
  law: string
  /** Date this value became effective (ISO) */
  effectiveFrom: string
  /** Date a human last checked it against the source (ISO) */
  lastVerified: string
  /** Where to verify it */
  source: string
  /** Anything a reader needs to know before relying on it */
  note?: string
}

// ─── Zákoník práce (zák. č. 262/2006 Sb.) ────────────────────────────────────

/**
 * Minimum monthly wage. Since 2025 it follows an indexation mechanism, so it
 * changes every January — the single most perishable value in this file.
 */
export const MINIMUM_MONTHLY_WAGE_CZK: LegalFact<number> = {
  value: 22_400,
  law: '§ 111 zák. č. 262/2006 Sb. (zákoník práce)',
  effectiveFrom: '2026-01-01',
  lastVerified: '2026-08-21',
  source: 'https://mpsv.gov.cz/',
  note: 'Indexovaná hodnota — mění se každý leden. Zaručená mzda může být pro danou skupinu prací vyšší.',
}

/**
 * Maximum probation period. The 2025 "flexinovela" raised it from 3/6 months.
 */
export const PROBATION_MAX_MONTHS: LegalFact<number> = {
  value: 4,
  law: '§ 35 zák. č. 262/2006 Sb.',
  effectiveFrom: '2025-06-01',
  lastVerified: '2026-08-21',
  source: 'zák. č. 120/2025 Sb. (flexinovela)',
  note: 'Nesmí přesáhnout polovinu sjednané doby trvání pracovního poměru.',
}

/** Maximum probation period for managerial employees. */
export const PROBATION_MAX_MONTHS_MANAGER: LegalFact<number> = {
  value: 8,
  law: '§ 35 zák. č. 262/2006 Sb.',
  effectiveFrom: '2025-06-01',
  lastVerified: '2026-08-21',
  source: 'zák. č. 120/2025 Sb. (flexinovela)',
}

/** Maximum length of a single fixed-term employment relationship. */
export const FIXED_TERM_MAX_YEARS: LegalFact<number> = {
  value: 3,
  law: '§ 39 odst. 2 zák. č. 262/2006 Sb.',
  effectiveFrom: '2012-01-01',
  lastVerified: '2026-08-21',
  source: 'https://www.zakonyprolidi.cz/cs/2006-262',
  note: 'Lze opakovat nejvýše dvakrát.',
}

/** Minimum annual leave. */
export const MIN_VACATION_WEEKS: LegalFact<number> = {
  value: 4,
  law: '§ 213 zák. č. 262/2006 Sb.',
  effectiveFrom: '2007-01-01',
  lastVerified: '2026-08-21',
  source: 'https://www.zakonyprolidi.cz/cs/2006-262',
}

// ─── Občanský zákoník (zák. č. 89/2012 Sb.) ──────────────────────────────────

/** Rental security deposit ceiling, as a multiple of the monthly rent. */
export const RENT_DEPOSIT_MAX_MULTIPLE: LegalFact<number> = {
  value: 3,
  law: '§ 2254 zák. č. 89/2012 Sb.',
  effectiveFrom: '2014-01-01',
  lastVerified: '2026-08-21',
  source: 'https://www.zakonyprolidi.cz/cs/2012-89',
}

// ─── Omezení plateb v hotovosti (zák. č. 254/2004 Sb.) ───────────────────────

/** Ceiling for a single cash payment. */
export const CASH_PAYMENT_LIMIT_CZK: LegalFact<number> = {
  value: 270_000,
  law: 'zák. č. 254/2004 Sb., o omezení plateb v hotovosti',
  effectiveFrom: '2004-07-01',
  lastVerified: '2026-08-21',
  source: 'https://www.zakonyprolidi.cz/cs/2004-254',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Formats a Czech-koruna amount the way the UI and prompts write it. */
export function formatCzk(amount: number): string {
  return `${amount.toLocaleString('cs-CZ')} Kč`
}

/**
 * Every fact in one place, so a maintenance script or test can walk them and
 * report which ones have not been checked recently.
 */
export const ALL_LEGAL_FACTS: ReadonlyArray<{ key: string; fact: LegalFact<number> }> = [
  { key: 'MINIMUM_MONTHLY_WAGE_CZK', fact: MINIMUM_MONTHLY_WAGE_CZK },
  { key: 'PROBATION_MAX_MONTHS', fact: PROBATION_MAX_MONTHS },
  { key: 'PROBATION_MAX_MONTHS_MANAGER', fact: PROBATION_MAX_MONTHS_MANAGER },
  { key: 'FIXED_TERM_MAX_YEARS', fact: FIXED_TERM_MAX_YEARS },
  { key: 'MIN_VACATION_WEEKS', fact: MIN_VACATION_WEEKS },
  { key: 'RENT_DEPOSIT_MAX_MULTIPLE', fact: RENT_DEPOSIT_MAX_MULTIPLE },
  { key: 'CASH_PAYMENT_LIMIT_CZK', fact: CASH_PAYMENT_LIMIT_CZK },
]
