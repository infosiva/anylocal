# anylocal

AI-powered global tradesperson directory — find plumbers, electricians and more, ranked by real reviews

**Live:** https://tradespot-three.vercel.app

## Tech stack
Next.js, React, TypeScript, Tailwind CSS

## Run locally
```bash
git clone https://github.com/infosiva/anylocal.git && cd anylocal
npm install
cp .env.example .env.local   # names only, fill in your own values
npm run dev                    # http://localhost:3000
```

## Scripts
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

## Environment variables
Names only; never commit real values. Everything is optional unless the feature needs it.

**AI providers (free-first chain; any one is enough):** `GEMINI_API_KEY`, `GROQ_API_KEY`, `OLLAMA_HOST`

- `ANTHROPIC_API_KEY`
- `CRON_SECRET`
- `GNEWS_API_KEY`
- `GOOGLE_PLACES_API_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `OWNER_KEY`
- `PROMO_CODES`
- `RESEND_API_KEY`
- `RESEND_AUDIENCE_ID`
- `RESEND_AUDIENCE_ID_ANYLOCAL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TELEGRAM_ALERT_URL`

## Deploy
Vercel (`vercel --prod`). Set the variables above in the project settings.

## Status & open items
See `HANDOFF.md` if present; otherwise open an issue.
