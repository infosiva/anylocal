# AnyLocal Search Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace toggle-between-list-and-map with persistent split-pane search results — always-visible map, inline AI summaries, distance display, filter pills, and bidirectional card↔pin click sync.

**Architecture:** Extract `ResultCard` into its own component, add `activeId` state to page for card↔map sync, update `MapView` to accept `activeId` + `onPinClick` props, create `/api/ai-summary` streaming route, add filter state backed by URL search params.

**Tech Stack:** Next.js 15 App Router, Leaflet, Groq→Gemini fallback (lib/ai.ts), Tailwind CSS, TypeScript

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `app/search/page.tsx` | Modify | Split layout, filter state (openNow/minRating/sortBy), activeId state, URL param sync |
| `components/ResultCard.tsx` | Create | Card UI: rank badge, trust badge, stars, distance, actions, inline AI summary expand |
| `components/MapView.tsx` | Modify | Accept `activeId`+`onPinClick` props, fly-to on activeId change, emit pin click |
| `app/api/ai-summary/route.ts` | Create | POST handler: takes name+reviews[], streams AI summary via Groq→Gemini |

---

### Task 1: Create `/api/ai-summary` streaming route

**Files:**
- Create: `app/api/ai-summary/route.ts`

- [ ] **Step 1: Write the test**

Create `app/api/ai-summary/route.test.ts`:
```typescript
import { POST } from './route'

test('returns streaming text response for valid input', async () => {
  const req = new Request('http://localhost/api/ai-summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Acme Plumbers',
      reviews: [
        { rating: 5, text: 'Great service, fixed leak fast', author: 'John', time: '1 month ago' },
        { rating: 4, text: 'Good work, arrived on time', author: 'Jane', time: '2 months ago' },
      ]
    })
  })
  const res = await POST(req)
  expect(res.status).toBe(200)
  expect(res.headers.get('content-type')).toContain('text/plain')
})

test('returns 400 for missing name', async () => {
  const req = new Request('http://localhost/api/ai-summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reviews: [] })
  })
  const res = await POST(req)
  expect(res.status).toBe(400)
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
cd /Users/sivaprakasam/projects/agents/tradespot
npx jest app/api/ai-summary/route.test.ts --no-coverage 2>&1 | tail -20
```
Expected: `Cannot find module './route'`

- [ ] **Step 3: Create the route**

```typescript
// app/api/ai-summary/route.ts
import { NextRequest } from 'next/server'

interface ReviewInput {
  rating: number
  text: string
  author: string
  time: string
}

export async function POST(req: NextRequest) {
  let body: { name?: string; reviews?: ReviewInput[] }
  try { body = await req.json() } catch { return new Response('Bad JSON', { status: 400 }) }

  const { name, reviews } = body
  if (!name) return new Response('name required', { status: 400 })

  const reviewText = (reviews ?? [])
    .slice(0, 5)
    .map(r => `[${r.rating}★] ${r.author}: ${r.text}`)
    .join('\n')

  const prompt = `You are reviewing "${name}" based on customer reviews. Write a concise 2-3 sentence summary covering:
1. What customers consistently praise (start with a positive bullet "✓ ")
2. Any recurring concerns (start with "⚠ " only if real issues exist)
Keep it factual, under 60 words. Reviews:\n${reviewText || 'No reviews available.'}`

  // Try Groq first
  const groqKey = process.env.GROQ_API_KEY
  if (groqKey) {
    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: prompt }],
          stream: true,
          max_tokens: 120,
        })
      })
      if (groqRes.ok && groqRes.body) {
        const stream = transformSSEtoText(groqRes.body)
        return new Response(stream, {
          headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' }
        })
      }
    } catch {}
  }

  // Gemini fallback
  const geminiKey = process.env.GEMINI_API_KEY
  if (geminiKey) {
    try {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        }
      )
      if (geminiRes.ok) {
        const d = await geminiRes.json()
        const text = d.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No summary available.'
        return new Response(text, {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        })
      }
    } catch {}
  }

  return new Response('AI summary unavailable', { status: 503 })
}

function transformSSEtoText(body: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()
  const reader = body.getReader()

  return new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read()
      if (done) { controller.close(); return }
      const chunk = decoder.decode(value)
      for (const line of chunk.split('\n')) {
        if (!line.startsWith('data: ') || line === 'data: [DONE]') continue
        try {
          const delta = JSON.parse(line.slice(6))?.choices?.[0]?.delta?.content
          if (delta) controller.enqueue(encoder.encode(delta))
        } catch {}
      }
    }
  })
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npx jest app/api/ai-summary/route.test.ts --no-coverage 2>&1 | tail -10
```
Expected: `Tests: 2 passed`

- [ ] **Step 5: Commit**

```bash
git add app/api/ai-summary/route.ts app/api/ai-summary/route.test.ts
git commit -m "feat: add streaming AI summary API route (Groq→Gemini fallback)"
```

---

### Task 2: Extract `ResultCard` component

**Files:**
- Create: `components/ResultCard.tsx`

- [ ] **Step 1: Create ResultCard with existing card markup + distance + streaming AI summary**

```typescript
// components/ResultCard.tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add components/ResultCard.tsx
git commit -m "feat: extract ResultCard component with distance, active state, streaming AI summary"
```

---

### Task 3: Update `MapView` with activeId sync

**Files:**
- Modify: `components/MapView.tsx`

- [ ] **Step 1: Read current MapView** (already read above — proceed directly)

- [ ] **Step 2: Replace MapView with updated version**

Replace entire file content:
```typescript
'use client'
import { useEffect, useRef } from 'react'

interface PlaceResult {
  id:      string
  name:    string
  address: string
  rating:  number
  reviews: number
  phone:   string | null
  website: string | null
  open:    boolean | null
  score:   number
  lat:     number | null
  lng:     number | null
}

interface Props {
  results:    PlaceResult[]
  activeId:   string | null
  onPinClick: (id: string) => void
}

export default function MapView({ results, activeId, onPinClick }: Props) {
  const mapRef     = useRef<HTMLDivElement>(null)
  const mapInst    = useRef<any>(null)
  const markersRef = useRef<Map<string, any>>(new Map())

  const valid = results.filter(r => r.lat !== null && r.lng !== null)

  // Initialise map and markers
  useEffect(() => {
    if (!mapRef.current || valid.length === 0) return

    import('leaflet').then(L => {
      const Leaflet = L.default ?? L

      delete (Leaflet.Icon.Default.prototype as any)._getIconUrl
      Leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      if (!mapInst.current) {
        mapInst.current = Leaflet.map(mapRef.current!, { zoomControl: true })
        Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
        }).addTo(mapInst.current)
      }

      // Clear old markers
      markersRef.current.forEach(m => m.remove())
      markersRef.current.clear()

      const bounds: [number, number][] = []

      valid.forEach((place, i) => {
        const lat = place.lat!
        const lng = place.lng!
        const isTop = i === 0

        const makeIcon = (highlighted: boolean) => Leaflet.divIcon({
          className: '',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -36],
          html: `<div style="
            width:32px;height:32px;
            background:${isTop ? '#f97316' : highlighted ? '#a855f7' : '#6b7280'};
            border:${highlighted ? '3px solid white' : '2px solid white'};
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            box-shadow:0 2px ${highlighted ? '12px rgba(168,85,247,0.6)' : '8px rgba(0,0,0,0.4)'};
            display:flex;align-items:center;justify-content:center;
            transition:all 0.2s;
          "><span style="transform:rotate(45deg);color:white;font-weight:700;font-size:11px;">${i + 1}</span></div>`,
        })

        const popup = `
          <div style="min-width:200px;font-family:system-ui,sans-serif;">
            <div style="font-weight:700;font-size:14px;margin-bottom:4px;">${place.name}</div>
            <div style="font-size:12px;color:#6b7280;margin-bottom:6px;">${place.address}</div>
            ${place.rating > 0 ? `<div style="font-size:12px;margin-bottom:4px;">⭐ ${place.rating.toFixed(1)} (${place.reviews.toLocaleString()} reviews)</div>` : ''}
            ${place.open === true  ? '<div style="font-size:11px;color:#22c55e;margin-bottom:4px;">● Open now</div>' : ''}
            ${place.open === false ? '<div style="font-size:11px;color:#ef4444;margin-bottom:4px;">● Closed</div>'   : ''}
            ${place.phone   ? `<div style="margin-top:4px;"><a href="tel:${place.phone}" style="font-size:12px;color:#f97316;">${place.phone}</a></div>` : ''}
            ${place.website ? `<div style="margin-top:4px;"><a href="${place.website}" target="_blank" style="font-size:12px;color:#3b82f6;">Visit website →</a></div>` : ''}
          </div>`

        const marker = Leaflet.marker([lat, lng], { icon: makeIcon(false) })
          .addTo(mapInst.current)
          .bindPopup(popup)

        marker.on('click', () => onPinClick(place.id))

        markersRef.current.set(place.id, { marker, makeIcon, lat, lng })
        bounds.push([lat, lng])
      })

      if (bounds.length > 0) {
        mapInst.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
      }
    })

    return () => {
      if (mapInst.current) {
        mapInst.current.remove()
        mapInst.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results])

  // Highlight active pin + fly-to
  useEffect(() => {
    if (!mapInst.current) return
    markersRef.current.forEach(({ marker, makeIcon }, id) => {
      const highlighted = id === activeId
      marker.setIcon(makeIcon(highlighted))
      if (highlighted) {
        const { lat, lng } = markersRef.current.get(id)!
        mapInst.current.flyTo([lat, lng], 15, { duration: 0.8 })
        marker.openPopup()
      }
    })
  }, [activeId])

  if (valid.length === 0) {
    return (
      <div className="flex items-center justify-center h-full rounded-2xl bg-white/[0.03] border border-white/[0.06] text-white/40 text-sm">
        No location data available
      </div>
    )
  }

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={mapRef} className="rounded-2xl overflow-hidden border border-white/[0.10]" style={{ height: '100%', width: '100%' }} />
    </>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/MapView.tsx
git commit -m "feat: MapView accepts activeId+onPinClick, highlights active pin, fly-to on activate"
```

---

### Task 4: Redesign `app/search/page.tsx` — split-pane layout + filters

**Files:**
- Modify: `app/search/page.tsx`

- [ ] **Step 1: Read the full current page.tsx**

```bash
wc -l /Users/sivaprakasam/projects/agents/tradespot/app/search/page.tsx
```

- [ ] **Step 2: Replace SearchPageInner function**

Find the `function SearchPageInner()` block and replace it. The key changes:
1. Remove `viewMode` state (always split)
2. Add `activeId`, `minRating`, `sortBy` state
3. Add URL param sync for `openNow`, `minRating`, `sortBy`
4. Compute `filteredResults` from `results` based on filters
5. Pass `userLat`/`userLng` and `activeId`/`onActivate` to `ResultCard`
6. Pass `activeId`/`onPinClick` to `MapView`
7. Split layout: left 420px scrollable, right sticky map

Replace `function SearchPageInner()` through the closing `}` with:

```typescript
function SearchPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') ?? ''
  const urlLat = parseFloat(searchParams.get('lat') ?? '')
  const urlLng = parseFloat(searchParams.get('lng') ?? '')
  const urlHasGps = !isNaN(urlLat) && !isNaN(urlLng)

  const [query, setQuery]           = useState(initialQuery)
  const [results, setResults]       = useState<PlaceResult[]>([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [searched, setSearched]     = useState(initialQuery)
  const [locationLabel, setLocationLabel] = useState<string | null>(null)
  const [openNowOnly, setOpenNowOnly]     = useState(searchParams.get('openNow') === '1')
  const [minRating, setMinRating]         = useState<number>(parseFloat(searchParams.get('minRating') ?? '0'))
  const [sortBy, setSortBy]               = useState<'relevance' | 'distance' | 'rating'>(
    (searchParams.get('sort') as 'relevance' | 'distance' | 'rating') ?? 'relevance'
  )
  const [activeId, setActiveId]           = useState<string | null>(null)
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [quoteTarget, setQuoteTarget]       = useState<PlaceResult | null>(null)
  const [listening, setListening]           = useState(false)
  const recognitionRef = useRef<any>(null)
  const didSearch = useRef(false)
  const cachedCoords = useRef<{ lat: number; lng: number; city: string | null } | null>(
    urlHasGps ? { lat: urlLat, lng: urlLng, city: null } : null
  )
  const coordsReady = useRef<Promise<void> | null>(null)

  useEffect(() => {
    coordsReady.current = new Promise(resolve => {
      if (!navigator.geolocation) return resolve()
      navigator.geolocation.getCurrentPosition(
        async pos => {
          const { latitude: lat, longitude: lng } = pos.coords
          let city: string | null = null
          try {
            const r = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
              { headers: { 'Accept-Language': 'en' } }
            )
            const d = await r.json()
            const a = d.address ?? {}
            city = a.city ?? a.town ?? a.village ?? a.county ?? null
          } catch {}
          cachedCoords.current = { lat, lng, city }
          resolve()
        },
        () => resolve(),
        { timeout: 5000 }
      )
    })
  }, [])

  function startVoice() {
    const SpeechRecognition = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) { alert('Voice not supported in this browser'); return }
    const rec = new SpeechRecognition()
    rec.lang = 'en-GB'; rec.continuous = false; rec.interimResults = false
    rec.onstart  = () => setListening(true)
    rec.onend    = () => setListening(false)
    rec.onerror  = () => setListening(false)
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript
      setQuery(transcript)
      doSearch(transcript)
    }
    recognitionRef.current = rec; rec.start()
  }

  function stopVoice() { recognitionRef.current?.stop(); setListening(false) }

  function hasLocation(q: string): boolean {
    return /\b(in|near|at|around)\s+\w/i.test(q)
  }

  async function doSearch(q: string) {
    if (!q.trim()) return
    const finalQ = q.trim()
    setLoading(true); setError(null); setResults([]); setActiveId(null)
    setSearched(finalQ)
    try {
      await coordsReady.current
      const c = cachedCoords.current
      const locSuffix = (!hasLocation(finalQ) && c) ? ` near ${c.city ?? 'my location'}` : ''
      if (c) setLocationLabel(c.city ?? null)
      const url = `/api/places?q=${encodeURIComponent(finalQ + locSuffix)}${c ? `&lat=${c.lat}&lng=${c.lng}` : ''}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Search failed')
      const data = await res.json()
      setResults(data.results ?? [])
    } catch (e: any) {
      setError(e.message ?? 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialQuery && !didSearch.current) {
      didSearch.current = true
      doSearch(initialQuery)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync filters to URL
  useEffect(() => {
    const p = new URLSearchParams(searchParams.toString())
    openNowOnly ? p.set('openNow', '1') : p.delete('openNow')
    minRating > 0 ? p.set('minRating', String(minRating)) : p.delete('minRating')
    sortBy !== 'relevance' ? p.set('sort', sortBy) : p.delete('sort')
    router.replace(`?${p.toString()}`, { scroll: false })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openNowOnly, minRating, sortBy])

  const userLat = cachedCoords.current?.lat ?? null
  const userLng = cachedCoords.current?.lng ?? null

  function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371, dLat = (lat2-lat1)*Math.PI/180, dLng = (lng2-lng1)*Math.PI/180
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  }

  const filteredResults = results
    .filter(r => !openNowOnly || r.open === true)
    .filter(r => minRating === 0 || r.rating >= minRating)
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating
      if (sortBy === 'distance' && userLat !== null && userLng !== null) {
        const dA = (a.lat && a.lng) ? haversineKm(userLat, userLng, a.lat, a.lng) : 999
        const dB = (b.lat && b.lng) ? haversineKm(userLat, userLng, b.lat, b.lng) : 999
        return dA - dB
      }
      return b.score - a.score
    })

  function cycleRating() {
    setMinRating(prev => prev === 0 ? 4.0 : prev === 4.0 ? 4.5 : 0)
  }

  const ratingLabel = minRating === 4.5 ? '⭐ 4.5+' : minRating === 4.0 ? '⭐ 4.0+' : '⭐ Rating'

  return (
    <div className="min-h-screen bg-[#080712] flex flex-col">
      {/* Sticky search bar */}
      <div className="sticky top-0 z-30 bg-[#080712]/90 backdrop-blur-xl border-b border-white/[0.06] px-4 py-3">
        <div className="max-w-[1400px] mx-auto space-y-3">
          {/* Search input row */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && doSearch(query)}
                placeholder="Search tradespeople, services..."
                className="w-full bg-white/[0.06] border border-white/[0.10] rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-orange-500/40"
              />
            </div>
            <button
              onClick={listening ? stopVoice : startVoice}
              className={`p-2.5 rounded-xl border transition-colors ${listening ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-white/[0.06] border-white/[0.10] text-white/50 hover:text-white/70'}`}
            >
              {listening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            <button
              onClick={() => doSearch(query)}
              disabled={loading}
              className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? '...' : 'Search'}
            </button>
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setOpenNowOnly(p => !p)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${openNowOnly ? 'bg-green-500/20 border-green-500/40 text-green-300' : 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70'}`}
            >
              Open now
            </button>
            <button
              onClick={cycleRating}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${minRating > 0 ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70'}`}
            >
              {ratingLabel}
            </button>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'relevance' | 'distance' | 'rating')}
              className="text-xs px-3 py-1.5 rounded-full border bg-white/[0.04] border-white/[0.08] text-white/50 focus:outline-none focus:border-orange-500/30"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="distance">Sort: Distance</option>
              <option value="rating">Sort: Rating</option>
            </select>
            {filteredResults.length > 0 && (
              <span className="text-xs text-white/30 ml-auto">
                {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
                {locationLabel ? ` near ${locationLabel}` : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Split pane body */}
      <div className="flex-1 flex max-w-[1400px] mx-auto w-full">
        {/* Left: results list */}
        <div className="w-full md:w-[420px] flex-shrink-0 overflow-y-auto px-4 py-4 space-y-3 md:h-[calc(100vh-120px)] md:sticky md:top-[120px]">
          {loading && (
            <div className="flex items-center gap-3 text-white/40 text-sm py-8 justify-center">
              <div className="w-4 h-4 rounded-full border-2 border-orange-500/60 border-t-transparent animate-spin" />
              Searching...
            </div>
          )}
          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-4">{error}</div>
          )}
          {!loading && filteredResults.length === 0 && searched && (
            <div className="text-white/40 text-sm py-8 text-center">No results for "{searched}"</div>
          )}
          {filteredResults.map((place, i) => (
            <ResultCard
              key={place.id}
              place={place}
              rank={i + 1}
              userLat={userLat}
              userLng={userLng}
              active={activeId === place.id}
              onRequestQuote={p => { setQuoteTarget(p); setShowQuoteModal(true) }}
              onActivate={id => setActiveId(prev => prev === id ? null : id)}
            />
          ))}
        </div>

        {/* Right: sticky map */}
        <div className="hidden md:block flex-1 sticky top-[120px] h-[calc(100vh-120px)] p-4">
          <Suspense fallback={<div className="h-full rounded-2xl bg-white/[0.03] border border-white/[0.06]" />}>
            <MapView
              results={filteredResults}
              activeId={activeId}
              onPinClick={id => setActiveId(prev => prev === id ? null : id)}
            />
          </Suspense>
        </div>
      </div>

      {showQuoteModal && (
        <QuoteModal
          results={quoteTarget ? [quoteTarget] : filteredResults.slice(0, 3)}
          query={searched}
          onClose={() => { setShowQuoteModal(false); setQuoteTarget(null) }}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 3: Update imports at top of page.tsx**

Add `ResultCard` import, remove `Star, ChevronDown, ChevronUp, List, Map` (moved to ResultCard):
```typescript
'use client'
import { useEffect, useState, useRef, Suspense, lazy } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, Mic, MicOff } from 'lucide-react'
import QuoteModal from '@/components/QuoteModal'
import ResultCard, { PlaceResult } from '@/components/ResultCard'

const MapView = lazy(() => import('@/components/MapView'))
```

- [ ] **Step 4: Remove old `StarRating`, `TrustBadge`, `ResultCard` definitions from page.tsx**

Delete the three function definitions that are now in `components/ResultCard.tsx`:
- `function StarRating(...)` — lines ~28-44
- `function TrustBadge(...)` — lines ~46-57
- `function ResultCard(...)` — lines ~69-208

- [ ] **Step 5: Build check**

```bash
cd /Users/sivaprakasam/projects/agents/tradespot
npx tsc --noEmit 2>&1 | head -30
```
Expected: no type errors

- [ ] **Step 6: Commit**

```bash
git add app/search/page.tsx components/ResultCard.tsx
git commit -m "feat: split-pane search layout — always-visible map, filter pills, activeId sync"
```

---

### Task 5: Smoke test

- [ ] **Step 1: Start dev server**

```bash
npm run dev &
sleep 5
curl -s http://localhost:3000/search?q=plumber | grep -o '<title>[^<]*</title>'
```
Expected: `<title>AnyLocal</title>` (or similar — confirms page renders)

- [ ] **Step 2: Manual check** — open http://localhost:3000/search?q=plumber in browser, verify:
  - Split pane visible (list left, map right)
  - Filter pills visible and clickable
  - Click a card → map pin highlights purple
  - Click AI summary → purple panel streams text
  - Distance shown on cards (if GPS allowed)

- [ ] **Step 3: Commit any fixes**

```bash
git add -p && git commit -m "fix: search page smoke test corrections"
```
