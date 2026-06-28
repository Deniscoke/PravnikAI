/**
 * Structured AI usage logging — cost monitoring without exposing secrets.
 * Logs a single JSON line to stdout (captured by Vercel logs) for ops dashboards.
 */

export interface AiUsageRecord {
  userId: string
  action: 'generate' | 'review'
  model: string
  tokensUsed: number
  /** Rough USD estimate at common GPT-4o rates — for ops monitoring only */
  estimatedCostUsd?: number
}

/** Very rough estimate: ~$5 / 1M tokens blended (adjust in ops dashboards). */
export function estimateCostUsd(tokens: number): number {
  return Math.round((tokens / 1_000_000) * 5 * 10000) / 10000
}

export function logAiUsage(record: AiUsageRecord): void {
  const cost = record.estimatedCostUsd ?? estimateCostUsd(record.tokensUsed)
  console.info(
    JSON.stringify({
      event: 'ai_usage',
      userId: record.userId,
      action: record.action,
      model: record.model,
      tokensUsed: record.tokensUsed,
      estimatedCostUsd: cost,
      ts: new Date().toISOString(),
    }),
  )
}
