/**
 * Guard for suggested clause wording in a contract review.
 *
 * A suggested revision is the most dangerous thing the review can output: the
 * user copies it straight into a contract. A description that is merely vague
 * costs nothing; a suggestion built on an institute Czech law does not know can
 * do real harm.
 *
 * This catches one concrete, observed failure — treating non-payment as a cause
 * of invalidity. Under Czech law invalidity attaches to defects at formation
 * (§ 574 and following NOZ); failure to pay is a breach, answered by withdrawal
 * from the contract (§ 2001–2005), default interest, or a condition subsequent
 * (§ 548). "If the price is not paid, the contract is deemed invalid" is not a
 * remedy the law recognises.
 *
 * The prompt says the same thing, but a prompt is a request, not a guarantee.
 *
 * It also refuses wording that repeats superseded law — see lib/legal/staleLawGuard.
 */

import { findStaleLaw } from '@/lib/legal/staleLawGuard'

/** Non-performance being described. */
const NON_PERFORMANCE = /nezaplac|neuhraz|nezaplat|neuhrad|prodlen[ií]|nedodrž/i

/** A claim that the contract (or a provision) becomes invalid. */
const INVALIDITY_CLAIM = /neplatn(á|é|ý|ou|ost|osti)/i

/**
 * True when the text ties non-performance to invalidity — the construction that
 * looks authoritative and is legally incoherent.
 */
export function hasIncoherentInvalidityRemedy(text: string): boolean {
  if (!text) return false
  return NON_PERFORMANCE.test(text) && INVALIDITY_CLAIM.test(text)
}

/**
 * Returns the suggestion when it is safe to show, or undefined when it should be
 * withheld. Withholding keeps the finding — the user still learns what the
 * problem is, just without wording that would hurt them.
 */
export function sanitizeSuggestion(suggestion: string | undefined): string | undefined {
  if (!suggestion) return undefined

  if (hasIncoherentInvalidityRemedy(suggestion)) {
    console.warn('[review] Withheld a suggested wording tying non-payment to invalidity')
    return undefined
  }

  // Wording that repeats repealed law is the worst possible output here: it is
  // specific, quotable, and wrong. Better to leave the user with the finding
  // and no draft clause than with a clause from a law that no longer applies.
  const stale = findStaleLaw(suggestion)
  if (stale.length > 0) {
    console.warn(
      `[review] Withheld a suggested wording repeating superseded law: ${stale
        .map((f) => f.id)
        .join(', ')}`,
    )
    return undefined
  }

  return suggestion
}
