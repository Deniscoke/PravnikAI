/**
 * System prompt router — picks the right per-jurisdiction system + self-check prompt.
 *
 * Each jurisdiction has its own bundle in lib/contracts/prompts/{cz,de,uk}.ts.
 * The actual prompt content (legal framework, terminology, statutes) lives there;
 * this file is a thin facade so the rest of the codebase only sees:
 *
 *   buildSystemPrompt(aiInstructions, jurisdiction)
 *   getSelfCheckPrompt(jurisdiction)
 */

import type { Jurisdiction } from './types'
import { getPromptBundle } from './prompts'

/**
 * Builds the complete system prompt for a specific contract type & jurisdiction.
 * Appends the schema's aiInstructions verbatim under a "Specific provisions" header
 * (translated per jurisdiction).
 */
export function buildSystemPrompt(aiInstructions: string, jurisdiction: Jurisdiction): string {
  const bundle = getPromptBundle(jurisdiction)
  const heading =
    jurisdiction === 'DE'
      ? '## Spezifische Bestimmungen für diese Vertragsart'
      : jurisdiction === 'UK'
        ? '## Specific provisions for this contract type'
        : '## Specifická ustanovení pro tento typ smlouvy'

  return `${bundle.systemPrompt}\n\n${heading}\n\n${aiInstructions}`
}

/** Returns the Stage 3 self-check (premium polish) prompt for a jurisdiction. */
export function getSelfCheckPrompt(jurisdiction: Jurisdiction): string {
  return getPromptBundle(jurisdiction).selfCheckPrompt
}

// ─── Backward compatibility ──────────────────────────────────────────────────
// Older modules still import these constants. They remain exported but always
// resolve to the CZ bundle so the existing CZ pipeline keeps working unchanged.

import { cz as _cz } from './prompts/cz'

/** @deprecated Use buildSystemPrompt(instructions, jurisdiction) — defaults to CZ. */
export const CZECH_LAW_SYSTEM_PROMPT = _cz.systemPrompt

/** @deprecated Use getSelfCheckPrompt(jurisdiction) — defaults to CZ. */
export const SELF_CHECK_SYSTEM_PROMPT = _cz.selfCheckPrompt
