/**
 * PrávníkAI — Contract Review Type System
 * Jurisdiction: Czech Republic (CZ)
 *
 * Defines the request/response shapes for AI-assisted contract review.
 * The review flow is separate from generation — it takes existing contract
 * text and returns structured risk analysis under Czech law.
 */

// ─── Risk Levels ────────────────────────────────────────────────────────────

export type RiskLevel = 'low' | 'medium' | 'high'

// ─── Request ────────────────────────────────────────────────────────────────

export interface ReviewContractRequest {
  /** The pasted contract text to review */
  contractText: string
  /** Optional hint — improves analysis accuracy */
  contractTypeHint?: string
}

// ─── Response ───────────────────────────────────────────────────────────────

export interface RiskyClause {
  /** Short title, e.g. "Jednostranná změna podmínek" */
  title: string
  severity: RiskLevel
  /** Czech-law explanation of why this clause is risky */
  explanation: string
  /** Suggested alternative wording (optional) */
  suggestedRevision?: string
}

export interface MissingClause {
  /** What's missing, e.g. "Ustanovení o odstoupení od smlouvy" */
  title: string
  /** Why it should be included under Czech law */
  reason: string
  /** Suggested clause text (optional) */
  suggestedClause?: string
}

export interface ReviewContractResponse {
  /** Overall risk assessment */
  overallRisk: RiskLevel
  /** 2-4 sentence summary of the review findings */
  summary: string
  /** Clauses that may be problematic under Czech law */
  riskyClauses: RiskyClause[]
  /** Important clauses that are missing from the contract */
  missingClauses: MissingClause[]
  /** Plain-language flags for negotiation leverage */
  negotiationFlags: string[]
  /** Whether professional legal review is strongly recommended */
  lawyerReviewRequired: boolean
  /** Legal disclaimer — always included */
  disclaimer: string
  /** ISO 8601 timestamp */
  reviewedAt: string

  // ── Extended fields (v1.1) ─────────────────────────────────────────────

  /** AI-detected contract type, e.g. "Kupní smlouva" */
  detectedContractType?: string
  /** Assumptions the AI made during analysis */
  assumptions?: string[]
  /** Czech statutes referenced in the analysis */
  legalBasis?: string[]
  /** Always "ai-assisted-review" — makes the mode explicit in data */
  reviewMode?: 'ai-assisted-review'
}
