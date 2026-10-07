'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, ArrowRight, Mic, MicOff, MapPin, Navigation } from 'lucide-react'
import config from '../vertical.config'
import { MagneticButton } from '@infosiva/shared-ui/modern'

const INK = '#0f1419'
const AMBER = '#f0bc42'
const CREAM = '#fffbf5'
const AMBER_TEXT = '#8a5d00' // 5.6:1 on cream

const STEPS = [
  { n: '1', t: 'Say what you need', d: 'Plain words: "emergency plumber" or "quiet cafe with wifi".' },
  { n: '2', t: 'AI reads the reviews', d: 'Public reviews are summarised into strengths and warnings, so you do not have to read them all.' },
  { n: '3', t: 'Call them directly', d: 'No middleman fee. Ask for a quote or phone the business yourself.' },
]

// Decorative pins on the map backdrop: positions only, no business data.
const PINS = [
  { x: 14, y: 30, c: 0 }, { x: 31, y: 64, c: 5 }, { x: 52, y: 22, c: 1 },
  { x: 68, y: 58, c: 6 }, { x: 84, y: 28, c: 3 }, { x: 44, y: 76, c: 8 },
]

function MapBackdrop() {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <style>{`
        @keyframes al-pan { from { transform: translate3d(0,0,0) } to { transform: translate3d(-80px,-40px,0) } }
        @keyframes al-ping { 0% { transform: scale(.6); opacity: .7 } 100% { transform: scale(2.6); opacity: 0 } }
        @keyframes al-sweep { from { transform: rotate(0) } to { transform: rotate(360deg) } }
        @keyframes al-glow { 0%,100% { opacity: .55 } 50% { opacity: .9 } }
        .al-pan { animation: al-pan 40s linear infinite alternate; }
        .al-ping { animation: al-ping 2.8s ease-out infinite; }
        .al-sweep { animation: al-sweep 14s linear infinite; }
        .al-glow { animation: al-glow 6s ease-in-out infinite; }
      `}</style>
      <div className="al-glow" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 60% at 70% 40%, rgba(240,188,66,0.22), transparent 70%), radial-gradient(ellipse 50% 50% at 10% 90%, rgba(40,90,120,0.35), transparent 70%)' }} />
      <svg className="al-pan" width="130%" height="130%" style={{ position: 'absolute', left: '-10%', top: '-10%' }}>
        <defs>
          <pattern id="blocks" width="120" height="90" patternUnits="userSpaceOnUse">
            <path d="M0 45H120M60 0V90" stroke="rgba(255,251,245,0.07)" strokeWidth="6" fill="none" />
            <path d="M0 0H120M0 0V90" stroke="rgba(255,251,245,0.045)" strokeWidth="1.5" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#blocks)" />
        <path d="M-50 380C260 300 420 520 760 400S1180 300 1500 420" stroke="rgba(240,188,66,0.22)" strokeWidth="10" fill="none" strokeLinecap="round" />
      </svg>
      <div className="al-sweep" style={{ position: 'absolute', left: '70%', top: '40%', width: 900, height: 900, marginLeft: -450, marginTop: -450, background: 'conic-gradient(from 0deg, rgba(240,188,66,0.16), transparent 22%)', borderRadius: '50%' }} />
      {PINS.map((p, i) => (
        <span key={i} style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, width: 38, height: 38, marginLeft: -19, marginTop: -19 }}>
          <span className="al-ping" style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${AMBER}`, animationDelay: `${i * 0.45}s` }} />
          <span style={{ position: 'absolute', inset: 6, borderRadius: '50%', background: 'rgba(15,20,25,0.85)', border: `1.5px solid ${AMBER}`, display: 'grid', placeItems: 'center', fontSize: 15 }}>{config.categories[p.c]?.icon}</span>
        </span>
      ))}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,20,25,0.35) 0%, rgba(15,20,25,0.1) 40%, #0f1419 100%)' }} />
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const [query, setQ] = useState('')
  const [listening, setL] = useState(false)
  const [locating, setLoc] = useState<string | null>(null)
  const recRef = useRef<any>(null)
  const gpsRef = useRef<{ lat: number; lng: number } | null>(null)
  const [voiceOk, setVoiceOk] = useState(false)
  useEffect(() => { setVoiceOk(!!((window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition)) }, [])

  const cats = config.categories.slice(0, 12)

  function go(q?: string) {
    const term = (q ?? query).trim()
    if (!term) return
    const g = gpsRef.current
    router.push(`/search?q=${encodeURIComponent(term)}${g ? `&lat=${g.lat}&lng=${g.lng}` : ''}`)
  }

  function nearMe(label: string, id: string) {
    setLoc(id)
    const fallback = () => { setLoc(null); router.push(`/search?q=${encodeURIComponent(label + ' near me')}`) }
    if (!navigator.geolocation) return fallback()
    navigator.geolocation.getCurrentPosition(
      pos => {
        gpsRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setLoc(null)
        router.push(`/search?q=${encodeURIComponent(label + ' near me')}&lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`)
      },
      fallback,
      { timeout: 6000 },
    )
  }

  function toggleVoice() {
    if (listening) { recRef.current?.stop(); setL(false); return }
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    if (!SR) return
    const rec = new SR()
    rec.lang = 'en-GB'; rec.continuous = false; rec.interimResults = false
    rec.onstart = () => setL(true)
    rec.onend = () => setL(false)
    rec.onerror = () => setL(false)
    rec.onresult = (e: any) => { const t = e.results[0][0].transcript; setQ(t); go(t) }
    recRef.current = rec; rec.start()
  }

  return (
    <div style={{ background: INK, color: CREAM }}>
      {/* HERO — map-first: the map is the page, search floats on it */}
      <section style={{ position: 'relative', minHeight: 560 }}>
        <MapBackdrop />
        <div style={{ position: 'relative', maxWidth: 1152, margin: '0 auto', padding: '56px 16px 40px' }}>
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: AMBER, margin: 0 }}>
            <MapPin size={14} /> Local search, anywhere
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}
            style={{ fontSize: 'clamp(34px, 7vw, 64px)', lineHeight: 1.04, fontWeight: 800, letterSpacing: '-0.03em', margin: '14px 0 12px', maxWidth: 680 }}>
            Find the right local business, <span style={{ color: AMBER }}>fast.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            style={{ fontSize: 17, lineHeight: 1.5, color: 'rgba(255,251,245,0.8)', maxWidth: 520, margin: '0 0 24px' }}>
            AI reads the reviews and tells you what they really say. No commission, no sign-up to search.
          </motion.p>

          <motion.form initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.45 }}
            onSubmit={e => { e.preventDefault(); go() }} role="search"
            className="search-bar"
            style={{ display: 'flex', alignItems: 'center', gap: 8, maxWidth: 640, background: CREAM, borderRadius: 16, padding: 8, border: '2px solid transparent', boxShadow: '0 20px 60px rgba(0,0,0,0.45)' }}>
            <Search size={20} color={AMBER_TEXT} style={{ marginLeft: 10, flexShrink: 0 }} aria-hidden="true" />
            <input value={query} onChange={e => setQ(e.target.value)} aria-label="What and where"
              placeholder="plumber in Leeds, thai near me..."
              style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontSize: 16, color: INK, padding: '12px 4px', minHeight: 44 }} />
            {voiceOk && (
              <button type="button" onClick={toggleVoice} aria-label={listening ? 'Stop voice input' : 'Search by voice'}
                style={{ width: 44, height: 44, borderRadius: 12, border: 'none', background: 'transparent', color: INK, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                {listening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            )}
            <MagneticButton type="submit" className="al-btn"
              style={{ minHeight: 44, padding: '0 20px', borderRadius: 12, border: 'none', background: AMBER, color: '#1c1503', fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Search <ArrowRight size={16} />
            </MagneticButton>
          </motion.form>

          <div className="cat-scroll" style={{ marginTop: 18, maxWidth: 760 }} role="list" aria-label="Browse nearby by category">
            {cats.map(c => (
              <button key={c.id} role="listitem" onClick={() => nearMe(c.label, c.id)} className="al-btn"
                style={{ flexShrink: 0, minHeight: 44, padding: '0 14px', borderRadius: 999, border: '1px solid rgba(240,188,66,0.4)', background: 'rgba(15,20,25,0.7)', color: CREAM, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span aria-hidden="true">{c.icon}</span>{c.label}
                {locating === c.id && <Navigation size={12} color={AMBER} aria-label="Finding your location" />}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* HOW */}
      <section style={{ background: CREAM, color: INK, padding: '56px 16px' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 28px' }}>How it works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {STEPS.map(s => (
              <div key={s.n} className="local-card" style={{ background: '#fff', border: '1px solid rgba(15,20,25,0.12)', borderRadius: 16, padding: 22 }}>
                <span style={{ display: 'inline-grid', placeItems: 'center', width: 36, height: 36, borderRadius: 10, background: AMBER, color: '#1c1503', fontWeight: 800 }}>{s.n}</span>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: '14px 0 6px' }}>{s.t}</h3>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: 'rgba(15,20,25,0.75)' }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BUSINESS CTA */}
      <section style={{ padding: '48px 16px', background: INK }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 'clamp(22px, 3.6vw, 30px)', fontWeight: 800, margin: '0 0 6px' }}>Run a local business?</h2>
            <p style={{ margin: 0, color: 'rgba(255,251,245,0.75)' }}>List for free. You keep 100% of every job.</p>
          </div>
          <Link href="/for-businesses" className="al-btn"
            style={{ minHeight: 44, padding: '0 22px', borderRadius: 12, background: AMBER, color: '#1c1503', fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            List your business <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}
