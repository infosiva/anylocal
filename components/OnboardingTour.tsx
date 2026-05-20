'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Star, Zap } from 'lucide-react'

const STEPS = [
  {
    icon: <Search size={24} />,
    title: 'Search anything local',
    body: 'Type a service and location — "plumber in Manchester", "best Thai near me". AI understands natural language.',
    color: '#f97316',
  },
  {
    icon: <Star size={24} />,
    title: 'Real reviews, honestly ranked',
    body: 'We analyse hundreds of Google & Yelp reviews per business. No paid placements — only quality signals.',
    color: '#f59e0b',
  },
  {
    icon: <Zap size={24} />,
    title: 'Instant results, free forever',
    body: 'No account, no ads, no commission. TradeSpot is free for consumers — always.',
    color: '#fb923c',
  },
]

const STORAGE_KEY = 'tradespot_onboarded'

export default function OnboardingTour() {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem(STORAGE_KEY)) {
      const t = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(t)
    }
  }, [])

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  function next() {
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else dismiss()
  }

  const current = STEPS[step]

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={dismiss}
            style={{
              position: 'fixed', inset: 0, zIndex: 9000,
              background: 'rgba(0,0,0,0.72)',
              backdropFilter: 'blur(6px)',
            }}
          />

          {/* Card */}
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed', zIndex: 9001,
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'min(360px, calc(100vw - 40px))',
              background: '#131008',
              border: '1px solid rgba(249,115,22,0.25)',
              borderRadius: 24,
              padding: '32px 28px 24px',
              boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04) inset',
            }}
          >
            {/* Close */}
            <button
              onClick={dismiss}
              style={{
                position: 'absolute', top: 14, right: 14,
                background: 'rgba(255,255,255,0.05)',
                border: 'none', borderRadius: 8,
                padding: 6, cursor: 'pointer',
                color: 'rgba(250,248,244,0.4)',
                display: 'flex', alignItems: 'center',
              }}
              aria-label="Skip tour"
            >
              <X size={14} />
            </button>

            {/* Icon */}
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: `rgba(${current.color === '#f97316' ? '249,115,22' : current.color === '#f59e0b' ? '245,158,11' : '251,146,60'},0.12)`,
              border: `1px solid ${current.color}33`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: current.color, marginBottom: 20,
            }}>
              {current.icon}
            </div>

            {/* Text */}
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#faf8f4', margin: '0 0 10px', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
              {current.title}
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(250,248,244,0.6)', lineHeight: 1.65, margin: '0 0 28px' }}>
              {current.body}
            </p>

            {/* Progress dots */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: 3, borderRadius: 99,
                    flex: i === step ? 2 : 1,
                    background: i <= step ? current.color : 'rgba(255,255,255,0.12)',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={dismiss}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 12,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  fontSize: 13, fontWeight: 600, color: 'rgba(250,248,244,0.5)',
                  cursor: 'pointer',
                }}
              >
                Skip
              </button>
              <button
                onClick={next}
                style={{
                  flex: 2, padding: '12px 0', borderRadius: 12,
                  background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                  border: 'none',
                  fontSize: 13, fontWeight: 700, color: '#fff',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(234,88,12,0.4)',
                }}
              >
                {step < STEPS.length - 1 ? 'Next →' : 'Start searching →'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
