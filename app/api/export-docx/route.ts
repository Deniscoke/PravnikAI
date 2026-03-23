/**
 * POST /api/export-docx
 *
 * Converts generated contract text into a professional .docx file.
 * Uses the `docx` npm package to produce Office Open XML.
 *
 * Input:  { contractText, contractName, mode, schemaId, generatedAt, legalBasis }
 * Output: application/vnd.openxmlformats-officedocument.wordprocessingml.document
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

// Force Node.js runtime — docx library uses Buffer and Node-specific APIs
export const runtime = 'nodejs'

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
  const { allowed: rlAllowed, resetAt } = checkRateLimit(ip, { max: 20, windowMs: 60_000 })
  if (!rlAllowed) {
    return NextResponse.json(
      { error: 'Příliš mnoho požadavků. Zkuste to za chvíli.' },
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

  // Guard: body size limit (500 KB) to prevent OOM on serverless
  if (body.contractText.length > 500_000) {
    return NextResponse.json({ error: 'Contract text too large' }, { status: 413 })
  }

  // Normalize legalBasis — tolerate undefined, null, or non-array
  const safeLegalBasis = Array.isArray(body.legalBasis) ? body.legalBasis : []

  const { contractText, contractName, mode, schemaId, generatedAt } = body
  const legalBasis = safeLegalBasis

  // ── Build document paragraphs from plain text ─────────────────────────────

  const contentParagraphs = contractTextToParagraphs(contractText)

  // ── Mode warning header (for draft / review-needed) ───────────────────────

  const warningParagraphs: Paragraph[] = []

  if (mode === 'draft') {
    warningParagraphs.push(
      new Paragraph({
        spacing: { after: 200 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
        },
        children: [
          new TextRun({
            text: 'PRACOVNÍ NÁVRH',
            bold: true,
            size: 20,
            color: 'B8860B',
          }),
          new TextRun({
            text: ' — Text smlouvy určený k doplnění a právní kontrole před podpisem.',
            size: 18,
            color: '666666',
          }),
        ],
      }),
    )
  }

  if (mode === 'review-needed') {
    warningParagraphs.push(
      new Paragraph({
        spacing: { after: 200 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
        },
        children: [
          new TextRun({
            text: 'VYŽADUJE KONTROLU',
            bold: true,
            size: 20,
            color: 'CC0000',
          }),
          new TextRun({
            text: ' — Neúplná kostra. Před podpisem vyžaduje právní kontrolu.',
            size: 18,
            color: '666666',
          }),
        ],
      }),
    )
  }

  // ── Legal basis footer line ───────────────────────────────────────────────

  const legalBasisLine = legalBasis.length > 0
    ? `Právní základ: ${legalBasis.join(', ')}`
    : ''

  // ── Assemble DOCX ─────────────────────────────────────────────────────────

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Times New Roman',
            size: 24, // 12pt
          },
          paragraph: {
            spacing: { line: 360 }, // 1.5 line spacing
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,    // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
            pageNumbers: {
              start: 1,
              formatType: NumberFormat.DECIMAL,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `${contractName} — PravnikAI`,
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
                  new TextRun({
                    text: 'Vygenerováno: PrávníkAI',
                    size: 14,
                    color: '999999',
                  }),
                  new TextRun({
                    text: ` | ${formatDate(generatedAt)} | ${schemaId}`,
                    size: 14,
                    color: '999999',
                  }),
                  new TextRun({
                    text: '    Strana ',
                    size: 14,
                    color: '999999',
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 14,
                    color: '999999',
                  }),
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
          // ── Disclaimer at the end ──
          new Paragraph({ spacing: { before: 600 } }),
          new Paragraph({
            border: {
              top: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
            },
            spacing: { before: 200 },
            children: [
              new TextRun({
                text: 'Tento dokument byl vygenerován umělou inteligencí a slouží výhradně jako pracovní návrh. Před podpisem nebo právním použitím jej nechte zkontrolovat advokátem. Systém neposkytuje právní poradenství dle zák. č. 85/1996 Sb., o advokacii.',
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
      { error: 'Generování DOCX selhalo. Zkuste to znovu.' },
      { status: 500 },
    )
  }

  // Record export for billing (best-effort, only for authenticated users)
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

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Parses plain contract text into styled DOCX paragraphs.
 * Recognizes:
 *   - Lines starting with "Clanek" / "Článek" → Heading
 *   - Lines that are ALL CAPS or bold markers → SubHeading
 *   - Empty lines → spacing
 *   - Everything else → body text
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

    // Detect headings: "Článek I.", "ČLÁNEK II.", "I.", "II." etc.
    if (/^(Článek|Clanek|ČLÁNEK|CLANEK)\s+/i.test(trimmed) || /^[IVXLCDM]+\.\s/.test(trimmed)) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 360, after: 120 },
          children: [
            new TextRun({
              text: trimmed,
              bold: true,
              size: 26,
            }),
          ],
        }),
      )
      continue
    }

    // Detect sub-headings: all-caps lines or "§ X" section markers
    if (/^§\s*\d/.test(trimmed) || (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && /[A-ZÁ-Ž]/.test(trimmed))) {
      paragraphs.push(
        new Paragraph({
          spacing: { before: 240, after: 80 },
          children: [
            new TextRun({
              text: trimmed,
              bold: true,
              size: 24,
            }),
          ],
        }),
      )
      continue
    }

    // Detect signature block lines (underscores, dashes)
    if (/^[_\-]{10,}$/.test(trimmed)) {
      paragraphs.push(
        new Paragraph({
          spacing: { before: 360, after: 40 },
          children: [
            new TextRun({
              text: '________________________________________',
              size: 24,
              color: '333333',
            }),
          ],
        }),
      )
      continue
    }

    // Regular body paragraph
    // Handle inline bold markers **text** if present
    const runs = parseInlineBold(trimmed)
    paragraphs.push(
      new Paragraph({
        spacing: { after: 80 },
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
    runs.push(
      new TextRun({
        text: parts[i],
        bold: i % 2 === 1,
        size: 24,
      }),
    )
  }

  if (runs.length === 0) {
    runs.push(new TextRun({ text, size: 24 }))
  }

  return runs
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

function encodeFilename(name: string): string {
  return name
    .replace(/[^\w\s\u00C0-\u024F-]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 100)
}
