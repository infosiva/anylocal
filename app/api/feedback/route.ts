import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rateLimit'

export const runtime = 'nodejs'

const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.slice(0, n) : '')

export async function POST(req: NextRequest) {
  try {
    const ip = (req.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim()
    if (!checkRateLimit(`feedback_${ip}`, 20).ok) return NextResponse.json({ ok: true })
    const b = await req.json().catch(() => ({}))
    const message = clip(b.message, 1000).trim()
    const rating = Number(b.rating)
    if (message.length < 3 || !(rating >= 1 && rating <= 5)) {
      return NextResponse.json({ error: 'message and rating (1-5) required' }, { status: 400 })
    }
    const entry = {
      type: clip(b.type, 40) || 'General', rating, message,
      email: clip(b.email, 200) || undefined, page: clip(b.page, 200) || undefined,
      site: clip(b.site, 60) || 'AnyLocal', ts: new Date().toISOString(),
    }
    console.log('[feedback]', JSON.stringify(entry))
    const { TELEGRAM_BOT_TOKEN: tok, TELEGRAM_CHAT_ID: chat } = process.env
    if (tok && chat) {
      await fetch(`https://api.telegram.org/bot${tok}/sendMessage`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chat, text: `${entry.site} feedback (${entry.type}, ${rating}/5)\n${message}\n${entry.page ?? ''}` }),
      }).catch(() => {})
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[/api/feedback]', e)
    return NextResponse.json({ ok: true })
  }
}
