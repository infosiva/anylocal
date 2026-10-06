export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <span className="al-logo" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: size * 0.72, letterSpacing: '-0.02em', color: '#fffbf5' }}>
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="14" fill="#0f1419" stroke="#f0bc4255" />
        <path d="M32 10c-9.4 0-17 7.4-17 16.5C15 38.600 32 54 32 54s17-15.400 17-27.500C49 17.400 41.400 10 32 10z" fill="#f0bc42" />
        <circle cx="32" cy="26" r="7" fill="#0f1419" />
        <circle cx="32" cy="26" r="2.600" fill="#f0bc42" />
      </svg>
      <span>Any<span style={{ color: '#f0bc42' }}>Local</span></span>
    </span>
  )
}
