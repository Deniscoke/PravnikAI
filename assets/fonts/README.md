# Bundled fonts

**Tinos** (Regular, Bold, Italic) — embedded into the server-side PDF export so
Czech diacritics (č, ř, ě, ů, ž, …) render correctly.

pdfkit's built-in standard-14 fonts cannot be used here: they need `.afm` metric
files that Next.js does not bundle into the serverless function, and their WinAnsi
encoding cannot represent Czech glyphs. We embed a Unicode TTF instead.

- **Family:** Tinos — metric-compatible with Times New Roman
- **Source:** Google Fonts (via `@expo-google-fonts/tinos`)
- **License:** Apache License 2.0 — embeddable and redistributable

These files are bundled into `/api/export-pdf` via `outputFileTracingIncludes`
in `next.config.js`.
