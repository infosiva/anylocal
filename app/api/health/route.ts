/**
 * GET /api/health
 * Checks all external integrations:
 * - Google Places API (live ping with a known query)
 * - Supabase (key configured)
 * - Resend (key configured)
 * - AI (Groq key configured)
 */
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

async function checkPlaces(): Promise<{ ok: boolean; latencyMs?: number; error?: string }> {
  const key = process.env.GOOGLE_PLACES_API_KEY
  if (!key) return { ok: false, error: 'GOOGLE_PLACES_API_KEY not set' }
  const start = Date.now()
  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'places.id',
      },
      body: JSON.stringify({ textQuery: 'coffee London', maxResultCount: 1 }),
      signal: AbortSignal.timeout(5000),
    })
    const latencyMs = Date.now() - start
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      return { ok: false, latencyMs, error: `HTTP ${res.status}: ${detail.slice(0, 100)}` }
    }
    return { ok: true, latencyMs }
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'unreachable' }
  }
}

async function checkSupabase(): Promise<{ ok: boolean; error?: string }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return { ok: false, error: 'Supabase env vars not set' }
  try {
    const sb = createClient(url, key)
    const { error } = await sb.from('leads').select('id').limit(1)
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'connection failed' }
  }
}

async function checkResend(): Promise<{ ok: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) return { ok: false, error: 'RESEND_API_KEY not set' }
  return { ok: true }
}

async function checkAI(): Promise<{ ok: boolean; error?: string }> {
  if (!process.env.GROQ_API_KEY && !process.env.GEMINI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    return { ok: false, error: 'No AI API keys configured' }
  }
  return { ok: true }
}

export async function GET() {
  const [places, supabase, resend, ai] = await Promise.all([
    checkPlaces(),
    checkSupabase(),
    checkResend(),
    checkAI(),
  ])

  const services = { places, supabase, resend, ai }
  const allOk = Object.values(services).every(s => s.ok)

  return NextResponse.json(
    { ok: allOk, services, ts: new Date().toISOString() },
    { status: allOk ? 200 : 207 }
  )
}
