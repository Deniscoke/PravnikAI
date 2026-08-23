/**
 * Detects superseded Czech law in generated text — Právo365
 *
 * WHY THIS IS NEEDED EVEN THOUGH THE PROMPT SAYS THE RIGHT THING
 *
 * The model has read the pre-2025 Czech internet many thousands of times and
 * the post-flexinovela version perhaps a handful. Told the correct probation
 * limit in the prompt, it will still reach for "nejvýše 3 měsíce" when it
 * writes prose, because that is the phrase it has seen. A prompt is a request;
 * this is a check.
 *
 * PROXIMITY, NOT KEYWORDS
 *
 * Every number here is perfectly legitimate somewhere else. "Tři měsíce" is the
 * correct notice period for a residential lease; "šestinásobek" is a fine word.
 * A rule only fires when the stale value appears *together with* the subject it
 * would be wrong about, inside a short window of text. Matching on the number
 * alone would flag correct contracts, which is worse than missing the odd
 * stale one.
 */

import {
  MINIMUM_MONTHLY_WAGE_CZK,
  PROBATION_MAX_MONTHS,
  PROBATION_MAX_MONTHS_MANAGER,
  RENT_DEPOSIT_MAX_MULTIPLE,
  CASH_PAYMENT_LIMIT_CZK,
  formatCzk,
} from './czechLegalFacts'

export interface StaleLawFinding {
  /** Stable identifier for the rule that fired. */
  id: string
  /** What the text appears to claim. */
  claim: string
  /** What the law actually says now, with the provision. */
  correction: string
  /** The date the law changed — useful when explaining why a template is wrong. */
  changedOn: string
}

interface StaleLawRule {
  id: string
  /** The subject the claim is about. */
  subject: RegExp
  /** The superseded value, as it tends to be written. */
  staleValue: RegExp
  /**
   * Optional third signal that the text is stating a limit rather than merely
   * mentioning a number. Omit where the stale value is unambiguous on its own.
   */
  assertsLimit?: RegExp
  /** How far apart the signals may be, in characters. */
  window: number
  /**
   * Must appear somewhere in the text for the rule to apply at all.
   *
   * Some repealed rules were only ever about one area of law. The notice period
   * is the case in point: the flexinovela changed when it starts for an
   * employment relationship, and left § 2286 alone, so a lease notice saying it
   * runs from the first of the following month is still correct.
   */
  context?: RegExp
  /** Suppresses the rule when the text is clearly about something else. */
  notContext?: RegExp
  claim: string
  correction: string
  changedOn: string
}

/** True when `needle` matches somewhere inside a window centred on `at`. */
function matchesNear(text: string, needle: RegExp, at: number, window: number): boolean {
  const start = Math.max(0, at - window)
  return needle.test(text.slice(start, at + window))
}

const RULES: StaleLawRule[] = [
  {
    id: 'stale-probation-3-6',
    subject: /zkušebn[ií]\s+dob/i,
    staleValue: /\b(3|tři|tři)\s*(měsíc\w*)|\b(6|šest)\s*(měsíc\w*)/i,
    assertsLimit: /nejvýše|maximáln|max\.|nesmí\s+(být\s+)?(delší|přesáhnout)|nejdéle/i,
    window: 160,
    claim: 'Zkušební doba nejvýše 3 měsíce (6 u vedoucích).',
    correction:
      `Od 1. 6. 2025 činí maximum ${PROBATION_MAX_MONTHS.value} měsíce, ` +
      `u vedoucího zaměstnance ${PROBATION_MAX_MONTHS_MANAGER.value} měsíců ` +
      `(${PROBATION_MAX_MONTHS.law}, ve znění zák. č. 120/2025 Sb.).`,
    changedOn: '2025-06-01',
  },
  {
    id: 'stale-notice-period-start',
    subject: /výpovědn[ií]\s+dob/i,
    // Employment only. § 2286 still starts a lease notice period on the first
    // of the following month, so firing there would tell a user their correct
    // notice is based on repealed law.
    context: /zákoník\s+práce|pracovní\s+poměr|zaměstnan|262\/2006/i,
    notContext: /nájem|nájemc|pronajímatel|2286|89\/2012/i,
    // Czech declension: prvním/prvního/první dnem/dne, in either word order.
    // Note \S* rather than \w* — JavaScript's \w is ASCII-only, so it stops
    // dead at the first diacritic. Every suffix pattern in this file has to
    // account for that.
    staleValue:
      /prvn\S*\s+dn\S*\s+(kalendářního\s+)?měsíce\s+následující|následující\S*\s+(kalendářního\s+)?měsíce/i,
    window: 200,
    claim: 'Výpovědní doba začíná prvním dnem následujícího kalendářního měsíce.',
    correction:
      'Od 1. 6. 2025 běží výpovědní doba ode dne doručení výpovědi ' +
      '(§ 51 zák. č. 262/2006 Sb., ve znění zák. č. 120/2025 Sb.). ' +
      'Pravidlo o počítání času podle § 333 ZP se nepoužije.',
    changedOn: '2025-06-01',
  },
  {
    id: 'stale-severance-twelve-injury',
    subject: /odstupn\S*/i,
    // Only fires where the text ties it to injury or occupational disease.
    staleValue: /pracovní\S*\s+úraz|nemoc\S*\s+z\s+povolání/i,
    assertsLimit: /dvanáctinásob|12násob|12\s*×|dvanácti\S*\s+měsíčn/i,
    window: 220,
    claim: 'Dvanáctinásobné odstupné při pracovním úrazu nebo nemoci z povolání.',
    correction:
      'Od 1. 6. 2025 náleží dvanáctinásobek průměrného výdělku pouze při skončení ' +
      'poměru z důvodu dosažení nejvyšší přípustné expozice na pracovišti ' +
      '(§ 67 odst. 3 zák. č. 262/2006 Sb., ve znění zák. č. 120/2025 Sb.). ' +
      'U pracovního úrazu a nemoci z povolání je nahradila jednorázová náhrada.',
    changedOn: '2025-06-01',
  },
  {
    id: 'stale-minimum-wage',
    subject: /minimáln[ií]\s+mzd/i,
    // Exactly the monthly minimum wages that have applied since 2020, and
    // nothing else. A looser pattern would flag a lawfully agreed salary that
    // merely sits near the words "minimální mzda" and diagnose it wrongly.
    staleValue: /\b(14\s?600|15\s?200|16\s?200|17\s?300|18\s?900|20\s?800)\b/,
    window: 200,
    claim: 'Zastaralá výše minimální mzdy.',
    correction:
      `Od ${MINIMUM_MONTHLY_WAGE_CZK.effectiveFrom} činí minimální mzda ` +
      `${formatCzk(MINIMUM_MONTHLY_WAGE_CZK.value)} měsíčně (${MINIMUM_MONTHLY_WAGE_CZK.law}). ` +
      'Hodnota se indexuje a mění každý leden.',
    changedOn: MINIMUM_MONTHLY_WAGE_CZK.effectiveFrom,
  },
  {
    id: 'stale-deposit-sixfold',
    subject: /jistot|kauc/i,
    staleValue: /šestinásob|6násob|6\s*×\s*(měsíčn|nájemn)|šesti\s*měsíčn/i,
    window: 160,
    claim: 'Jistota až šestinásobek měsíčního nájemného.',
    correction:
      `Od 1. 7. 2020 činí maximum ${RENT_DEPOSIT_MAX_MULTIPLE.value}násobek měsíčního ` +
      `nájemného (${RENT_DEPOSIT_MAX_MULTIPLE.law}, ve znění zák. č. 163/2020 Sb.).`,
    changedOn: '2020-07-01',
  },
  {
    id: 'stale-cash-limit-350k',
    subject: /hotovost/i,
    staleValue: /350\s?000/,
    window: 160,
    claim: 'Limit plateb v hotovosti 350 000 Kč.',
    correction:
      `Limit činí ${formatCzk(CASH_PAYMENT_LIMIT_CZK.value)} za jeden den ` +
      `(${CASH_PAYMENT_LIMIT_CZK.law}).`,
    changedOn: '2019-01-01',
  },
  {
    id: 'stale-consumer-warranty-as-zaruka',
    subject: /záruk/i,
    staleValue: /24\s*měsíc|dvacet\s?čtyři\s*měsíc|dva\s+roky|dvoulet/i,
    assertsLimit: /ze\s+zákona|zákonn|povinn|nárok/i,
    window: 120,
    claim: 'Zákonná „záruka 24 měsíců".',
    correction:
      'Od 6. 1. 2023 zákon nezná zákonnou záruku, ale práva z vadného plnění: ' +
      'spotřebitel může vytknout vadu, která se projeví do dvou let od převzetí ' +
      '(§ 2165 zák. č. 89/2012 Sb., ve znění zák. č. 374/2022 Sb.). ' +
      'Záruka za jakost je dobrovolný závazek navíc.',
    changedOn: '2023-01-06',
  },
]

/**
 * Returns every superseded statement found in the text. Empty means nothing
 * matched — not that the text is legally correct, only that it does not repeat
 * one of the known outdated rules.
 */
export function findStaleLaw(text: string): StaleLawFinding[] {
  if (!text) return []

  const findings: StaleLawFinding[] = []

  for (const rule of RULES) {
    if (rule.context && !rule.context.test(text)) continue
    if (rule.notContext && rule.notContext.test(text)) continue

    const subject = new RegExp(rule.subject.source, rule.subject.flags.replace('g', '') + 'g')
    let match: RegExpExecArray | null
    let fired = false

    while (!fired && (match = subject.exec(text)) !== null) {
      const at = match.index
      if (!matchesNear(text, rule.staleValue, at, rule.window)) continue
      if (rule.assertsLimit && !matchesNear(text, rule.assertsLimit, at, rule.window)) continue

      findings.push({
        id: rule.id,
        claim: rule.claim,
        correction: rule.correction,
        changedOn: rule.changedOn,
      })
      fired = true
    }
  }

  return findings
}

/** Convenience predicate for callers that only need to know whether to withhold. */
export function hasStaleLaw(text: string): boolean {
  return findStaleLaw(text).length > 0
}
