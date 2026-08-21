'use client'

import { useRef, useState } from 'react'

interface ContractFileUploadProps {
  /** Receives the extracted text, which then fills the textarea. */
  onExtracted: (text: string) => void
  disabled?: boolean
}

/**
 * Loads a contract from a PDF or DOCX instead of pasting it.
 *
 * The extracted text lands in the textarea rather than being submitted
 * directly, so the user sees exactly what will be reviewed — extraction from a
 * PDF is rarely perfect and silently reviewing a mangled text would be worse
 * than showing it.
 */
export function ContractFileUpload({ onExtracted, disabled }: ContractFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<'idle' | 'loading'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function handleFile(file: File) {
    setState('loading')
    setError(null)
    setNotice(null)

    try {
      const form = new FormData()
      form.append('file', file)

      const res = await fetch('/api/extract-text', { method: 'POST', body: form })
      const data = (await res.json().catch(() => null)) as
        | { text?: string; truncated?: boolean; characters?: number; error?: string }
        | null

      if (!res.ok || !data?.text) {
        setError(data?.error ?? 'Soubor se nepodařilo načíst.')
        return
      }

      onExtracted(data.text)
      setNotice(
        data.truncated
          ? `Načteno ${data.characters?.toLocaleString('cs-CZ')} znaků — dokument byl zkrácen na maximální délku. Zkontrolujte text níže.`
          : `Načteno ${data.characters?.toLocaleString('cs-CZ')} znaků. Zkontrolujte text níže před spuštěním kontroly.`,
      )
    } catch {
      setError('Soubor se nepodařilo načíst. Zkontrolujte připojení.')
    } finally {
      setState('idle')
      // Reset so selecting the same file again still fires onChange
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div style={{ marginBottom: 'var(--space-md)' }}>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
        }}
      />

      <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="glass-btn"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || state === 'loading'}
        >
          {state === 'loading' ? 'Načítám dokument…' : 'Nahrát PDF nebo DOCX'}
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
      {error && (
        <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: 'var(--accent-rose)' }} role="alert">
          {error}
        </p>
      )}
      <p style={{ margin: '8px 0 0', fontSize: '0.72rem', color: 'var(--color-text-subtle)' }}>
        Podporujeme PDF a DOCX do 10 MB. Naskenované smlouvy obsahují jen obrázek stránky —
        z těch text přečíst nelze.
      </p>
    </div>
  )
}
