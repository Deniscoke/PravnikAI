/**
 * Per-jurisdiction prompt and string registry.
 *
 * Each jurisdiction (CZ / DE / UK) provides:
 *   - SYSTEM_PROMPT     : Senior-counsel persona + statutory framework
 *   - SELF_CHECK_PROMPT : Stage 3 polish prompt
 *   - QUALITY_GATE_LANG : Localized strings for the Stage 2 JSON-mode quality gate
 *   - PLACEHOLDERS      : The exact placeholder tokens used in output
 *                          (these are matched by the deterministic integrity validator)
 *   - MODE_HEADERS      : Banner text inserted at the top of draft / review-needed contracts
 *   - PROMPT_LANG       : Section labels and instructions used by promptBuilder.ts
 */

import { cz } from './cz'
import { de } from './de'
import { uk } from './uk'
import type { Jurisdiction } from '@/lib/contracts/types'

export interface PlaceholderTokens {
  /** Inline placeholder for missing data, e.g. "[DOPLNIT" / "[BITTE ERGÄNZEN" / "[TO COMPLETE" */
  fillToken: string
  /** Marker for fields requiring lawyer review, e.g. "⚠️ ZKONTROLOVAT" */
  reviewToken: string
  /** Inline-format example used in the prompt, e.g. "[DOPLNIT: jméno]" */
  fillExample: string
  /** Inline-format example for review marker, e.g. "⚠️ ZKONTROLOVAT — [DOPLNIT: ...]" */
  reviewExample: string
}

export interface ModeHeaders {
  /** Banner inserted at the very top of a draft-mode contract */
  draft: string
  /** Banner inserted at the very top of a review-needed-mode contract */
  reviewNeeded: string
}

export interface QualityGateLang {
  /** Label for the gate's overall summary in extracted warnings */
  summaryLabel: string
  /** Fallback summary message used when JSON parsing fails */
  fallbackSummary: string
  /** Heading for the missing-essential-facts warning */
  missingFactsLabel: string
  /** Heading for the missing-essential-clauses warning */
  missingClausesLabel: string
  /** Heading for the contradictions warning */
  contradictionsLabel: string
  /** Heading for inconsistent-terms warning */
  termsLabel: string
  /** Heading for risky-assumptions warning */
  assumptionsLabel: string
  /** Heading for jurisdiction-specific legal-risks warning */
  legalRisksLabel: string
  /** Heading for consumer / regulatory flags */
  regulatoryLabel: string
}

export interface PromptLang {
  /** Section A heading */
  contextHeading: string
  contractTypeLabel: string
  schemaIdLabel: string
  schemaVersionPrefix: string
  jurisdictionLabel: string
  jurisdictionValue: string
  legalBasisLabel: string
  partiesIntro: string

  /** Section B */
  dataHeading: string
  partiesSubheading: string
  contentSubheading: string
  noPartyData: string
  noContentData: string
  partyRolePrefix: string

  /** Section C */
  missingHeading: string
  allFieldsFilled: string
  generateCompleteHint: string
  criticalMissingHeading: string
  criticalMissingDesc: string
  optionalMissingHeading: string
  optionalMissingDesc: string
  placeholderLabel: string

  /** Section D — instructions */
  instructionsHeading: string
  modeCompleteBlock: string
  modeDraftBlock: string
  modeReviewBlock: string
  safetyRulesBlock: string

  /** Section E — output structure */
  outputHeading: string
  outputIntro: string
  formattingHeading: string
  formattingRules: string[]
  jurisdictionClauseLabel: string
  signatureRequiredLine: string
  signatureBlockSuffix: string

  /** Section F — quality check */
  qualityCheckHeading: string
  qualityCheckIntro: string
  qualityCheckBullets: string[]
  qualityCheckBulletComplete: string

  /** Section G — drafting posture */
  postureHeading: string
  postureIntro: string
  postureRepresentedHeading: string
  postureRepresentedBody: string
  postureRiskHeading: string
  postureRiskConservative: string[]
  postureRiskBalanced: string[]
  postureRiskAggressive: string[]
  postureNegotiationHeading: string
  postureNegProtective: string[]
  postureNegNeutral: string[]
  postureNegCompromise: string[]
  postureContextB2B: string[]
  postureContextConsumer: string[]
  postureContextEmployment: string[]
  postureContextOther: string[]
  postureMustIncludeHeading: string
  postureMustAvoidHeading: string
  postureSpecialHeading: string

  /** Top-level intro of user prompt */
  userPromptHeading: string
}

export interface PromptBundle {
  systemPrompt: string
  selfCheckPrompt: string
  qualityGateLang: QualityGateLang
  placeholders: PlaceholderTokens
  modeHeaders: ModeHeaders
  promptLang: PromptLang
  /** Generic essential clauses fallback when a schema is unknown to the gate. */
  genericEssentialClauses: string[]
}

const BUNDLES: Record<Jurisdiction, PromptBundle> = {
  CZ: cz,
  DE: de,
  UK: uk,
}

/** Returns the prompt bundle for a jurisdiction. */
export function getPromptBundle(jurisdiction: Jurisdiction): PromptBundle {
  return BUNDLES[jurisdiction]
}

export { cz, de, uk }
