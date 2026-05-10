'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { X, Mic, MicOff, Send, Loader2, Terminal, ChevronDown, Trash2 } from 'lucide-react'

interface Msg { role: 'user' | 'assistant'; content: string }

const OWNER_KEY = 'anylocal-owner-2026'  // must match OWNER_KEY env var

function OwnerPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: "👋 Owner mode active. Ask me anything about AnyLocal — improvements, bugs, features, copy, SEO. I can also help you write code.\n\nTry: *\"What's the highest impact improvement I should make this week?\"*" }
  ])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const bottomRef      = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const toggleVoice = useCallback(() => {
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    if (!SR) { alert('Voice not supported in this browser. Try Chrome.'); return }
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }
    const rec = new SR()
    rec.continuous = false
    rec.interimResults = false
    rec.lang = 'en-GB'
    rec.onresult = (e: any) => {
      const t = e.results[0][0].transcript
      setInput(t)
    }
    rec.onend = () => setListening(false)
    rec.start()
    recognitionRef.current = rec
    setListening(true)
  }, [listening])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const userMsg: Msg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    try {
      const history = messages.filter(m => m.role !== 'assistant' || messages.indexOf(m) > 0).slice(-10)
      const r = await fetch('/api/owner-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, key: OWNER_KEY, history }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error ?? 'Error')
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ Error: ${e.message}` }])
    } finally {
      setLoading(false)
    }
  }

  function renderContent(text: string) {
    // Simple markdown: **bold**, `code`, newlines
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/)
      return (
        <span key={i}>
          {parts.map((p, j) => {
            if (p.startsWith('**') && p.endsWith('**'))
              return <strong key={j} style={{ color: '#fff', fontWeight: 700 }}>{p.slice(2,-2)}</strong>
            if (p.startsWith('`') && p.endsWith('`'))
              return <code key={j} style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: 4, fontSize: 11, fontFamily: 'monospace', color: '#86efac' }}>{p.slice(1,-1)}</code>
            return <span key={j}>{p}</span>
          })}
          {'\n'}
        </span>
      )
    })
  }

  return (
    <div style={{
      position: 'fixed', bottom: 80, right: 20, zIndex: 9999,
      width: 400, maxWidth: 'calc(100vw - 32px)',
      maxHeight: '70vh', display: 'flex', flexDirection: 'column',
      background: '#0a0a1a', border: '1px solid rgba(251,191,36,0.3)',
      borderRadius: 20, boxShadow: '0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(251,191,36,0.1)',
      fontFamily: 'system-ui, sans-serif',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Terminal size={16} style={{ color: '#fbbf24' }} />
        <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>Owner Assistant</span>
        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: 'rgba(251,191,36,0.15)', color: '#fbbf24', fontWeight: 700, border: '1px solid rgba(251,191,36,0.25)' }}>PRIVATE</span>
        <div style={{ flex: 1 }} />
        <button onClick={() => setMessages([messages[0]])} title="Clear chat"
          style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)' }}>
          <Trash2 size={13} />
        </button>
        <button onClick={onClose}
          style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '88%', padding: '10px 13px', borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              background: m.role === 'user' ? 'linear-gradient(135deg,#92400e,#78350f)' : 'rgba(255,255,255,0.05)',
              border: m.role === 'user' ? '1px solid rgba(251,191,36,0.2)' : '1px solid rgba(255,255,255,0.06)',
              fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.55, whiteSpace: 'pre-wrap',
            }}>
              {renderContent(m.content)}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ padding: '10px 13px', borderRadius: '14px 14px 14px 4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Loader2 size={14} style={{ color: '#fbbf24', animation: 'spin 1s linear infinite' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <button onClick={toggleVoice}
            style={{ padding: '8px', borderRadius: 10, border: 'none', cursor: 'pointer', flexShrink: 0,
              background: listening ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)',
              color: listening ? '#f87171' : 'rgba(255,255,255,0.5)' }}>
            {listening ? <MicOff size={15} /> : <Mic size={15} />}
          </button>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder={listening ? '🎤 Listening…' : 'Ask anything about AnyLocal… (Enter to send)'}
            rows={2}
            style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 12px', color: '#fff', fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'inherit', lineHeight: 1.4 }}
          />
          <button onClick={send} disabled={!input.trim() || loading}
            style={{ padding: '8px 12px', borderRadius: 10, border: 'none', cursor: !input.trim() || loading ? 'not-allowed' : 'pointer', flexShrink: 0,
              background: !input.trim() || loading ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#d97706,#b45309)',
              color: !input.trim() || loading ? 'rgba(255,255,255,0.3)' : '#fff' }}>
            <Send size={15} />
          </button>
        </div>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', margin: '6px 0 0', textAlign: 'center' }}>
          Private · Shift+Alt+O to toggle · Voice input supported
        </p>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// Floating trigger button + keyboard shortcut
export default function OwnerAssistant() {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Keyboard shortcut: Shift+Alt+O
    function onKey(e: KeyboardEvent) {
      if (e.shiftKey && e.altKey && e.key === 'O') {
        setVisible(v => !v)
        setOpen(v => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!visible && !open) {
    return (
      <button
        onClick={() => { setVisible(true); setOpen(true) }}
        title="Owner Assistant (Shift+Alt+O)"
        style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 9998,
          width: 44, height: 44, borderRadius: '50%', border: '1px solid rgba(251,191,36,0.3)',
          background: 'rgba(10,10,26,0.9)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          opacity: 0.4,
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '0.4')}
      >
        <Terminal size={18} style={{ color: '#fbbf24' }} />
      </button>
    )
  }

  return open ? <OwnerPanel onClose={() => { setOpen(false); setVisible(false) }} /> : null
}
