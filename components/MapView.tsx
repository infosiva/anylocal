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
      markersRef.current.forEach(m => m.marker.remove())
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
        const entry = markersRef.current.get(id)!
        mapInst.current.flyTo([entry.lat, entry.lng], 15, { duration: 0.8 })
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
