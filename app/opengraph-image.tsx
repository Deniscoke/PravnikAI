import { ImageResponse } from 'next/og'
import { SITE_NAME } from '@/lib/seo/site'

export const runtime = 'edge'

export const alt = `${SITE_NAME} — AI právní asistent pro české právo`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 45%, #0c4a6e 100%)',
          padding: 72,
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: '#e0f2fe',
            lineHeight: 1.1,
            marginBottom: 24,
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            fontSize: 32,
            color: 'rgba(226, 232, 240, 0.92)',
            maxWidth: 900,
            lineHeight: 1.35,
            fontWeight: 500,
          }}
        >
          AI generátor a kontrola právních smluv pro českou praxi
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 22,
            color: 'rgba(148, 163, 184, 0.95)',
          }}
        >
          NOZ · ZP · ZOK · Export DOCX · GDPR
        </div>
      </div>
    ),
    { ...size },
  )
}
