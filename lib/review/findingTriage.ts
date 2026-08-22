/**
 * Moves findings that are filed as risks but conclude the clause is lawful.
 *
 * A real review returned three "risky clauses", two of which said in their own
 * explanation that the provision "je v souladu se zákonem" and then suggested a
 * refinement. Compliance stated as a risk is not a small presentational flaw:
 * the user sees a red badge and a severity next to a clause that is, by the
 * review's own reasoning, fine. It erodes trust in the findings that matter.
 *
 * The observation itself can still be worth having, so it moves to the
 * negotiation points rather than being discarded — that is where "this is
 * lawful but could be sharper" belongs.
 *
 * The prompt asks for the same discipline. This is the part that does not
 * depend on the model complying.
 */

/** The review declaring the clause lawful. */
const STATES_COMPLIANCE =
  /\bv\s+souladu\s+se\s+zákon\w*|\bodpovídá\s+zákon\w*|\bje\s+v\s+pořádku\b|\bneodporuje\s+zákon\w*/i

/**
 * Anything that means the opposite. Checked across the whole finding, because
 * "není v souladu se zákonem" contains the compliance phrase verbatim and a
 * naive match would reclassify a genuine defect into a negotiating point —
 * silencing a real warning, which is far worse than the flaw being fixed.
 */
const CONTRADICTS_COMPLIANCE =
  /\bnení\s+v\s+souladu|\bnejsou\s+v\s+souladu|\bv\s+rozporu\s+s|\bporušuje\b|\bneplatn\w*|\bnepřihlíží\s+se|\bzdánliv\w*|\bnevymahateln\w*/i

interface RiskyLike {
  title?: string
  explanation?: string
  suggestedRevision?: string
}

export interface TriageResult<T> {
  /** Findings that remain genuine risks. */
  risky: T[]
  /** Lawful-but-improvable observations, phrased as negotiation points. */
  movedToNegotiation: string[]
}

function fullText(finding: RiskyLike): string {
  return [finding.title, finding.explanation].filter(Boolean).join(' ')
}

/**
 * True when the finding's own reasoning concludes the clause is lawful and
 * nothing in it says otherwise.
 */
export function statesCompliance(finding: RiskyLike): boolean {
  const text = fullText(finding)
  if (!text) return false
  return STATES_COMPLIANCE.test(text) && !CONTRADICTS_COMPLIANCE.test(text)
}

/**
 * Splits risky clauses into real risks and lawful-but-improvable observations.
 */
export function triageRiskyClauses<T extends RiskyLike>(clauses: T[]): TriageResult<T> {
  const risky: T[] = []
  const movedToNegotiation: string[] = []

  for (const clause of clauses) {
    if (!statesCompliance(clause)) {
      risky.push(clause)
      continue
    }

    const title = clause.title?.trim()
    const suggestion = clause.suggestedRevision?.trim()

    movedToNegotiation.push(
      suggestion && title
        ? `${title} — ustanovení je v souladu se zákonem, prostor pro vyjednání: ${suggestion}`
        : title
          ? `${title} — ustanovení je v souladu se zákonem, lze jej upřesnit`
          : 'Ustanovení je v souladu se zákonem, lze jej upřesnit',
    )

    console.warn(
      `[review] Reclassified "${title ?? '?'}" from risk to negotiation point — ` +
        'its own explanation states the clause complies with the law',
    )
  }

  return { risky, movedToNegotiation }
}
