import { NextRequest, NextResponse } from 'next/server'
import { callAI } from '@/lib/ai'

// Simple shared secret to prevent public access — set OWNER_KEY in env vars
const OWNER_KEY = process.env.OWNER_KEY ?? 'anylocal-owner-2026'

export async function POST(req: NextRequest) {
  const { message, key, history } = await req.json()

  if (key !== OWNER_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const system = `You are an AI assistant for the AnyLocal site owner (Siva). You help improve the AnyLocal platform — a UK local business marketplace.

AnyLocal is built with:
- Next.js 15 App Router, TypeScript, Tailwind CSS
- Supabase (Postgres) for data
- AI fallback chain: Groq → Gemini → Cerebras → Anthropic
- Key features: business search, quote requests, customer portal, AI chatbot

You can:
1. Suggest UI/UX improvements with specific implementation advice
2. Review and improve copy/text on any page
3. Suggest new features ranked by impact vs effort
4. Debug issues the owner describes
5. Advise on SEO, conversion rate, user experience
6. Generate code snippets when asked

Be concise, practical, and actionable. Reference specific files/components when relevant.
Current date: ${new Date().toISOString().split('T')[0]}`

  const messages = [
    ...(history ?? []),
    { role: 'user', content: message },
  ]

  try {
    const { text } = await callAI(system, messages, 1500, 'balanced')
    return NextResponse.json({ reply: text })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'AI error' }, { status: 500 })
  }
}
