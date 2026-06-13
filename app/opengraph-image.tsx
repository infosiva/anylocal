import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'AnyLocal — Find Anything Near You, Anywhere in the World'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a1628 0%, #0f2744 50%, #0a1628 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 72, marginBottom: 16 }}>📍</div>
        <div style={{ fontSize: 56, fontWeight: 900, color: '#ffffff', letterSpacing: '-1px', textAlign: 'center' }}>
          AnyLocal
        </div>
        <div style={{ fontSize: 26, color: '#93c5fd', marginTop: 16, textAlign: 'center', maxWidth: 700 }}>
          Find Anything Near You — AI-Ranked Local Search
        </div>
        <div style={{ fontSize: 18, color: '#bfdbfe', marginTop: 24, opacity: 0.8 }}>
          anylocal.app
        </div>
      </div>
    ),
    { ...size }
  )
}
