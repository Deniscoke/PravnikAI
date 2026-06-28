/**
 * UI-only detection of unresolved markers in generated contract text.
 *
 * Used by the pre-export gate (ContractResult) to warn the user before a
 * DOCX/PDF download when the working draft still contains placeholders or
 * review markers. Pure string scan — no coupling to the AI pipeline or the
 * server-side integrity validator.
 */

export interface UnresolvedMarkers {
  /** Total unresolved items (placeholders + review markers). */
  count: number
  /** Number of [DOPLNIT] / [DOPLNIT: …] placeholders. */
  placeholders: number
  /** Number of ⚠️ ZKONTROLOVAT review markers. */
  reviewMarkers: number
}

// Matches [DOPLNIT] and [DOPLNIT: popis] (Czech fill placeholder).
const PLACEHOLDER_RE = /\[DOPLNIT(?::[^\]]*)?\]/g
// Matches the Czech review marker emitted in review-needed mode.
const REVIEW_MARKER_RE = /⚠️\s*ZKONTROLOVAT/g

/**
 * Scans contract text for unresolved [DOPLNIT] placeholders and
 * ⚠️ ZKONTROLOVAT review markers. Returns zero counts for empty/clean text.
 */
export function findUnresolvedMarkers(text: string): UnresolvedMarkers {
  if (!text) return { count: 0, placeholders: 0, reviewMarkers: 0 }
  const placeholders = (text.match(PLACEHOLDER_RE) ?? []).length
  const reviewMarkers = (text.match(REVIEW_MARKER_RE) ?? []).length
  return { count: placeholders + reviewMarkers, placeholders, reviewMarkers }
}
