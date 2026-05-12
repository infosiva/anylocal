'use client'
import { useState, useRef } from 'react'
import { Star, Phone, Globe, MapPin, Clock, ChevronDown, ChevronUp, MessageSquarePlus, Navigation } from 'lucide-react'

export interface PlaceResult {
  id:       string
  name:     string
  address:  string
  rating:   number
  reviews:  number
  phone:    string | null
  website:  string | null
  open:     boolean | null
  score:    number
  lat:      number | null
  lng:      number | null
}

interface Props {
  place:          PlaceResult
  rank:           number
  userLat:        number | null
  userLng:        number | null
  active:         boolean
  onRequestQuote: (p: PlaceResult) => void
  onActivate:     (id: string) => void
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1,2,3,4,5].map(i => (
          <Star key={i} size={12}
            className={i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-white/20'} />
        ))}
      </div>
      <span className="text-white/60 text-xs font-medium">{rating.toFixed(1)}</span>
      <span className="text-white/30 text-xs">({count.toLocaleString()})</span>
    </div>
  )
}

function TrustBadge({ score }: { score: number }) {
  const pct = Math.min(100, Math.round((score / 20) * 100))
  const label = pct >= 80 ? 'Excellent' : pct >= 60 ? 'Good' : pct >= 40 ? 'Fair' : 'Limited'
  const color = pct >= 80
    ? 'text-green-400 bg-green-400/10 border-green-400/20'
    : pct >= 60
      ? 'text-amber-400 bg-amber-400/10 border-amber-400/20'
      : 'text-white/40 bg-white/[0.04] border-white/10'
  return <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${color}`}>{label}</span>
}

export default function ResultCard({ place, rank, userLat, userLng, active, onRequestQuote, onActivate }: Props) {
  const [showSummary, setShowSummary] = useState(false)
  const [summary, setSummary]         = useState('')
  const [loadingSummary, setLoadingSummary] = useState(false)
  const summaryFetched = useRef(false)

  const distanceKm = (userLat !== null && userLng !== null && place.lat !== null && place.lng !== null)
    ? haversineKm(userLat, userLng, place.lat!, place.lng!)
    : null
  const distanceMi = distanceKm !== null ? (distanceKm * 0.621371) : null

  async function toggleSummary() {
    if (showSummary) { setShowSummary(false); return }
    setShowSummary(true)
    if (summaryFetched.current) return
    summaryFetched.current = true
    setLoadingSummary(true)
    setSummary('')
    try {
      const res = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: place.name, reviews: [] })
      })
      if (!res.ok || !res.body) { setSummary('Summary unavailable.'); return }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let text = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        text += decoder.decode(value)
        setSummary(text)
      }
    } catch {
      setSummary('Summary unavailable.')
    } finally {
      setLoadingSummary(false)
    }
  }

  return (
    <div
      onClick={() => onActivate(place.id)}
      className={`bg-white/[0.03] border rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer
        ${active
          ? 'border-orange-500/50 ring-1 ring-orange-500/30 bg-orange-500/[0.04]'
          : 'border-white/[0.06] hover:border-orange-500/20'
        }`}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Rank badge */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold
            ${rank === 1 ? 'bg-amber-500/20 text-amber-300' : rank === 2 ? 'bg-white/[0.08] text-white/60' : 'bg-white/[0.04] text-white/40'}`}>
            #{rank}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h3 className="font-bold text-white text-base leading-snug">{place.name}</h3>
                <div className="flex items-center gap-1.5 mt-1 text-white/40 text-xs">
                  <MapPin size={11} />
                  <span className="truncate max-w-xs">{place.address}</span>
                </div>
              </div>
              <TrustBadge score={place.score} />
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-3">
              {place.rating > 0 && <StarRating rating={place.rating} count={place.reviews} />}
              {place.open === true && (
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <Clock size={11} /> Open now
                </span>
              )}
              {place.open === false && (
                <span className="text-xs text-red-400/70 flex items-center gap-1">
                  <Clock size={11} /> Closed
                </span>
              )}
              {distanceMi !== null && (
                <span className="text-xs text-white/40 flex items-center gap-1">
                  <Navigation size={11} /> {distanceMi < 10 ? distanceMi.toFixed(1) : Math.round(distanceMi)} mi
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-4">
              {place.phone && (
                <a
                  href={`tel:${place.phone}`}
                  onClick={e => e.stopPropagation()}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-orange-500/15 border border-orange-500/25 text-orange-300 hover:bg-orange-500/25 transition-colors"
                >
                  <Phone size={12} /> {place.phone}
                </a>
              )}
              {place.website && (
                <a
                  href={place.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.10] text-white/60 hover:text-white/80 transition-colors"
                >
                  <Globe size={12} /> Website
                </a>
              )}
              {place.reviews > 0 && (
                <button
                  onClick={e => { e.stopPropagation(); toggleSummary() }}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 transition-colors"
                >
                  {showSummary ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  AI summary
                </button>
              )}
              <button
                onClick={e => { e.stopPropagation(); onRequestQuote(place) }}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-orange-500/20 border border-orange-500/35 text-orange-300 hover:bg-orange-500/30 font-semibold transition-colors"
              >
                <MessageSquarePlus size={12} /> Get quote
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI summary panel */}
      {showSummary && (
        <div className="border-t border-purple-500/10 px-5 py-4 bg-purple-500/[0.04]">
          {loadingSummary && (
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <div className="w-3 h-3 rounded-full border border-purple-400/60 border-t-transparent animate-spin" />
              Analysing reviews...
            </div>
          )}
          {summary && (
            <div>
              <div className="text-xs font-semibold text-purple-400 mb-2">AI Review Summary</div>
              <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">{summary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
