'use client'

/**
 * History list — dashboard component.
 *
 * Displays contract generations and reviews as tabbed lists.
 * Supports view details, delete (soft-delete), and empty states.
 */

import React, { useState, useTransition } from 'react'
import { deleteHistoryItem } from '@/lib/supabase/actions'
import type { ContractGenerationHistory, ContractReviewHistory } from '@/lib/supabase/types'

// ─── Lightweight row types for the list (no heavy content) ───────────────────

type GenerationRow = Pick<ContractGenerationHistory,
  'id' | 'schema_id' | 'title' | 'mode' | 'status' | 'created_at'
>

type ReviewRow = Pick<ContractReviewHistory,
  'id' | 'detected_contract_type' | 'title' | 'overall_risk' | 'status' | 'created_at'
>

interface HistoryListProps {
  generations: GenerationRow[]
  reviews: ReviewRow[]
}

type Tab = 'generations' | 'reviews'

export function HistoryList({ generations: initialGenerations, reviews: initialReviews }: HistoryListProps) {
  const [tab, setTab] = useState<Tab>('generations')
  const [generations, setGenerations] = useState(initialGenerations)
  const [reviews, setReviews] = useState(initialReviews)
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function handleDelete(id: string, type: 'generation' | 'review') {
    if (!confirm('Opravdu chcete smazat tento záznam?')) return
    setDeletingId(id)

    startTransition(async () => {
      try {
        await deleteHistoryItem(id, type)
        if (type === 'generation') {
          setGenerations((prev) => prev.filter((g) => g.id !== id))
        } else {
          setReviews((prev) => prev.filter((r) => r.id !== id))
        }
      } catch {
        alert('Smazání se nezdařilo. Zkuste to znovu.')
      } finally {
        setDeletingId(null)
      }
    })
  }

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-xs)', marginBottom: 'var(--space-lg)' }}>
        <TabButton active={tab === 'generations'} onClick={() => setTab('generations')} count={generations.length}>
          Generované smlouvy
        </TabButton>
        <TabButton active={tab === 'reviews'} onClick={() => setTab('reviews')} count={reviews.length}>
          Kontroly smluv
        </TabButton>
      </div>

      {/* Generation history */}
      {tab === 'generations' && (
        generations.length === 0 ? (
          <EmptyState
            icon="&#128196;"
            title="Zatím žádné generované smlouvy"
            description="Vytvořte první smlouvu pomocí generátoru a uloží se sem automaticky."
            actionHref="/generator"
            actionLabel="Generovat smlouvu"
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {generations.map((g) => (
              <HistoryCard
                key={g.id}
                id={g.id}
                title={g.title}
                subtitle={g.schema_id.replace(/-v\d+$/, '').replace(/-/g, ' ')}
                badge={g.mode}
                badgeClass={g.mode === 'complete' ? 'complete' : g.mode === 'draft' ? 'draft' : 'review'}
                timestamp={g.created_at}
                viewHref={`/generator/${g.id}`}
                onDelete={() => handleDelete(g.id, 'generation')}
                isDeleting={deletingId === g.id}
              />
            ))}
          </div>
        )
      )}

      {/* Review history */}
      {tab === 'reviews' && (
        reviews.length === 0 ? (
          <EmptyState
            icon="&#128269;"
            title="Zatím žádné kontroly smluv"
            description="Zkontrolujte existující smlouvu a výsledky se uloží sem automaticky."
            actionHref="/review"
            actionLabel="Zkontrolovat smlouvu"
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {reviews.map((r) => (
              <HistoryCard
                key={r.id}
                id={r.id}
                title={r.title}
                subtitle={r.detected_contract_type || 'Neznámý typ'}
                badge={r.overall_risk}
                badgeClass={r.overall_risk === 'low' ? 'complete' : r.overall_risk === 'medium' ? 'draft' : 'review'}
                timestamp={r.created_at}
                viewHref={`/review/${r.id}`}
                onDelete={() => handleDelete(r.id, 'review')}
                isDeleting={deletingId === r.id}
              />
            ))}
          </div>
        )
      )}
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean
  onClick: () => void
  count: number
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 16px',
        fontSize: '0.82rem',
        fontWeight: active ? 600 : 400,
        color: active ? 'var(--accent-aqua)' : 'var(--color-text-muted)',
        background: active ? 'rgba(94,231,223,0.08)' : 'transparent',
        border: `1px solid ${active ? 'rgba(94,231,223,0.2)' : 'var(--glass-border-subtle)'}`,
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        transition: 'all 150ms ease',
      }}
    >
      {children}
      <span style={{
        marginLeft: 'var(--space-xs)',
        fontSize: '0.7rem',
        opacity: 0.6,
        fontFamily: 'monospace',
      }}>
        {count}
      </span>
    </button>
  )
}

function HistoryCard({
  id,
  title,
  subtitle,
  badge,
  badgeClass,
  timestamp,
  viewHref,
  onDelete,
  isDeleting,
}: {
  id: string
  title: string
  subtitle: string
  badge: string
  badgeClass: string
  timestamp: string
  viewHref: string
  onDelete: () => void
  isDeleting: boolean
}) {
  const date = new Date(timestamp).toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      className="glass-card"
      style={{
        padding: 'var(--space-md) var(--space-lg)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-md)',
        opacity: isDeleting ? 0.5 : 1,
        transition: 'opacity 200ms ease',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 2 }}>
          <h3 style={{ fontSize: '0.88rem', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {title}
          </h3>
          <span className={`badge badge--${badgeClass}`} style={{ fontSize: '0.6rem', flexShrink: 0 }}>
            {badge.toUpperCase()}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-md)', fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>
          <span>{subtitle}</span>
          <span>{date}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-xs)', alignItems: 'center' }}>
        <a
          href={viewHref}
          title="Zobrazit detail"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--accent-aqua)',
            padding: 'var(--space-xs)',
            borderRadius: 4,
            fontSize: '0.75rem',
            fontWeight: 500,
            textDecoration: 'none',
            opacity: 0.8,
            transition: 'opacity 150ms',
          }}
          aria-label={`Zobrazit ${title}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Zobrazit
        </a>
        <button
          onClick={onDelete}
          disabled={isDeleting}
          title="Smazat"
          style={{
            background: 'none',
            border: 'none',
            cursor: isDeleting ? 'default' : 'pointer',
            color: 'var(--color-text-subtle)',
            padding: 'var(--space-xs)',
            borderRadius: 4,
            opacity: 0.6,
            transition: 'opacity 150ms',
          }}
          aria-label={`Smazat ${title}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function EmptyState({
  icon,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  icon: string
  title: string
  description: string
  actionHref: string
  actionLabel: string
}) {
  return (
    <div className="glass-card" style={{
      padding: 'var(--space-3xl) var(--space-xl)',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-md)', opacity: 0.5 }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-xs)' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-lg)', maxWidth: 360, margin: '0 auto var(--space-lg)' }}>
        {description}
      </p>
      <a href={actionHref} className="glass-btn glass-btn--primary" style={{ textDecoration: 'none' }}>
        {actionLabel}
      </a>
    </div>
  )
}
