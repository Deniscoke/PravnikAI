/**
 * LLM provider wrapper — OpenAI
 *
 * This is the ONLY file that imports the OpenAI SDK.
 * The rest of the codebase (route, schemas, validators, promptBuilder)
 * calls generateText() and remains provider-agnostic.
 *
 * Model strategy (configurable via env vars).
 * Code defaults are conservative IDs that resolve on typical API keys:
 *   - OPENAI_MODEL_DEFAULT → gpt-4o (Stage 1 draft + JSON when QUALITY_GATE unset)
 *   - OPENAI_MODEL_PREMIUM → gpt-4o (Stage 3 polish only)
 *   - OPENAI_MODEL_QUALITY_GATE → falls back to OPENAI_MODEL_DEFAULT
 *
 * Frontier (requires funded tier + model access — see OpenAI Models / rate limits):
 *   OPENAI_MODEL_DEFAULT=gpt-5.5
 *   OPENAI_MODEL_PREMIUM=gpt-5.5-pro
 *   OPENAI_MODEL_QUALITY_GATE=gpt-5.5
 *
 * Note: GPT-5.x / o-series Chat Completions use max_completion_tokens + reasoning_effort.
 *       gpt-4o*, gpt-5-chat*, etc. use max_tokens and must NOT receive reasoning_effort.
 *
 * To switch providers in future: replace this file only.
 */

import OpenAI from 'openai'

// Lazy singleton — instantiated on first use, not at build time.
// This prevents Next.js build failures when OPENAI_API_KEY is absent
// in the CI/build environment (e.g. Vercel build step).
let _openai: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (_openai) return _openai
  _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _openai
}

// ─── Model configuration ────────────────────────────────────────────────────

/** Default model for contract generation and structured review (Stage 1 + 2). */
function getDefaultModel(): string {
  return process.env.OPENAI_MODEL_DEFAULT?.trim() || 'gpt-4o'
}

/** Premium model for optional final-text polish — NEVER for structured JSON. */
function getPremiumModel(): string {
  return process.env.OPENAI_MODEL_PREMIUM?.trim() || 'gpt-4o'
}

/** Optional override for Stage 2 quality gate (cost optimisation). */
function getQualityGateModel(): string {
  return process.env.OPENAI_MODEL_QUALITY_GATE?.trim() || getDefaultModel()
}

/**
 * Temperature 0.1 — legal text must be deterministic and consistent,
 * not creative. Low temp avoids hallucinated clause variations.
 */
const TEMPERATURE = 0.1

/** Increased from 4096 to support longer, more thorough contracts */
const MAX_TOKENS = 16384

/**
 * GPT-5 *reasoning* SKUs bill hidden reasoning output tokens → use max_completion_tokens.
 * Exclude aliases like `gpt-5-chat-*` — they behave like ordinary chat completions.
 */
function needsMaxCompletionTokens(model: string): boolean {
  const m = model.trim().toLowerCase()
  if (/^o\d/.test(m)) return true
  if (!m.startsWith('gpt-5')) return false
  if (m.startsWith('gpt-5-chat')) return false
  return true
}

/** Only newer reasoning SKUs accept `reasoning_effort`; gpt-4o* rejects it (400). */
function supportsReasoningEffort(model: string): boolean {
  return needsMaxCompletionTokens(model)
}

// ─── Types ──────────────────────────────────────────────────────────────────

export type LLMStage = 'draft' | 'quality-gate' | 'premium' | 'review'

export interface LLMGenerateOptions {
  systemPrompt: string
  userPrompt: string
  /** Override default temperature (0.1) for this call */
  temperature?: number
  /** Override max output budget (16384). Mapped to max_completion_tokens for GPT‑5 / o‑series, else max_tokens. */
  maxTokens?: number
  /** Request structured JSON output (requires "JSON" in system prompt) */
  jsonMode?: boolean
  /** Use premium model (gpt-4o by default) — only for final text, never for JSON */
  premium?: boolean
  /** Reasoning effort: 'low' | 'medium' | 'high' — default 'high' for legal drafting */
  reasoning?: 'low' | 'medium' | 'high'
  /**
   * Stage hint used to pick the correct model variant.
   *   - 'draft' or 'review' → OPENAI_MODEL_DEFAULT
   *   - 'quality-gate'      → OPENAI_MODEL_QUALITY_GATE (or default)
   *   - 'premium'           → OPENAI_MODEL_PREMIUM (implies premium=true)
   */
  stage?: LLMStage
}

export interface LLMGenerateResult {
  text: string
  /** Total tokens used — useful for cost monitoring */
  tokensUsed: number
  /** Which model was actually used */
  model: string
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Calls OpenAI chat completions and returns the generated text.
 * Throws on API error — the caller is responsible for error handling.
 *
 * Model routing precedence:
 *   1. stage='premium' OR premium=true → OPENAI_MODEL_PREMIUM
 *   2. stage='quality-gate'            → OPENAI_MODEL_QUALITY_GATE
 *   3. otherwise                       → OPENAI_MODEL_DEFAULT
 *
 * Per-call overrides (temperature, maxTokens, jsonMode, reasoning) take
 * precedence over module-level defaults without changing them globally.
 */
export async function generateText(options: LLMGenerateOptions): Promise<LLMGenerateResult> {
  const usePremium = options.premium === true || options.stage === 'premium'

  // Guard: premium model must NOT be used for structured JSON output
  if (usePremium && options.jsonMode) {
    throw new Error(
      'Configuration error: premium model must not be used with jsonMode. ' +
      'Use the default model (OPENAI_MODEL_DEFAULT) for structured JSON outputs.',
    )
  }

  const model = usePremium
    ? getPremiumModel()
    : options.stage === 'quality-gate'
      ? getQualityGateModel()
      : getDefaultModel()

  const reasoning = options.reasoning ?? 'high'
  const tokenLimit = options.maxTokens ?? MAX_TOKENS

  const completion = await getOpenAI().chat.completions.create({
    model,
    temperature: options.temperature ?? TEMPERATURE,
    ...(needsMaxCompletionTokens(model)
      ? { max_completion_tokens: tokenLimit }
      : { max_tokens: tokenLimit }),
    messages: [
      { role: 'system', content: options.systemPrompt },
      { role: 'user', content: options.userPrompt },
    ],
    ...(options.jsonMode ? { response_format: { type: 'json_object' as const } } : {}),
    // Reasoning models: only when API supports `reasoning_effort` for this SKU.
    ...(supportsReasoningEffort(model) && reasoning !== 'medium'
      ? { reasoning_effort: reasoning }
      : {}),
  })

  const choice = completion.choices[0]
  if (!choice?.message?.content) {
    throw new Error('OpenAI returned an empty response')
  }

  return {
    text: choice.message.content,
    tokensUsed: completion.usage?.total_tokens ?? 0,
    model,
  }
}

/** Read-only helpers for tests / diagnostics. */
export const __modelConfig = {
  getDefaultModel,
  getPremiumModel,
  getQualityGateModel,
}
