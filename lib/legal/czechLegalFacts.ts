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
 * Minimum hourly wage. Derived from the monthly figure at a 40-hour week, but
 * published as its own value — it is the one that matters for DPP and DPČ,
 * where pay is agreed per hour and there is no monthly salary to compare.
 */
export const MINIMUM_HOURLY_WAGE_CZK: LegalFact<number> = {
  value: 134.4,
  law: '§ 111 zák. č. 262/2006 Sb.; sdělení MPSV č. 356/2025 Sb.',
  effectiveFrom: '2026-01-01',
  lastVerified: '2026-08-22',
  source: 'https://mpsv.gov.cz/minimalni-mzda',
  note: 'Odvozeno od měsíční minimální mzdy při 40hodinovém týdnu. Mění se každý leden spolu s ní.',
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
/**
 * Ceiling on the deposit — and, since 2020, on the deposit and any contractual
 * penalty taken together.
 *
 * Two amendments moved this, and both are easy to state wrongly. The original
 * code allowed a sixfold deposit; zák. č. 460/2016 Sb. cut it to threefold with
 * effect from 28 February 2017 — which is why the date below is not the day the
 * code took effect. Then zák. č. 163/2020 Sb. turned the ceiling into a
 * COMBINED one: the deposit plus the right to a contractual penalty may not
 * exceed it in the aggregate.
 */
export const RENT_DEPOSIT_MAX_MULTIPLE: LegalFact<number> = {
  value: 3,
  law: '§ 2254 odst. 1 zák. č. 89/2012 Sb.',
  effectiveFrom: '2017-02-28',
  lastVerified: '2026-08-26',
  source: 'https://www.zakonyprolidi.cz/cs/2016-460 (bod 27)',
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

// ─── Prodlení s placením (nař. vl. č. 351/2013 Sb.) ──────────────────────────

/**
 * Points added to the ČNB repo rate to give the statutory default interest.
 *
 * Deliberately only the spread. The rate itself is repo + 8, where "repo" is
 * the rate on the first day of the calendar half-year IN WHICH THE DEFAULT
 * BEGAN — so it is neither a constant nor a figure that can be looked up once
 * and reused. Freezing a percentage here would put a number in every demand
 * letter that goes wrong twice a year and is wrong from the start for any debt
 * that fell due in an earlier half-year.
 */
export const DEFAULT_INTEREST_SPREAD_POINTS: LegalFact<number> = {
  value: 8,
  law: '§ 2 odst. 1 nař. vl. č. 351/2013 Sb.',
  effectiveFrom: '2014-01-01',
  lastVerified: '2026-08-23',
  source: 'https://www.zakonyprolidi.cz/cs/2013-351',
  note:
    'Sazba = repo sazba ČNB pro první den kalendářního pololetí, v němž došlo ' +
    'k prodlení, + 8 procentních bodů. Repo sazbu je nutné dohledat u ČNB — ' +
    'nikdy ji sem nezmrazuj.',
}

/** Minimum costs of asserting each claim between businesses. */
export const LATE_PAYMENT_MIN_COSTS_CZK: LegalFact<number> = {
  value: 1_200,
  law: '§ 3 nař. vl. č. 351/2013 Sb.',
  effectiveFrom: '2014-01-01',
  lastVerified: '2026-08-23',
  source: 'https://www.zakonyprolidi.cz/cs/2013-351',
  note: 'Jen u vzájemného závazku podnikatelů, popř. podnikatele a veřejného zadavatele.',
}

// ─── Nelegální práce (zák. č. 435/2004 Sb.) ──────────────────────────────────

/**
 * Ceiling for allowing dependent work outside an employment relationship —
 * švarcsystém. It falls on the client, not the provider.
 */
export const ILLEGAL_WORK_FINE_MAX_CZK: LegalFact<number> = {
  value: 10_000_000,
  law: '§ 140 odst. 4 písm. f) zák. č. 435/2004 Sb.',
  effectiveFrom: '2012-01-01',
  lastVerified: '2026-08-23',
  source: 'https://www.zakonyprolidi.cz/cs/2004-435',
  note: 'Vedle pokuty lze uložit zákaz činnosti až na 2 roky a zveřejnění rozhodnutí.',
}

/** Floor for the same offence — the part that makes it bite on small cases. */
export const ILLEGAL_WORK_FINE_MIN_CZK: LegalFact<number> = {
  value: 50_000,
  law: '§ 140 odst. 4 písm. f) zák. č. 435/2004 Sb.',
  effectiveFrom: '2012-01-01',
  lastVerified: '2026-08-23',
  source: 'https://www.zakonyprolidi.cz/cs/2004-435',
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
  { key: 'MINIMUM_HOURLY_WAGE_CZK', fact: MINIMUM_HOURLY_WAGE_CZK },
  { key: 'PROBATION_MAX_MONTHS', fact: PROBATION_MAX_MONTHS },
  { key: 'PROBATION_MAX_MONTHS_MANAGER', fact: PROBATION_MAX_MONTHS_MANAGER },
  { key: 'FIXED_TERM_MAX_YEARS', fact: FIXED_TERM_MAX_YEARS },
  { key: 'MIN_VACATION_WEEKS', fact: MIN_VACATION_WEEKS },
  { key: 'RENT_DEPOSIT_MAX_MULTIPLE', fact: RENT_DEPOSIT_MAX_MULTIPLE },
  { key: 'CASH_PAYMENT_LIMIT_CZK', fact: CASH_PAYMENT_LIMIT_CZK },
  { key: 'DEFAULT_INTEREST_SPREAD_POINTS', fact: DEFAULT_INTEREST_SPREAD_POINTS },
  { key: 'LATE_PAYMENT_MIN_COSTS_CZK', fact: LATE_PAYMENT_MIN_COSTS_CZK },
  { key: 'ILLEGAL_WORK_FINE_MAX_CZK', fact: ILLEGAL_WORK_FINE_MAX_CZK },
  { key: 'ILLEGAL_WORK_FINE_MIN_CZK', fact: ILLEGAL_WORK_FINE_MIN_CZK },
]
