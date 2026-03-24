/**
 * GET /generator/[id] — View a saved contract generation
 *
 * Server Component that loads a contract from history and renders
 * the ContractResult component with the saved data.
 */

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ContractResult } from '@/components/contract/ContractResult'
import { getSchema } from '@/lib/contracts/contractSchemas'
import type { GenerateContractResponse } from '@/lib/contracts/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function GenerationDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: generation, error } = await supabase
    .from('contract_generations_history')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error || !generation) {
    redirect('/dashboard')
  }

  // Reconstruct the GenerateContractResponse from stored data
  const result: GenerateContractResponse = {
    schemaId: generation.schema_id,
    mode: generation.mode,
    contractText: generation.contract_text ?? '',
    warnings: generation.warnings ?? [],
    missingFields: [],
    legalBasis: generation.legal_basis ?? [],
    generatedAt: generation.created_at,
  }

  const schema = getSchema(generation.schema_id)
  const contractName = schema?.metadata.name ?? generation.title

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
              {contractName} · Uložená smlouva
            </p>
          </div>
          <Link href="/dashboard" className="glass-btn glass-btn--ghost" style={{ textDecoration: 'none' }}>
            Zpět na přehled
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: 920, margin: '0 auto', paddingBottom: 'var(--space-3xl)' }}>
        <ContractResult
          result={result}
          contractName={contractName}
          onBack="/dashboard"
          onReset="/generator"
        />
      </div>
    </main>
  )
}
