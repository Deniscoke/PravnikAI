/**
 * POST /api/export-docx
 *
 * Renders the generated contract text into a professionally typeset DOCX file.
 * Multi-jurisdiction (CZ / DE / UK) — header, footer and disclaimers adapt
 * to the schema's jurisdiction.
 *
 * Typography:
 *   - Body: Times New Roman, 11pt (CZ/DE) or 11.5pt (UK), justified, 1.4 line spacing
 *   - Headings: Articles I., II., ... in 13pt bold; sub-headings (§ markers) in 12pt bold
 *   - First-line indent on body paragraphs — standard legal practice
 *   - Page numbers in "Page X of Y" format, locale-localized
 *   - Header with contract title; footer with generator credit + legal basis
 *   - Mode banners (DRAFT / REVIEW REQUIRED) at the top in the contract language
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Header,
  Footer,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  PageNumber,
  NumberFormat,
} from 'docx'
import { assertBillingAccess, recordExport } from '@/lib/billing/guard'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { getSchema, resolveSchemaId } from '@/lib/contracts/contractSchemas'
import { getExportStrings, formatExportDate } from '@/lib/export/strings'
import type { Jurisdiction } from '@/lib/contracts/types'

// Force Node.js runtime — docx library uses Buffer and Node-specific APIs
export const runtime = 'nodejs'

/** Large contracts need headroom; Hobby tier still caps below this. */
export const maxDuration = 120

interface ExportRequest {
  contractText: string
  contractName: string
  mode: string
  schemaId: string
  generatedAt: string
  legalBasis: string[]
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── 0a. Rate limit ────────────────────────────────────────────────────────
  const ip = getClientIp(req.headers)
  const { allowed: rlAllowed, resetAt } = await checkRateLimit(ip, { max: 20, windowMs: 60_000 })
  if (!rlAllowed) {
    return NextResponse.json(
      { error: 'Too many requests. Try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)) } },
    )
  }

  // ── 0b. Billing guard ─────────────────────────────────────────────────────
  const guard = await assertBillingAccess('export')
  if (!guard.allowed) return guard.response

  let body: ExportRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.contractText || !body.contractName) {
    return NextResponse.json({ error: 'Missing contractText or contractName' }, { status: 400 })
  }

  if (body.contractText.length > 500_000) {
    return NextResponse.json({ error: 'Contract text too large' }, { status: 413 })
  }

  // ── Resolve jurisdiction from schemaId ────────────────────────────────────
  let jurisdiction: Jurisdiction = 'CZ'
  try {
    const schema = getSchema(resolveSchemaId(body.schemaId))
    jurisdiction = schema.metadata.jurisdiction
  } catch {
    // Unknown schemaId — keep default CZ
  }
  const strings = getExportStrings(jurisdiction)

  const safeLegalBasis = Array.isArray(body.legalBasis) ? body.legalBasis : []
  const { contractText, contractName, mode, schemaId, generatedAt } = body

  // ── Mode warning banner ───────────────────────────────────────────────────
  const warningParagraphs: Paragraph[] = []
  if (mode === 'draft') {
    warningParagraphs.push(buildBannerParagraph(strings.draftBanner, strings.draftBannerTail, 'B8860B'))
  } else if (mode === 'review-needed') {
    warningParagraphs.push(buildBannerParagraph(strings.reviewBanner, strings.reviewBannerTail, 'CC0000'))
  }

  // ── Body paragraphs ───────────────────────────────────────────────────────
  const contentParagraphs = contractTextToParagraphs(contractText)

  const legalBasisLine = safeLegalBasis.length > 0
    ? `${strings.legalBasisPrefix} ${safeLegalBasis.join(', ')}`
    : ''

  // ── Assemble document ─────────────────────────────────────────────────────
  const bodyFontSize = jurisdiction === 'UK' ? 23 : 22 // 11.5pt vs 11pt (DOCX uses half-points)

  const doc = new Document({
    creator: 'PrávníkAI',
    title: contractName,
    subject: `${jurisdiction} legal contract`,
    styles: {
      default: {
        document: {
          run: {
            font: 'Times New Roman',
            size: bodyFontSize,
          },
          paragraph: {
            spacing: { line: 336, before: 0, after: 100 }, // ~1.4 line spacing
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1418, bottom: 1440, left: 1418 }, // 25mm × 25mm
            pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `${contractName} — PrávníkAI`,
                    size: 16,
                    color: '999999',
                    italics: true,
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: `${strings.generatedBy} | `, size: 14, color: '999999' }),
                  new TextRun({ text: `${formatExportDate(generatedAt, jurisdiction)} | `, size: 14, color: '999999' }),
                  new TextRun({ text: `${schemaId}    `, size: 14, color: '999999' }),
                  new TextRun({ text: `${strings.page} `, size: 14, color: '999999' }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 14, color: '999999' }),
                  new TextRun({ text: ` ${strings.of} `, size: 14, color: '999999' }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 14, color: '999999' }),
                ],
              }),
              ...(legalBasisLine
                ? [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: legalBasisLine,
                          size: 14,
                          color: 'AAAAAA',
                          italics: true,
                        }),
                      ],
                    }),
                  ]
                : []),
            ],
          }),
        },
        children: [
          ...warningParagraphs,
          ...contentParagraphs,
          // ── End-of-document disclaimer ──
          new Paragraph({ spacing: { before: 600 } }),
          new Paragraph({
            border: { top: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' } },
            spacing: { before: 200 },
            children: [
              new TextRun({
                text: strings.disclaimer,
                size: 16,
                color: '999999',
                italics: true,
              }),
            ],
          }),
        ],
      },
    ],
  })

  // ── Generate buffer and return ────────────────────────────────────────────
  let buffer: Buffer
  try {
    buffer = await Packer.toBuffer(doc)
  } catch (err) {
    console.error('[export-docx] Packer.toBuffer failed:', err)
    return NextResponse.json(
      { error: 'DOCX generation failed. Please try again.' },
      { status: 500 },
    )
  }

  if (guard.user) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    recordExport(supabase, guard.user.id).catch(() => {})
  }

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${encodeFilename(contractName)}.docx"`,
    },
  })
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildBannerParagraph(label: string, tail: string, accentColor: string): Paragraph {
  return new Paragraph({
    spacing: { after: 240 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } },
    children: [
      new TextRun({ text: label, bold: true, size: 20, color: accentColor }),
      new TextRun({ text: ` — ${tail}`, size: 18, color: '666666' }),
    ],
  })
}

/**
 * Parses plain contract text into styled DOCX paragraphs.
 * Recognizes:
 *   - Lines starting with "Article", "Article I.", "Clanek", "Článek", "§ X", "1.", "2." etc → Article heading
 *   - ALL CAPS lines → Sub-heading
 *   - Lines that are only underscores → Signature line
 *   - Empty lines → Spacing
 *   - Everything else → Justified body paragraph (no first-line indent on bare-name lines / signature labels)
 */
function contractTextToParagraphs(text: string): Paragraph[] {
  const lines = text.split('\n')
  const paragraphs: Paragraph[] = []

  for (const line of lines) {
    const trimmed = line.trim()

    if (!trimmed) {
      paragraphs.push(new Paragraph({ spacing: { after: 120 } }))
      continue
    }

    // Article headings — multi-language: cs/de/uk patterns
    if (
      /^(Článek|Clanek|ČLÁNEK|CLANEK|Article|Clause|Klausel|Abschnitt|§)\s+/i.test(trimmed) ||
      /^[IVXLCDM]+\.\s/.test(trimmed)
    ) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 360, after: 140 },
          alignment: AlignmentType.LEFT,
          children: [new TextRun({ text: trimmed, bold: true, size: 26, color: '111111' })],
        }),
      )
      continue
    }

    // Sub-headings: ALL CAPS lines (and short — likely a heading not a quote)
    if (
      trimmed === trimmed.toUpperCase() &&
      trimmed.length > 3 &&
      trimmed.length < 80 &&
      /[A-ZÁ-ŽÄÖÜ]/.test(trimmed) &&
      !/^[A-Z]\.\s/.test(trimmed) // skip "A. text" lists
    ) {
      paragraphs.push(
        new Paragraph({
          spacing: { before: 240, after: 80 },
          children: [new TextRun({ text: trimmed, bold: true, size: 24 })],
        }),
      )
      continue
    }

    // Signature lines (10+ underscores or hyphens)
    if (/^[_\-]{10,}$/.test(trimmed)) {
      paragraphs.push(
        new Paragraph({
          spacing: { before: 360, after: 40 },
          children: [
            new TextRun({
              text: '________________________________________',
              size: 22,
              color: '333333',
            }),
          ],
        }),
      )
      continue
    }

    // Numbered list items (1. , 2. ...) — body, no first-line indent
    const isListItem = /^\d+\.\s/.test(trimmed)

    // Body paragraph (justified, with first-line indent unless list)
    const runs = parseInlineBold(trimmed)
    paragraphs.push(
      new Paragraph({
        spacing: { after: 100 },
        alignment: AlignmentType.JUSTIFIED,
        indent: isListItem ? undefined : { firstLine: 240 }, // ~6mm first-line indent
        children: runs,
      }),
    )
  }

  return paragraphs
}

/** Parses **bold** markers into TextRun sequences. */
function parseInlineBold(text: string): TextRun[] {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  const runs: TextRun[] = []

  for (let i = 0; i < parts.length; i++) {
    if (!parts[i]) continue
    runs.push(new TextRun({ text: parts[i], bold: i % 2 === 1 }))
  }

  if (runs.length === 0) {
    runs.push(new TextRun({ text }))
  }

  return runs
}

function encodeFilename(name: string): string {
  return name
    .replace(/[^\w\s\u00C0-\u024F-]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 100)
}
