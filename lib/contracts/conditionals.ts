/**
 * Resolving the value a conditional field depends on.
 *
 * WHY THIS IS ITS OWN MODULE
 *
 * The same lookup was written four times — in the form renderer, the prompt
 * builder and twice in the validators — and every field-level copy looked only
 * inside the field's own section, while the section-level copies searched
 * everywhere. That difference was invisible until a schema put the controlling
 * field in a different section from the field it controls: the dependent field
 * then never became visible, never reached the prompt, and was never counted as
 * missing. Nobody could have filled it in.
 *
 * On a notice of termination the field that disappeared was the statutory
 * ground, without which the notice is void under § 2288. So one shared resolver,
 * used by everything that has to answer the same question.
 */

import type { NormalizedFormData } from './types'

/**
 * Finds the current value of the field a conditional points at.
 *
 * `fieldId` may be qualified as "sectionId.fieldId", in which case only that
 * section is consulted. An unqualified id is looked up in `currentSectionId`
 * first — the common case, and the one where two sections could otherwise
 * define the same name — and then anywhere in the form.
 */
export function resolveControlValue(
  data: NormalizedFormData,
  fieldId: string,
  currentSectionId?: string,
): string {
  const dotIndex = fieldId.indexOf('.')
  if (dotIndex !== -1) {
    const sectionId = fieldId.slice(0, dotIndex)
    const plainId = fieldId.slice(dotIndex + 1)
    return data.sections[sectionId]?.[plainId] ?? ''
  }

  if (currentSectionId) {
    const own = data.sections[currentSectionId]?.[fieldId]
    if (own !== undefined) return own
  }

  for (const values of Object.values(data.sections)) {
    if (fieldId in values) return values[fieldId]
  }

  return ''
}

/**
 * True when a conditional is satisfied, or when there is none.
 *
 * Values are compared as strings because form data is always string-valued,
 * while a schema may declare a numeric or boolean condition.
 *
 * An array means "any of these". Some fields belong to several branches at
 * once — on a reklamace the § 2171 ground is needed for a discount and for
 * withdrawal alike — and the alternative was declaring the same field twice,
 * which then has to be kept in step by hand.
 */
export function isConditionMet(
  conditional:
    | { fieldId: string; value: string | number | boolean | ReadonlyArray<string> }
    | undefined,
  data: NormalizedFormData,
  currentSectionId?: string,
): boolean {
  if (!conditional) return true
  const actual = resolveControlValue(data, conditional.fieldId, currentSectionId)
  if (Array.isArray(conditional.value)) {
    return conditional.value.some((candidate) => actual === String(candidate))
  }
  return actual === String(conditional.value)
}
