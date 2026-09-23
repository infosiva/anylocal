import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rateLimit'

let _groq: Groq | null = null
function getGroq() { if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY! }); return _groq }

export const runtime = 'nodejs'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
    const { ok } = checkRateLimit(`chatbot_${ip}`, 60)
    if (!ok) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })

    const body = await req.json()

    const messages: Message[] = body.messages
    const systemPrompt: string = body.systemPrompt ?? `You are LocalBot, the AI assistant for AnyLocal — an AI-powered local business search platform.
Help users find local businesses, understand how to search effectively, and get the most out of the platform.
Suggest relevant search queries, explain ratings, and help narrow down choices.
Keep responses short, helpful, and location-aware. Use a friendly, practical tone.`

    if (!messages?.length) {
      return NextResponse.json({ error: 'messages required' }, { status: 400 })
    }

    const chatMessages: Message[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: Message) => ({ role: m.role, content: m.content })),
    ]

    try {
      const stream = await getGroq().chat.completions.create({
        model: 'qwen/qwen3.8-27b',
        messages: chatMessages,
        max_tokens: 600,
        temperature: 0.7,
        stream: true,
      })

      const readable = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder()
          try {
            for await (const chunk of stream) {
              const text = chunk.choices[0]?.delta?.content ?? ''
              if (text) controller.enqueue(encoder.encode(text))
            }
          } finally {
            controller.close()
          }
        },
      })

      return new NextResponse(readable, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
          'Cache-Control': 'no-cache',
        },
      })
    } catch (groqErr) {
      console.error('[/api/chatbot] groq failed, falling back to gemini', groqErr)
      // Gemini fallback (§Y): non-streaming, but never a hard 500 on Groq outage
      if (process.env.GEMINI_API_KEY) {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: chatMessages.filter(m => m.role !== 'system').map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }],
              })),
              systemInstruction: { parts: [{ text: systemPrompt }] },
              generationConfig: { maxOutputTokens: 600 },
            }),
          }
        )
        if (res.ok) {
          const data = await res.json()
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text
          if (text) return NextResponse.json({ text })
        }
      }
      return NextResponse.json({ text: 'Chat is resting — try again in a moment.' })
    }
  } catch (err) {
    console.error('[/api/chatbot]', err)
    return NextResponse.json({ text: 'Chat is resting — try again in a moment.' })
  }
}
