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
