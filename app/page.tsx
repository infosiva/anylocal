'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, ArrowRight, CheckCircle, Wrench, Sparkles, Mic, MicOff } from 'lucide-react'
import config from '../vertical.config'

// ── Design tokens ─────────────────────────────────────────
const T = {
  bg:      '#0c0a00',
  surface: '#141000',
  s2:      '#1a1400',
  border:  'rgba(255,255,255,0.07)',
  border2: 'rgba(255,255,255,0.12)',
  text:    '#f8fafc',
  muted:   'rgba(255,255,255,0.38)',
  orange:  '#f97316',
}

// ── How it works data ─────────────────────────────────────
const HOW_IT_WORKS = [
  { step: '01', title: 'Type what you need', desc: 'Business type + location — any language' },
  { step: '02', title: 'AI scans reviews',   desc: 'Analyses real feedback from Google, Yelp + more' },
  { step: '03', title: 'Find your best match', desc: 'Ranked by quality, not just star ratings' },
]

// ── Animated mesh background ──────────────────────────────
function AnimatedBg() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        className="absolute rounded-full"
        style={{
          top: '-15%', left: '15%', width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(249,115,22,0.2), transparent)',
          filter: 'blur(100px)',
        }}
        animate={{ x: [0, 35, 0], y: [0, -25, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, ease: 'easeInOut', repeat: Infinity }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          bottom: '-10%', right: '10%', width: 350, height: 350,
          background: 'radial-gradient(circle, rgba(234,88,12,0.15), transparent)',
          filter: 'blur(80px)',
        }}
        animate={{ x: [0, -20, 0], y: [0, 18, 0], scale: [1, 1.07, 1] }}
        transition={{ duration: 11, ease: 'easeInOut', repeat: Infinity, delay: 1.5 }}
      />
    </div>
  )
}

// ── Floating chatbot ──────────────────────────────────────
function FloatingChat() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Hi! Tell me what you\'re looking for and where 📍' },
  ])
  const [input, setInput] = useState('')

  async function send() {
    if (!input.trim()) return
    const userMsg = input
    setMsgs(m => [...m, { role: 'user', text: userMsg }])
    setInput('')
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userMsg }],
          system: 'You are AnyLocal assistant. Help users find local businesses. Ask for their location if not provided. Be concise.',
        }),
      })
      const data = await res.json()
      setMsgs(m => [...m, { role: 'bot', text: data.text || data.content || 'Let me search that for you...' }])
    } catch {
      setMsgs(m => [...m, { role: 'bot', text: 'Having trouble connecting right now.' }])
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 24, right: 24,
          width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg,#f97316,#ea580c)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(249,115,22,0.5)',
          zIndex: 1000, fontSize: 20,
        }}
      >
        {open ? '✕' : '💬'}
      </button>
      {open && (
        <div style={{
          position: 'fixed', bottom: 88, right: 24,
          width: 320, height: 400,
          background: 'rgba(12,10,0,0.97)',
          border: '1px solid rgba(249,115,22,0.3)',
          borderRadius: 16,
          display: 'flex', flexDirection: 'column',
          zIndex: 1000, backdropFilter: 'blur(20px)',
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(249,115,22,0.2)', fontSize: 13, fontWeight: 700, color: T.text }}>
            AnyLocal Assistant
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                background: m.role === 'user' ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.06)',
                padding: '8px 12px', borderRadius: 10,
                fontSize: 12, color: 'rgba(248,250,252,0.85)', maxWidth: '85%',
              }}>{m.text}</div>
            ))}
          </div>
          <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(249,115,22,0.2)', display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="What are you looking for?"
              style={{
                flex: 1, background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(249,115,22,0.25)',
                borderRadius: 8, padding: '6px 10px',
                fontSize: 12, color: T.text, outline: 'none',
              }}
            />
            <button
              onClick={send}
              style={{ background: T.orange, border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: '#fff', cursor: 'pointer' }}
            >→</button>
          </div>
        </div>
      )}
    </>
  )
}

// ── Main page ─────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter()
  const [query, setQuery]   = useState('')
  const [listening, setL]   = useState(false)
  const [locating, setLoc]  = useState<string | null>(null)
  const recRef = useRef<any>(null)
  const gpsRef = useRef<{ lat: number; lng: number } | null>(null)

  // first 8 for hero grid, first 12 for popular section
  const heroCategories    = config.categories.slice(0, 8)
  const popularCategories = config.categories.slice(0, 12)
  const mobileChips       = config.categories.slice(0, 6)

  function go(q?: string) {
    const term = (q ?? query).trim()
    if (!term) return
    const gps = gpsRef.current
    router.push(gps
      ? `/search?q=${encodeURIComponent(term)}&lat=${gps.lat}&lng=${gps.lng}`
      : `/search?q=${encodeURIComponent(term)}`)
  }

  function nearMe(label: string, id: string) {
    setLoc(id)
    navigator.geolocation.getCurrentPosition(
      pos => {
        gpsRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setLoc(null)
        router.push(`/search?q=${encodeURIComponent(label + ' near me')}&lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`)
      },
      () => { setLoc(null); router.push(`/search?q=${encodeURIComponent(label + ' near me')}`) },
      { timeout: 6000 },
    )
  }

  function startVoice() {
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    if (!SR) { alert('Voice not supported in this browser'); return }
    const rec = new SR()
    rec.lang = 'en-GB'; rec.continuous = false; rec.interimResults = false
    rec.onstart = () => setL(true)
    rec.onend   = () => setL(false)
    rec.onerror = () => setL(false)
    rec.onresult = (e: any) => {
      const t = e.results[0][0].transcript
      setQuery(t)
      router.push(`/search?q=${encodeURIComponent(t)}`)
    }
    recRef.current = rec; rec.start()
  }

  function stopVoice() { recRef.current?.stop(); setL(false) }

  return (
    <div style={{ minHeight: '100vh', background: T.bg, position: 'relative' }}>
      <AnimatedBg />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── SECTION 1: HERO — 2-col desktop ──────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          style={{ maxWidth: 1040, margin: '0 auto', padding: '40px 24px 0' }}
        >
          <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '55% 45%', gap: 32, alignItems: 'center' }}>

            {/* Left — headline + search */}
            <div>
              {/* Badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 99, background: 'rgba(249,115,22,0.10)', border: '1px solid rgba(249,115,22,0.25)', fontSize: 10, fontWeight: 700, color: 'rgba(253,186,116,0.85)', marginBottom: 16, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                <Sparkles size={9} /> AI-powered · Live data · Free forever
              </div>

              <h1 style={{ fontSize: 38, fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', color: T.text, margin: '0 0 12px' }}>
                {config.tagline.split('—')[0].trim()}
                <br />
                <span style={{ background: 'linear-gradient(120deg, #f97316 10%, #f59e0b 55%, #fb923c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  AI-ranked
                </span>{' '}
                <span style={{ color: T.muted, fontWeight: 700, fontSize: '0.8em' }}>by real reviews</span>
              </h1>

              <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.6, margin: '0 0 20px', maxWidth: 420 }}>
                {config.metaDescription}
              </p>

              {/* Search bar */}
              <div style={{ background: T.surface, border: `1px solid ${listening ? 'rgba(239,68,68,0.45)' : T.border2}`, borderRadius: 18, padding: '6px 6px 6px 16px', boxShadow: '0 12px 48px rgba(0,0,0,0.55)', transition: 'border-color 0.2s', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Search size={15} style={{ color: T.muted, flexShrink: 0 }} />
                <input
                  type="text"
                  value={listening ? '🎤 Listening…' : query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && go()}
                  placeholder='"plumber nearby" or "best Thai in Leeds"'
                  readOnly={listening}
                  autoFocus
                  style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: T.text, minWidth: 0, padding: '10px 0' }}
                />
                <button
                  onClick={listening ? stopVoice : startVoice}
                  style={{ padding: 8, borderRadius: 9, background: listening ? 'rgba(239,68,68,0.15)' : 'transparent', border: 'none', cursor: 'pointer', color: listening ? '#ef4444' : T.muted, flexShrink: 0, transition: 'all 0.2s' }}
                >
                  {listening ? <MicOff size={14} /> : <Mic size={14} />}
                </button>
                <button
                  onClick={() => go()}
                  disabled={listening}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 22px', borderRadius: 13, fontWeight: 700, fontSize: 13, color: '#fff', background: 'linear-gradient(135deg, #ea580c, #d97706)', border: 'none', cursor: 'pointer', flexShrink: 0, boxShadow: '0 4px 16px rgba(249,115,22,0.35)', minHeight: 44, transition: 'opacity 0.2s' }}
                >
                  Find <ArrowRight size={13} />
                </button>
              </div>

              {/* Mobile only — horizontal chip row */}
              <div className="mobile-chips" style={{ display: 'none', overflowX: 'auto', scrollbarWidth: 'none', gap: 7, paddingBottom: 4 }}>
                {mobileChips.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => nearMe(cat.label, cat.id)}
                    style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 99, background: T.surface, border: `1px solid ${T.border}`, fontSize: 11, color: T.muted, cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    <span>{cat.icon}</span>{cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right — 4x2 category chip grid (desktop only) */}
            <div className="hero-cats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {heroCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => nearMe(cat.label, cat.id)}
                  disabled={locating === cat.id}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    padding: '12px 8px',
                    background: 'rgba(249,115,22,0.06)',
                    border: '1px solid rgba(249,115,22,0.18)',
                    borderRadius: 12, cursor: 'pointer',
                    transition: 'border-color 0.18s, background 0.18s, transform 0.12s',
                    position: 'relative',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(249,115,22,0.45)'
                    ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(249,115,22,0.18)'
                    ;(e.currentTarget as HTMLElement).style.transform = 'none'
                  }}
                >
                  {locating === cat.id && (
                    <div style={{ position: 'absolute', inset: 0, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}>
                      <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(249,115,22,0.4)', borderTopColor: T.orange, animation: 'spin 0.7s linear infinite' }} />
                    </div>
                  )}
                  <span style={{ fontSize: 22, lineHeight: 1 }}>{cat.icon}</span>
                  <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(253,186,116,0.8)', textAlign: 'center', lineHeight: 1.3 }}>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── SECTION 2: HOW IT WORKS ───────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          style={{ maxWidth: 1040, margin: '0 auto', padding: '40px 24px 0' }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 3, height: 14, borderRadius: 99, background: T.orange, flexShrink: 0, alignSelf: 'center' }} />
            <span style={{ fontSize: 13, fontWeight: 800, color: T.text, letterSpacing: '0.03em', textTransform: 'uppercase' }}>How It Works</span>
          </div>

          <div className="how-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, position: 'relative' }}>
            {HOW_IT_WORKS.map((s, i) => (
              <div key={s.step} style={{ position: 'relative', paddingRight: i < 2 ? 16 : 0 }}>
                {i < 2 && (
                  <div style={{ position: 'absolute', top: 20, right: 0, width: 16, height: 1, background: 'linear-gradient(to right, rgba(249,115,22,0.4), rgba(249,115,22,0.1))', zIndex: 1 }} />
                )}
                <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '16px', height: '100%' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: T.orange, marginBottom: 8, letterSpacing: '0.06em' }}>{s.step}</div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: '0 0 4px' }}>{s.title}</p>
                  <p style={{ fontSize: 11, color: T.muted, margin: 0, lineHeight: 1.55 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── SECTION 3: POPULAR CATEGORIES GRID ───────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          style={{ maxWidth: 1040, margin: '0 auto', padding: '40px 24px 0' }}
        >
          <div style={{ borderTop: `1px solid ${T.border}`, marginBottom: 24 }} />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 3, height: 14, borderRadius: 99, background: T.orange, flexShrink: 0, alignSelf: 'center' }} />
            <span style={{ fontSize: 13, fontWeight: 800, color: T.text, letterSpacing: '0.03em', textTransform: 'uppercase' }}>Popular Categories</span>
          </div>
          <div className="pop-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7 }}>
            {popularCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => nearMe(cat.label, cat.id)}
                disabled={locating === cat.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: '10px 12px',
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: 10, cursor: 'pointer',
                  transition: 'border-color 0.18s, background 0.18s',
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(249,115,22,0.35)'
                  ;(e.currentTarget as HTMLElement).style.background = 'rgba(249,115,22,0.05)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = T.border
                  ;(e.currentTarget as HTMLElement).style.background = T.surface
                }}
              >
                {locating === cat.id && (
                  <div style={{ position: 'absolute', inset: 0, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(249,115,22,0.4)', borderTopColor: T.orange, animation: 'spin 0.7s linear infinite' }} />
                  </div>
                )}
                <span style={{ fontSize: 18, lineHeight: 1 }}>{cat.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: T.muted }}>{cat.label}</span>
              </button>
            ))}
          </div>
        </motion.section>

        {/* ── BOTTOM CTA — 2 col ────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          style={{ maxWidth: 1040, margin: '0 auto', padding: '40px 24px 0' }}
        >
          <div style={{ borderTop: `1px solid ${T.border}`, marginBottom: 24 }} />
          <div className="cta-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(249,115,22,0.05), transparent 70%)', pointerEvents: 'none' }} />
              <h3 style={{ fontSize: 14, fontWeight: 800, color: T.text, margin: '0 0 4px' }}>Need a local service?</h3>
              <p style={{ fontSize: 11, color: T.muted, margin: '0 0 12px', lineHeight: 1.5 }}>Trades, food, health, professional. AI finds the best near you — instantly.</p>
              <button onClick={() => go('plumber near me')} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '9px 16px', minHeight: 44, borderRadius: 10, fontWeight: 700, fontSize: 12, color: '#fff', background: 'linear-gradient(135deg, #ea580c, #d97706)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(249,115,22,0.22)' }}>
                Search now <ArrowRight size={12} />
              </button>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                {['Free to search', 'No account', 'Instant results'].map(t => (
                  <span key={t} style={{ fontSize: 9, color: T.muted, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <CheckCircle size={8} style={{ color: 'rgba(249,115,22,0.5)' }} />{t}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.09), rgba(245,158,11,0.05))', border: '1px solid rgba(249,115,22,0.26)', borderRadius: 12, padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 10, right: 12, fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(249,115,22,0.15)', color: 'rgba(253,186,116,0.85)', border: '1px solid rgba(249,115,22,0.28)' }}>30 days free</div>
              <Wrench size={16} style={{ color: T.orange, marginBottom: 6 }} />
              <h3 style={{ fontSize: 14, fontWeight: 800, color: T.text, margin: '0 0 4px' }}>Own a trade business?</h3>
              <p style={{ fontSize: 11, color: T.muted, margin: '0 0 12px', lineHeight: 1.5 }}>Local leads direct to you. 0% commission — ever. Just £15/mo after trial.</p>
              <Link href="/for-businesses" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '9px 16px', minHeight: 44, borderRadius: 10, fontWeight: 700, fontSize: 12, color: '#fff', background: 'linear-gradient(135deg, #ea580c, #d97706)', textDecoration: 'none', boxShadow: '0 4px 12px rgba(249,115,22,0.22)' }}>
                List your trade free <ArrowRight size={12} />
              </Link>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                {['0% commission', '£15/mo after trial', 'Cancel any time'].map(t => (
                  <span key={t} style={{ fontSize: 9, color: T.muted, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <CheckCircle size={8} style={{ color: 'rgba(249,115,22,0.5)' }} />{t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── FOOTER ────────────────────────────────────────── */}
        <footer style={{ borderTop: `1px solid ${T.border}`, padding: '16px 24px', maxWidth: 1040, margin: '0 auto' }}>
          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: 13, fontWeight: 800, color: T.text, letterSpacing: '-0.02em' }}>
                {config.name} <span style={{ background: 'linear-gradient(120deg,#f97316,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>AI</span>
              </span>
              <p style={{ fontSize: 10, color: T.muted, margin: '3px 0 0', lineHeight: 1.5 }}>
                AI-powered local trade &amp; service finder. Free forever. No commissions.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              {[['For Businesses', '/for-businesses'], ['Privacy', '/privacy'], ['Terms', '/terms']].map(([label, href]) => (
                <Link key={href} href={href} style={{ fontSize: 10, color: T.muted, textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = T.text}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = T.muted}
                >{label}</Link>
              ))}
            </div>
          </div>
        </footer>
      </div>

      <FloatingChat />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 640px) {
          .hero-grid  { grid-template-columns: 1fr !important; }
          .hero-cats  { display: none !important; }
          .mobile-chips { display: flex !important; }
          .how-grid   { grid-template-columns: 1fr !important; }
          .pop-grid   { grid-template-columns: repeat(2, 1fr) !important; }
          .cta-grid   { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 641px) and (max-width: 900px) {
          .pop-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .cta-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 400px) {
          .pop-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}
