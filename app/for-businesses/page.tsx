'use client'
import { useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle, Phone, Zap, Star, Shield, TrendingUp,
  Mail, User, MapPin, Briefcase, ArrowRight, MessageSquare
} from 'lucide-react'

const TRADES = [
  { id: 'plumber',     label: '🔧 Plumber' },
  { id: 'electrician', label: '⚡ Electrician' },
  { id: 'ac-hvac',     label: '❄️ AC & HVAC' },
  { id: 'builder',     label: '🏗️ Builder' },
  { id: 'carpenter',   label: '🪚 Carpenter' },
  { id: 'painter',     label: '🖌️ Painter & Decorator' },
  { id: 'cleaner',     label: '🧹 Deep Cleaner' },
  { id: 'handyman',    label: '🛠️ Handyman' },
  { id: 'gardener',    label: '🌿 Gardener' },
  { id: 'locksmith',   label: '🔑 Locksmith' },
  { id: 'cctv',        label: '📷 CCTV & Security' },
  { id: 'roofer',      label: '🏠 Roofer' },
  { id: 'mechanic',    label: '🚗 Mechanic' },
  { id: 'other',       label: '➕ Other trade' },
]

const BENEFITS = [
  {
    icon: <TrendingUp size={20} />,
    title: 'Appear when customers search',
    desc: 'When someone searches "plumber near me" or "electrician in [your area]" on AnyLocal, your verified listing surfaces at the top alongside Google results.',
  },
  {
    icon: <MessageSquare size={20} />,
    title: 'Receive qualified leads directly',
    desc: 'Customers fill in a job description, postcode and contact details — you get the full lead by email immediately. No middleman, no booking fee taken from your job.',
  },
  {
    icon: <Star size={20} />,
    title: 'AI review summary works for you',
    desc: 'Your existing Google reviews are summarised by AI. Customers see your reputation honestly — good reviews shine. Great work gets noticed.',
  },
  {
    icon: <Shield size={20} />,
    title: 'Verified badge builds trust',
    desc: 'Claimed listings get a Verified badge. Customers trust verified businesses — higher click-through, more quote requests.',
  },
  {
    icon: <Phone size={20} />,
    title: 'Direct phone calls — zero commission',
    desc: 'Customers can call you directly from your listing. Every job you win is 100% yours. AnyLocal never takes a commission cut from your earnings.',
  },
  {
    icon: <Zap size={20} />,
    title: '£15/month — less than one call-out',
    desc: 'Less than the cost of a single call-out charge. One extra job per month from AnyLocal and it pays for itself many times over.',
  },
]

const STEPS = [
  { n: '1', title: 'Register your trade', desc: 'Fill in your name, trade type, postcode and contact details. Takes 2 minutes.' },
  { n: '2', title: 'We verify & activate', desc: 'We match your registration to your Google business listing (if you have one) and activate your profile within 24 hours.' },
  { n: '3', title: 'Receive quote requests', desc: 'When local customers search your trade on AnyLocal, you appear. They request a quote — you get the lead by email.' },
  { n: '4', title: 'Win the job — keep it all', desc: 'You call the customer, agree a price, do the work. AnyLocal takes zero commission. You keep every penny.' },
]

type Step = 'form' | 'success'

export default function ForBusinessesPage() {
  const [step, setStep]     = useState<Step>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [bizName, setBizName] = useState('')

  const [form, setForm] = useState({
    name:     '',
    bizName:  '',
    email:    '',
    phone:    '',
    postcode: '',
    trades:   [] as string[],
    message:  '',
  })

  function toggleTrade(id: string) {
    setForm(f => ({
      ...f,
      trades: f.trades.includes(id) ? f.trades.filter(t => t !== id) : [...f.trades, id],
    }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.postcode) {
      setError('Please fill name, email and postcode.')
      return
    }
    if (!form.trades.length) {
      setError('Select at least one trade.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/business-register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Registration failed.'); return }
      setBizName(form.bizName || form.name)
      setStep('success')
    } catch {
      setError('Network error — please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="overflow-hidden">

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative px-6 pt-20 pb-20 max-w-5xl mx-auto text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20 blur-3xl -z-10 bg-gradient-to-br from-orange-600 to-amber-400" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs font-medium mb-6">
          <Zap size={12} /> For Tradespeople — 30 days free, then £15/month
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-4">
          <span className="text-white">Get more local jobs.</span>
          <br />
          <span className="bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">Keep every penny.</span>
        </h1>

        <p className="text-white/55 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
          AnyLocal connects homeowners and businesses with trusted local tradespeople — no booking fees, no commission.
          You pay £15/month. Every job you win is 100% yours.
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {['✓ 30 days free — no card needed', '✓ 0% commission on every job', '✓ Direct leads by email', '✓ Cancel any time'].map(t => (
            <span key={t} className="text-sm text-white/70 bg-white/[0.05] border border-white/[0.08] px-4 py-1.5 rounded-full">{t}</span>
          ))}
        </div>

        <a href="#register" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-orange-600 to-orange-400 hover:from-orange-700 hover:to-orange-500 transition-all shadow-lg shadow-orange-500/25 text-base">
          List your trade free <ArrowRight size={18} />
        </a>
      </section>

      {/* ── STATS ─────────────────────────────────────────── */}
      <section className="border-y border-white/[0.06] py-8 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { n: '0%',    l: 'Commission on jobs' },
            { n: '£15',   l: 'Per month after trial' },
            { n: '30',    l: 'Days free listing' },
            { n: '< 24h', l: 'To go live' },
          ].map(s => (
            <div key={s.l}>
              <div className="text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">{s.n}</div>
              <div className="text-white/45 text-sm mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BENEFITS ──────────────────────────────────────── */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">What you get</h2>
          <p className="text-white/45">Everything a tradesperson needs to win more local work</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map(b => (
            <div key={b.title} className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm rounded-2xl p-5 flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                {b.icon}
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">{b.title}</h4>
                <p className="text-white/50 text-sm leading-relaxed">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section className="py-20 px-6 bg-white/[0.02] border-y border-white/[0.06]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">How it works</h2>
            <p className="text-white/45">From registration to receiving jobs in under 24 hours</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.n} className="text-center relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[calc(50%+28px)] right-0 h-px bg-gradient-to-r from-orange-500/40 to-transparent" />
                )}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-600 to-orange-400 flex items-center justify-center text-white font-extrabold text-lg mx-auto mb-4 relative z-10">
                  {s.n}
                </div>
                <h4 className="font-bold text-white text-sm mb-2">{s.title}</h4>
                <p className="text-white/45 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────── */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Simple pricing</h2>
          <p className="text-white/45">No surprises. No commission. Cancel any time.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free trial */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-7">
            <div className="text-white/40 text-xs uppercase tracking-widest font-bold mb-3">Free trial</div>
            <div className="text-4xl font-extrabold text-white mb-1">£0</div>
            <div className="text-white/40 text-sm mb-5">for 30 days — no card needed</div>
            <ul className="space-y-2.5">
              {['Full profile listing', 'Appear in search results', 'Receive quote requests', 'Email leads delivered', 'AI review summary active'].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                  <CheckCircle size={14} className="text-orange-400 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </div>
          {/* Pro */}
          <div className="bg-gradient-to-br from-orange-600/15 to-amber-500/10 border border-orange-500/30 rounded-2xl p-7 relative">
            <div className="absolute -top-3 left-6">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-orange-600 to-orange-400 text-white">Most popular</span>
            </div>
            <div className="text-orange-400 text-xs uppercase tracking-widest font-bold mb-3">Pro listing</div>
            <div className="text-4xl font-extrabold text-white mb-1">£15<span className="text-white/40 text-lg font-normal">/mo</span></div>
            <div className="text-white/40 text-sm mb-5">after free trial — cancel any time</div>
            <ul className="space-y-2.5">
              {['Everything in free', 'Priority ranking in search', 'Verified badge on listing', 'Direct phone calls shown', 'Unlimited leads', 'Monthly performance report'].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/80">
                  <CheckCircle size={14} className="text-orange-400 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <a href="#register" className="mt-6 flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-orange-600 to-orange-400 hover:from-orange-700 hover:to-orange-500 transition-all shadow-lg shadow-orange-500/20">
              Start free trial <ArrowRight size={16} />
            </a>
          </div>
        </div>
        <p className="text-center text-white/30 text-xs mt-6">
          Less than a single call-out charge. One extra job covers it for months.
        </p>
      </section>

      {/* ── REGISTRATION FORM ─────────────────────────────── */}
      <section id="register" className="py-20 px-6 bg-white/[0.02] border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">List your trade — free for 30 days</h2>
            <p className="text-white/45">Takes 2 minutes. No card required.</p>
          </div>

          {step === 'success' ? (
            <div className="max-w-md mx-auto bg-white/[0.04] border border-orange-500/25 rounded-3xl p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-orange-500/15 flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={32} className="text-orange-400" />
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-2">You&apos;re registered, {bizName}!</h3>
              <p className="text-white/55 mb-4 text-sm leading-relaxed">
                We&apos;ll verify and activate your listing within 24 hours. You&apos;ll get an email confirmation shortly.
              </p>
              <div className="bg-orange-500/8 border border-orange-500/20 rounded-xl p-4 mb-6 text-left">
                <p className="text-orange-400 text-xs font-bold uppercase tracking-wide mb-1">What happens next</p>
                <ul className="space-y-1 text-white/55 text-sm">
                  <li>✓ Confirmation email on its way to you</li>
                  <li>✓ Profile activated within 24 hours</li>
                  <li>✓ First lead notifications start immediately</li>
                </ul>
              </div>
              <Link href="/" className="text-orange-400 text-sm hover:text-orange-300 transition-colors">
                ← Back to AnyLocal
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-10 items-start">
              {/* Left — why register */}
              <div className="space-y-5">
                <h3 className="text-white font-bold text-xl">Why list on AnyLocal?</h3>
                <div className="space-y-4">
                  {[
                    { icon: '🎯', t: 'Customers already searching', d: 'People search AnyLocal when they need a tradesperson right now — high intent, ready to book.' },
                    { icon: '💰', t: '0% commission — forever', d: 'Urban Company, Checkatrade, MyBuilder all take 10–25% of your job. AnyLocal never does.' },
                    { icon: '📧', t: 'Leads hit your inbox instantly', d: 'When a customer sends a quote request, you get the full details immediately — name, job, postcode, phone.' },
                    { icon: '⭐', t: 'Your Google reviews work for you', d: 'We pull and summarise your existing Google reviews. Better reviews = more clicks = more jobs.' },
                  ].map(item => (
                    <div key={item.t} className="flex items-start gap-4 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                      <span className="text-2xl flex-shrink-0">{item.icon}</span>
                      <div>
                        <p className="text-white font-semibold text-sm">{item.t}</p>
                        <p className="text-white/50 text-xs mt-0.5 leading-relaxed">{item.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-4">
                  <p className="text-amber-400 text-xs font-bold uppercase tracking-wide mb-1">vs competitors</p>
                  <div className="text-xs text-white/55 space-y-1">
                    <div className="flex justify-between"><span>MyBuilder</span><span className="text-red-400">10–20% commission</span></div>
                    <div className="flex justify-between"><span>Checkatrade</span><span className="text-red-400">£600–£1,200/year</span></div>
                    <div className="flex justify-between"><span>Urban Company</span><span className="text-red-400">20–25% per job</span></div>
                    <div className="flex justify-between font-bold"><span className="text-orange-400">AnyLocal</span><span className="text-orange-400">£15/month, 0% commission</span></div>
                  </div>
                </div>
              </div>

              {/* Right — form */}
              <form onSubmit={submit} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 space-y-4">
                <h3 className="text-white font-bold text-lg">Register your business</h3>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2 text-red-400 text-sm">{error}</div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/50 text-xs mb-1 block flex items-center gap-1"><User size={10} /> Your name *</label>
                    <input className="input-dark w-full text-sm" placeholder="John Smith" value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs mb-1 block flex items-center gap-1"><Briefcase size={10} /> Business name</label>
                    <input className="input-dark w-full text-sm" placeholder="Smith Plumbing Ltd" value={form.bizName}
                      onChange={e => setForm(f => ({ ...f, bizName: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs mb-1 block flex items-center gap-1"><Mail size={10} /> Email *</label>
                    <input className="input-dark w-full text-sm" type="email" value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs mb-1 block flex items-center gap-1"><Phone size={10} /> Phone</label>
                    <input className="input-dark w-full text-sm" placeholder="07911 123456" value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div className="col-span-2">
                    <label className="text-white/50 text-xs mb-1 block flex items-center gap-1"><MapPin size={10} /> Postcode / Area *</label>
                    <input className="input-dark w-full text-sm" placeholder="SW1A 1AA or Greater London" value={form.postcode}
                      onChange={e => setForm(f => ({ ...f, postcode: e.target.value }))} required />
                  </div>
                </div>

                <div>
                  <label className="text-white/50 text-xs mb-2 block">Trade(s) you offer *</label>
                  <div className="flex flex-wrap gap-2">
                    {TRADES.map(t => (
                      <button key={t.id} type="button" onClick={() => toggleTrade(t.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                          form.trades.includes(t.id)
                            ? 'bg-gradient-to-r from-orange-600 to-orange-400 text-white border-transparent'
                            : 'border-white/10 text-white/50 hover:border-white/25'
                        }`}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-white/50 text-xs mb-1 block">Anything else? (optional)</label>
                  <textarea className="input-dark w-full text-sm resize-none" rows={2}
                    placeholder="Years of experience, certifications, area you cover..."
                    value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-orange-600 to-orange-400 hover:from-orange-700 hover:to-orange-500 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50">
                  {loading ? (
                    <><div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Registering…</>
                  ) : (
                    <>Start 30-day free listing <ArrowRight size={16} /></>
                  )}
                </button>
                <p className="text-center text-white/25 text-xs">No card. No commitment. Cancel any time.</p>
              </form>
            </div>
          )}
        </div>
      </section>

    </div>
  )
}
