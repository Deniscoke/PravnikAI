'use client'

import { useRef, useState } from 'react'

interface ContractFileUploadProps {
  /** Receives the extracted text, which then fills the textarea. */
  onExtracted: (text: string) => void
  disabled?: boolean
}

interface ExtractResponse {
  text?: string
  truncated?: boolean
  characters?: number
  error?: string
  source?: 'document' | 'photo'
  pages?: number
  unreadableRatio?: number
}

/** Above this share of unreadable words, the text is too holed to review quietly. */
const UNREADABLE_WARN_THRESHOLD = 0.02

/**
 * Loads a contract from a PDF, a DOCX, or photographs of its pages.
 *
 * The extracted text lands in the textarea rather than being submitted
 * directly, so the user sees exactly what will be reviewed. That is a
 * convenience for a PDF and a safeguard for photos: a transcription can misread
 * a figure, and an unnoticed error would travel silently into the analysis.
 */
export function ContractFileUpload({ onExtracted, disabled }: ContractFileUploadProps) {
  const documentInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<'idle' | 'document' | 'photo'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)

  async function upload(files: File[], kind: 'document' | 'photo') {
    setState(kind)
    setError(null)
    setNotice(null)
    setWarning(null)

    try {
      const form = new FormData()
      for (const file of files) form.append('file', file)

      const res = await fetch('/api/extract-text', { method: 'POST', body: form })
      const data = (await res.json().catch(() => null)) as ExtractResponse | null

      if (!res.ok || !data?.text) {
        setError(data?.error ?? 'Soubor se nepodařilo načíst.')
        return
      }

      onExtracted(data.text)

      const characters = data.characters?.toLocaleString('cs-CZ') ?? '—'

      if (data.source === 'photo') {
        const pages = data.pages ?? files.length
        setNotice(
          `Přečteno ${pages} ${pageWord(pages)}, ${characters} znaků. ` +
            'Text vznikl přepisem fotografií — projděte si jej prosím a opravte, ' +
            'než spustíte kontrolu.',
        )
        if ((data.unreadableRatio ?? 0) > UNREADABLE_WARN_THRESHOLD) {
          setWarning(
            'Část textu se nepodařilo přečíst — v textu jsou označena místa [NEČITELNÉ]. ' +
              'Doplňte je prosím ručně, jinak je kontrola vyhodnotí jako chybějící ujednání.',
          )
        }
      } else {
        setNotice(
          data.truncated
            ? `Načteno ${characters} znaků — dokument byl zkrácen na maximální délku. Zkontrolujte text níže.`
            : `Načteno ${characters} znaků. Zkontrolujte text níže před spuštěním kontroly.`,
        )
      }
    } catch {
      setError('Soubor se nepodařilo načíst. Zkontrolujte připojení.')
    } finally {
      setState('idle')
      // Reset so selecting the same file again still fires onChange
      if (documentInputRef.current) documentInputRef.current.value = ''
      if (photoInputRef.current) photoInputRef.current.value = ''
    }
  }

  const busy = state !== 'idle'

  return (
    <div style={{ marginBottom: 'var(--space-md)' }}>
      <input
        ref={documentInputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void upload([file], 'document')
        }}
      />
      {/*
        No `capture` attribute on purpose: it forces the camera open and removes
        the option to pick pages already photographed, which is how most people
        will actually use this.
      */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? [])
          if (files.length > 0) void upload(files, 'photo')
        }}
      />

      <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="glass-btn"
          onClick={() => documentInputRef.current?.click()}
          disabled={disabled || busy}
        >
          {state === 'document' ? 'Načítám dokument…' : 'Nahrát PDF nebo DOCX'}
        </button>
        <button
          type="button"
          className="glass-btn"
          onClick={() => photoInputRef.current?.click()}
          disabled={disabled || busy}
        >
          {state === 'photo' ? 'Přepisuji fotografie…' : 'Vyfotit nebo nahrát fotky'}
        </button>
        <span style={{ fontSize: '0.76rem', color: 'var(--color-text-subtle)' }}>
          nebo text vložte ručně níže
        </span>
      </div>

      {notice && (
        <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: 'var(--accent-aqua)' }} role="status">
          {notice}
        </p>
      )}
      {warning && (
        <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: 'var(--accent-amber, #d99a2b)' }} role="alert">
          {warning}
        </p>
      )}
      {error && (
        <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: 'var(--accent-rose)' }} role="alert">
          {error}
        </p>
      )}

      <p style={{ margin: '8px 0 0', fontSize: '0.72rem', color: 'var(--color-text-subtle)' }}>
        PDF a DOCX do 10 MB. Fotografie JPG, PNG nebo WEBP — až 8 stránek najednou.
        Focte kolmo shora, za dobrého světla a tak, aby stránka vyplnila celý snímek.
      </p>
    </div>
  )
}

function pageWord(count: number): string {
  if (count === 1) return 'stránku'
  if (count >= 2 && count <= 4) return 'stránky'
  return 'stránek'
}
