/**
 * System prompt facade — Czech law (CZ).
 *
 * The CZ prompt bundle lives in lib/contracts/prompts/cz.ts.
 * This file is a thin facade so the rest of the codebase only sees:
 *
 *   buildSystemPrompt(aiInstructions, jurisdiction)
 *   getSelfCheckPrompt(jurisdiction)
 *
 * Jurisdiction parameter kept for backward compatibility but always uses CZ.
 */

import type { Jurisdiction } from './types'
import { getPromptBundle } from './prompts'

/**
 * Builds the complete system prompt for a contract type.
 * Appends the schema's aiInstructions under a Czech "Specific provisions" header.
 */
export function buildSystemPrompt(aiInstructions: string, _jurisdiction?: Jurisdiction): string {
  const bundle = getPromptBundle()
  return `${bundle.systemPrompt}\n\n## Specifická ustanovení pro tento typ smlouvy\n\n${aiInstructions}`
}

/** Returns the Stage 3 self-check (premium polish) prompt. */
export function getSelfCheckPrompt(_jurisdiction?: Jurisdiction): string {
  return getPromptBundle().selfCheckPrompt
}

// ─── Backward compatibility ──────────────────────────────────────────────────
// Older modules still import these constants. They remain exported but always
// resolve to the CZ bundle so the existing CZ pipeline keeps working unchanged.

import { cz as _cz } from './prompts/cz'

/** @deprecated Use buildSystemPrompt(instructions, jurisdiction) — defaults to CZ. */
export const CZECH_LAW_SYSTEM_PROMPT = _cz.systemPrompt

/** @deprecated Use getSelfCheckPrompt(jurisdiction) — defaults to CZ. */
export const SELF_CHECK_SYSTEM_PROMPT = _cz.selfCheckPrompt
