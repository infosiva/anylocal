import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', background: '#0f1419', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="120" height="120" viewBox="0 0 64 64">
          <path d="M32 6c-10.500 0-19 8.300-19 18.500C13 38 32 56 32 56s19-18 19-31.500C51 14.300 42.500 6 32 6z" fill="#f0bc42" />
          <circle cx="32" cy="24" r="8" fill="#0f1419" />
          <circle cx="32" cy="24" r="3" fill="#f0bc42" />
        </svg>
      </div>
    ),
    size,
  )
}
