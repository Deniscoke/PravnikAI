/**
 * GET /review/[id] — View a saved contract review
 *
 * Server Component that loads a review from history and renders
 * the ReviewResult component with the saved data.
 */

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ReviewResult } from '@/components/review/ReviewResult'
import type { ReviewContractResponse } from '@/lib/review/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ReviewDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: review, error } = await supabase
    .from('contract_reviews_history')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error || !review) {
    redirect('/dashboard')
  }

  // review_result stores the full ReviewContractResponse as jsonb
  const result = review.review_result as unknown as ReviewContractResponse

  return (
    <main style={{ position: 'relative', zIndex: 1, minHeight: '100dvh', padding: '0 var(--space-md)' }}>
      <header style={{ maxWidth: 920, margin: '0 auto', padding: 'var(--space-xl) 0 var(--space-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.8rem',
                background: 'linear-gradient(135deg, var(--accent-aqua), var(--accent-violet))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1.2,
              }}>
                PrávníkAI
              </h1>
            </Link>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)', marginTop: 2 }}>
              {review.title} · Uložená kontrola
            </p>
          </div>
          <Link href="/dashboard" className="glass-btn glass-btn--ghost" style={{ textDecoration: 'none' }}>
            Zpět na přehled
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: 920, margin: '0 auto', paddingBottom: 'var(--space-3xl)' }}>
        <ReviewResult
          result={result}
          onNewReview="/review"
        />
      </div>
    </main>
  )
}
