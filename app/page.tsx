'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ArrowRight, CheckCircle, Mic, MicOff, MapPin, Star, ChevronRight } from 'lucide-react'
import config from '../vertical.config'

// ── Design tokens — warm white / teal directory ───────────
const T = {
  bg:       '#fffbf5',
  bgCard:   '#ffffff',
  bgMuted:  '#f5f0e8',
  border:   'rgba(0,0,0,0.07)',
  border2:  'rgba(0,0,0,0.12)',
  borderHi: 'rgba(13,148,136,0.35)',
  text:     '#1a1a1a',
  sub:      'rgba(26,26,26,0.65)',
  muted:    'rgba(26,26,26,0.4)',
  teal:     '#0d9488',
  teal2:    '#0891b2',
  tealLight:'rgba(13,148,136,0.08)',
  tealMid:  'rgba(13,148,136,0.15)',
  grad:     'linear-gradient(120deg, #0d9488 0%, #0891b2 100%)',
  btnGrad:  'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
}

// ── Demo panel data — review cards → AI summary ───────────
const DEMO_SEARCHES = [
  {
    query: 'plumber near Islington',
    results: [
      { name: 'ProFlow Plumbing', rating: 4.8, reviews: 312, badge: 'AI Pick', summary: 'Customers praise fast response and honest pricing. Several mention no call-out surprises.' },
      { name: 'FixIt Fast',       rating: 4.5, reviews: 189, badge: null,     summary: 'Good work but scheduling can be slow in peak weeks per recent reviews.' },
      { name: 'City Pipes Ltd',   rating: 4.2, reviews: 94,  badge: null,     summary: 'Competent team, mixed views on communication after job completion.' },
    ],
  },
  {
    query: 'Italian restaurant Shoreditch',
    results: [
      { name: 'Osteria Lucio',    rating: 4.9, reviews: 541, badge: 'AI Pick', summary: 'Regulars highlight the handmade pasta and relaxed atmosphere. Worth the wait for a table.' },
      { name: 'La Piazza',        rating: 4.6, reviews: 278, badge: null,      summary: 'Strong pizza, great for groups. Service can vary on busy Friday nights.' },
      { name: 'Trattoria Verde',  rating: 4.3, reviews: 117, badge: null,      summary: 'Cosy neighbourhood spot, authentic menu. Limited veggie options noted.' },
    ],
  },
  {
    query: 'dentist accepting NHS patients',
    results: [
      { name: 'Smile Dental Group', rating: 4.7, reviews: 423, badge: 'AI Pick', summary: 'One of few NHS-accepting practices with short waits. Staff consistently described as gentle and thorough.' },
      { name: 'City Dental Care',   rating: 4.4, reviews: 201, badge: null,      summary: 'Modern equipment, good hygienist team. Some reviews mention parking difficulty.' },
      { name: 'Bright Teeth Clinic',rating: 4.1, reviews: 88,  badge: null,      summary: 'Affordable prices, decent service. Appointment reminders sometimes missed.' },
    ],
  },
]

const HOW = [
  { n: '01', title: 'Type what you need',      body: 'Business type + location, any language' },
  { n: '02', title: 'AI reads real reviews',   body: 'Scans Google, Yelp + more — no paid placements' },
  { n: '03', title: 'See the honest summary',  body: 'Quality, value, reliability — in plain English' },
]

const WHY = [
  { icon: '🚫', title: 'No paid placements',   body: 'Unlike Angi or Bark — every result is earned, not bought.' },
  { icon: '🌍', title: 'Works globally',        body: 'Any city, any country. Not just UK or US.' },
  { icon: '🤖', title: 'AI reads the nuance',  body: 'Star ratings miss context. AI summaries catch it.' },
]

// ── Animated demo panel ───────────────────────────────────
function DemoPanel() {
  const [searchIdx, setSearchIdx] = useState(0)
  const [phase, setPhase] = useState<'searching' | 'results'>('results')
  const [visibleResults, setVisibleResults] = useState(3)

  useEffect(() => {
    const cycle = setInterval(() => {
      setPhase('searching')
      setVisibleResults(0)
      setTimeout(() => {
        setSearchIdx(i => (i + 1) % DEMO_SEARCHES.length)
        setPhase('results')
        setVisibleResults(1)
        setTimeout(() => setVisibleResults(2), 400)
        setTimeout(() => setVisibleResults(3), 800)
      }, 1200)
    }, 5000)
    return () => clearInterval(cycle)
  }, [])

  const demo = DEMO_SEARCHES[searchIdx]

  return (
    <div style={{
      background: T.bgCard,
      border: `1px solid ${T.border2}`,
      borderRadius: 20,
      overflow: 'hidden',
      boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)',
    }}>
      {/* Browser chrome */}
      <div style={{ padding: '12px 16px', background: T.bgMuted, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#ff5f57','#ffbd2e','#28c840'].map(c => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
          ))}
        </div>
        <div style={{ flex: 1, background: T.bgCard, borderRadius: 6, padding: '4px 12px', fontSize: 11, color: T.muted, border: `1px solid ${T.border}` }}>
          anylocal.app/search
        </div>
      </div>

      {/* Search bar inside panel */}
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: T.bgMuted, borderRadius: 10, padding: '8px 14px', border: `1px solid ${T.border}` }}>
          <Search size={13} style={{ color: T.teal, flexShrink: 0 }} />
          <AnimatePresence mode="wait">
            <motion.span
              key={demo.query}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3 }}
              style={{ fontSize: 12, color: T.text, fontWeight: 500, flex: 1 }}
            >
              {phase === 'searching' ? (
                <span style={{ color: T.muted }}>Searching…</span>
              ) : demo.query}
            </motion.span>
          </AnimatePresence>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'ping-green 1.5s ease-out infinite' }} />
        </div>
      </div>

      {/* Results */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 260 }}>
        {phase === 'searching' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 68, borderRadius: 12, background: T.bgMuted, animation: 'shimmer-light 1.5s ease-in-out infinite', opacity: 1 - i * 0.15 }} />
            ))}
          </div>
        ) : demo.results.slice(0, visibleResults).map((r, i) => (
          <motion.div
            key={`${searchIdx}-${i}`}
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            style={{
              background: i === 0 ? `linear-gradient(135deg, rgba(13,148,136,0.05) 0%, rgba(8,145,178,0.03) 100%)` : T.bgMuted,
              border: `1px solid ${i === 0 ? T.borderHi : T.border}`,
              borderRadius: 12,
              padding: '10px 12px',
              position: 'relative',
            }}
          >
            {r.badge && (
              <div style={{ position: 'absolute', top: 8, right: 10, fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: T.grad, color: '#fff' }}>
                {r.badge}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{r.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Star size={10} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: T.sub }}>{r.rating}</span>
              <span style={{ fontSize: 10, color: T.muted }}>({r.reviews} reviews)</span>
            </div>
            <p style={{ fontSize: 10.5, color: T.sub, margin: 0, lineHeight: 1.5 }}>{r.summary}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ── Floating chatbot ──────────────────────────────────────
function FloatingChat() {
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [msgs, setMsgs] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Hi! Tell me what local service you need and where — I\'ll help you find the best options 🔍' },
  ])
  const [input, setInput] = useState('')

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

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
          system: config.aiSystemPrompt,
        }),
      })
      const data = await res.json()
      setMsgs(m => [...m, { role: 'bot', text: data.text || data.content || 'Let me help you find that…' }])
    } catch {
      setMsgs(m => [...m, { role: 'bot', text: 'Having trouble connecting — try the search bar above!' }])
    }
  }

  const BOTTOM_OFFSET = 84
  const panelStyle: React.CSSProperties = isMobile ? {
    position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9998,
    width: '100%', height: `calc(100dvh - ${BOTTOM_OFFSET}px)`,
    borderRadius: '16px 16px 0 0',
    background: T.bgCard, border: `1px solid ${T.borderHi}`,
    boxShadow: '0 -8px 40px rgba(0,0,0,0.12)',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    animation: 'al-slide-bottom 0.3s cubic-bezier(0.23,1,0.32,1)',
  } : {
    position: 'fixed', bottom: 88, right: 24, zIndex: 9998,
    width: 340, height: 460, borderRadius: 16,
    background: T.bgCard, border: `1px solid ${T.borderHi}`,
    boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    animation: 'al-slide-up 0.22s ease-out',
  }

  return (
    <>
      <style>{`
        @keyframes al-slide-bottom { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes al-slide-up { from { transform: translateY(12px) scale(0.97); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
      `}</style>
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open chat"
        style={{
          position: 'fixed', bottom: 24, right: 24, width: 52, height: 52, borderRadius: '50%',
          background: T.btnGrad, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(13,148,136,0.4)', zIndex: 9999, fontSize: 20,
        }}
      >
        {open ? '✕' : '💬'}
      </motion.button>
      {open && (
        <div style={panelStyle}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}`, fontSize: 13, fontWeight: 700, color: T.text, flexShrink: 0, background: T.bgMuted }}>
            AnyLocal AI Assistant
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                background: m.role === 'user' ? T.tealMid : T.bgMuted,
                border: `1px solid ${m.role === 'user' ? T.borderHi : T.border}`,
                padding: '8px 12px', borderRadius: 10, fontSize: 12.5, color: T.text, maxWidth: '85%',
              }}>{m.text}</div>
            ))}
          </div>
          <div style={{ padding: '10px 12px', borderTop: `1px solid ${T.border}`, display: 'flex', gap: 8, flexShrink: 0, paddingBottom: 'max(10px, env(safe-area-inset-bottom))' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="What service do you need?"
              style={{
                flex: 1, background: T.bgMuted, border: `1px solid ${T.border2}`,
                borderRadius: 8, padding: '8px 12px', fontSize: isMobile ? 16 : 13.5,
                color: T.text, outline: 'none',
              }}
            />
            <button
              onClick={send}
              style={{ background: T.btnGrad, border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 13, color: '#fff', cursor: 'pointer', fontWeight: 600 }}
            >→</button>
          </div>
        </div>
      )}
    </>
  )
}

// ── Main ──────────────────────────────────────────────────
export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const router      = useRouter()
  const [query, setQ]     = useState('')
  const [listening, setL] = useState(false)
  const [locating, setLoc] = useState<string | null>(null)
  const recRef = useRef<any>(null)
  const gpsRef = useRef<{ lat: number; lng: number } | null>(null)

  const allCats  = config.categories
  const gridCats = allCats.slice(0, 12)

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
      setQ(t)
      router.push(`/search?q=${encodeURIComponent(t)}`)
    }
    recRef.current = rec; rec.start()
  }
  function stopVoice() { recRef.current?.stop(); setL(false) }

  return (
    <div style={{ minHeight: '100vh', background: T.bg, position: 'relative' }}>

      {/* ── HERO — split layout ──────────────────────────── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 24px 48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }} className="hero-grid">

        {/* Left — headline + search */}
        <div>
          {/* Badge */}
          <motion.div
            initial={mounted ? { opacity: 0, y: 10 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 99, background: T.tealLight, border: `1px solid ${T.borderHi}`, fontSize: 11, fontWeight: 700, color: T.teal, letterSpacing: '0.04em', marginBottom: 20 }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'ping-green 1.5s ease-out infinite', display: 'inline-block' }} />
            AI-powered · free · no paid placements
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={mounted ? { opacity: 0, y: 16 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            style={{ fontFamily: 'var(--font-display, system-ui)', fontWeight: 900, lineHeight: 1.06, letterSpacing: '-0.035em', color: T.text, margin: '0 0 16px', fontSize: 'clamp(28px, 4.5vw, 48px)' }}
          >
            Stop guessing from{' '}
            <span style={{ background: T.grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              star ratings.
            </span>
            <br />
            <span style={{ color: T.sub, fontWeight: 700, fontSize: '0.88em' }}>Let AI read the reviews.</span>
          </motion.h1>

          <motion.p
            initial={mounted ? { opacity: 0, y: 12 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ fontSize: 15, color: T.sub, lineHeight: 1.65, margin: '0 0 28px', maxWidth: 460 }}
          >
            Search any local business or trade. We scan Google, Yelp and more, then rank by what customers <em>really</em> experienced — no paid placements, ever.
          </motion.p>

          {/* Search bar */}
          <motion.div
            initial={mounted ? { opacity: 0, y: 12 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: T.bgCard,
              border: `1.5px solid ${listening ? 'rgba(239,68,68,0.5)' : T.border2}`,
              borderRadius: 14,
              padding: '6px 6px 6px 16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              marginBottom: 12,
            }}
            className="search-bar"
          >
            <Search size={15} style={{ color: T.teal, flexShrink: 0 }} />
            <input
              type="text"
              value={listening ? '🎤 Listening…' : query}
              onChange={e => setQ(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && go()}
              placeholder='e.g. "plumber this weekend in Manchester"'
              readOnly={listening}
              autoFocus
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: T.text, minWidth: 0, padding: '10px 0' }}
            />
            <button
              onClick={listening ? stopVoice : startVoice}
              aria-label="Voice search"
              style={{ padding: 8, borderRadius: 8, background: listening ? 'rgba(239,68,68,0.08)' : 'transparent', border: 'none', cursor: 'pointer', color: listening ? '#ef4444' : T.muted, flexShrink: 0, transition: 'background 0.2s' }}
            >
              {listening ? <MicOff size={14} /> : <Mic size={14} />}
            </button>
            <button
              onClick={() => go()}
              disabled={listening}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 18px', borderRadius: 10, fontWeight: 700, fontSize: 13, color: '#fff', background: T.btnGrad, border: 'none', cursor: 'pointer', flexShrink: 0, boxShadow: '0 3px 12px rgba(13,148,136,0.35)', transition: 'opacity 0.2s, transform 0.1s', minHeight: 42, whiteSpace: 'nowrap' }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Find <ArrowRight size={13} />
            </button>
          </motion.div>

          <motion.p
            initial={mounted ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            style={{ fontSize: 11, color: T.muted, marginBottom: 20 }}
          >
            Try: &quot;dentist accepting NHS patients London&quot; · &quot;Italian restaurant Shoreditch&quot;
          </motion.p>

          {/* Differentiator pills */}
          <motion.div
            initial={mounted ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.22 }}
            style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
          >
            {['No paid placements', 'AI reads reviews', 'Works globally', 'Free to use'].map(t => (
              <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: T.teal, background: T.tealLight, border: `1px solid ${T.borderHi}`, padding: '4px 10px', borderRadius: 99 }}>
                <CheckCircle size={9} /> {t}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Right — animated demo panel */}
        <motion.div
          initial={mounted ? { opacity: 0, x: 20 } : false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="demo-panel"
        >
          <DemoPanel />
        </motion.div>
      </section>

      {/* ── CATEGORY GRID ────────────────────────────────── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 52px' }}>
        <div style={{ borderTop: `1px solid ${T.border}`, marginBottom: 32 }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display, system-ui)', fontSize: 18, fontWeight: 800, color: T.text, margin: 0, letterSpacing: '-0.025em' }}>
            Search by category
          </h2>
          <Link href="/search" style={{ fontSize: 12, color: T.teal, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
            All categories <ChevronRight size={12} />
          </Link>
        </div>

        <div className="cat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
          {gridCats.map((cat, i) => (
            <motion.button
              key={cat.id}
              initial={mounted ? { opacity: 0, y: 12 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 + i * 0.04 }}
              onClick={() => nearMe(cat.label, cat.id)}
              disabled={locating === cat.id}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '16px 8px',
                background: T.bgCard,
                border: `1px solid ${T.border}`,
                borderRadius: 14,
                cursor: 'pointer',
                transition: 'border-color 0.18s, box-shadow 0.18s, transform 0.1s',
                position: 'relative',
              }}
              whileHover={{ y: -2, boxShadow: '0 6px 20px rgba(13,148,136,0.12)', borderColor: T.borderHi } as any}
              whileTap={{ scale: 0.97 }}
            >
              {locating === cat.id && (
                <div style={{ position: 'absolute', inset: 0, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.8)' }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${T.tealLight}`, borderTopColor: T.teal, animation: 'spin 0.7s linear infinite' }} />
                </div>
              )}
              <span style={{ fontSize: 22 }}>{cat.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: T.sub, textAlign: 'center', lineHeight: 1.3 }}>{cat.label}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section style={{ background: T.bgMuted, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, padding: '52px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display, system-ui)', fontSize: 18, fontWeight: 800, color: T.text, margin: '0 0 28px', letterSpacing: '-0.025em' }}>
            How it works
          </h2>
          <div className="how-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {HOW.map((s, i) => (
              <motion.div
                key={s.n}
                initial={mounted ? { opacity: 0, y: 14 } : false}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
                style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: '22px 20px', position: 'relative', overflow: 'hidden' }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: i === 0 ? T.grad : `rgba(13,148,136,${0.15 - i * 0.04})`, borderRadius: '16px 16px 0 0' }} />
                <div style={{ fontSize: 11, fontWeight: 800, color: T.teal, marginBottom: 10, letterSpacing: '0.06em' }}>{s.n}</div>
                <p style={{ fontSize: 15, fontWeight: 700, color: T.text, margin: '0 0 6px', lineHeight: 1.3, letterSpacing: '-0.02em' }}>{s.title}</p>
                <p style={{ fontSize: 13, color: T.muted, margin: 0, lineHeight: 1.6 }}>{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY ANYLOCAL ─────────────────────────────────── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '52px 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display, system-ui)', fontSize: 18, fontWeight: 800, color: T.text, margin: '0 0 24px', letterSpacing: '-0.025em' }}>
          Why AnyLocal?
        </h2>
        <div className="why-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {WHY.map((w, i) => (
            <motion.div
              key={w.title}
              initial={mounted ? { opacity: 0, y: 12 } : false}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              viewport={{ once: true }}
              style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: '20px 18px' }}
            >
              <div style={{ fontSize: 24, marginBottom: 10 }}>{w.icon}</div>
              <p style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: '0 0 6px' }}>{w.title}</p>
              <p style={{ fontSize: 13, color: T.sub, margin: 0, lineHeight: 1.6 }}>{w.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 64px' }}>
        <div className="cta-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

          {/* Consumer CTA */}
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            style={{ background: `linear-gradient(135deg, rgba(13,148,136,0.06) 0%, rgba(8,145,178,0.03) 100%)`, border: `1px solid ${T.borderHi}`, borderRadius: 18, padding: '24px 22px' }}
          >
            <h3 style={{ fontFamily: 'var(--font-display, system-ui)', fontSize: 16, fontWeight: 800, color: T.text, margin: '0 0 6px', letterSpacing: '-0.025em' }}>
              Need a local service?
            </h3>
            <p style={{ fontSize: 13, color: T.sub, margin: '0 0 16px', lineHeight: 1.6 }}>
              Trades, food, health, professional. AI finds the best near you — instantly.
            </p>
            <button
              onClick={() => go('plumber near me')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '11px 20px', minHeight: 44, borderRadius: 12, fontWeight: 700, fontSize: 13, color: '#fff', background: T.btnGrad, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(13,148,136,0.3)', transition: 'opacity 0.2s, transform 0.1s' }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Search now <ArrowRight size={13} />
            </button>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
              {['Free to search', 'No account needed', 'Instant results'].map(t => (
                <span key={t} style={{ fontSize: 10, color: T.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle size={9} style={{ color: T.teal }} /> {t}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Business CTA */}
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            viewport={{ once: true }}
            style={{ background: T.bgCard, border: `1px solid ${T.border2}`, borderRadius: 18, padding: '24px 22px', position: 'relative' }}
          >
            <div style={{ position: 'absolute', top: 14, right: 14, fontSize: 9, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: T.tealMid, color: T.teal, border: `1px solid ${T.borderHi}` }}>30 days free</div>
            <MapPin size={18} style={{ color: T.teal, marginBottom: 10 }} />
            <h3 style={{ fontFamily: 'var(--font-display, system-ui)', fontSize: 16, fontWeight: 800, color: T.text, margin: '0 0 6px', letterSpacing: '-0.025em' }}>
              Own a trade business?
            </h3>
            <p style={{ fontSize: 13, color: T.sub, margin: '0 0 16px', lineHeight: 1.6 }}>
              Local leads direct to you. 0% commission — ever. Just £15/mo after trial.
            </p>
            <Link
              href="/for-businesses"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '11px 20px', minHeight: 44, borderRadius: 12, fontWeight: 700, fontSize: 13, color: '#fff', background: T.btnGrad, textDecoration: 'none', boxShadow: '0 4px 14px rgba(13,148,136,0.3)' }}
            >
              List your trade free <ArrowRight size={13} />
            </Link>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
              {['0% commission', '£15/mo after trial', 'Cancel anytime'].map(t => (
                <span key={t} style={{ fontSize: 10, color: T.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle size={9} style={{ color: T.teal }} /> {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes ping-green { 0% { transform: scale(1); opacity: 1; } 75%, 100% { transform: scale(2.2); opacity: 0; } }
        @keyframes shimmer-light {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.85; }
        }

        .search-bar:focus-within {
          border-color: rgba(13,148,136,0.45) !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06), 0 0 0 3px rgba(13,148,136,0.08) !important;
        }

        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
          .demo-panel { order: 1; max-height: 340px; overflow: hidden; }
          .cat-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .how-grid { grid-template-columns: 1fr !important; }
          .why-grid { grid-template-columns: 1fr !important; }
          .cta-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .cat-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>

      <FloatingChat />
    </div>
  )
}
