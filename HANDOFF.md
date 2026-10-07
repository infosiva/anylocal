
## DESIGN LOCK (2026-10-05)
- Archetype: map-first (animated SVG street-grid map, conic sweep, pulsing category pins; no business data)
- Bg: ink #0f1419 hero/nav/footer, cream #fffbf5 body. Accent #f0bc42 (ink #1c1503 text on fills); text amber #8a5d00
- Logo: amber map pin on ink + "Any**Local**" wordmark (app/icon.svg, apple-icon.tsx, components/Logo.tsx)
- Hub: loadSiteTheme('anylocal') + buildThemeStyleTag + GA4 only when analytics.ga4Id set
- Chat: Groq->Gemini->Cerebras, 60/hr/IP, never 500. Feedback: /api/feedback, 20/hr.
- Pricing: Free today; Pro GBP15/mo labelled planned, not billed.
- AI pillars: gateway/routing/limits partial (in-route chain, in-memory limiter); no RAG/evals/observability. Gap, not faked.

## Runtime-switch + telemetry retrofit (2026-10-06)
Added: components/AnimatedBg.tsx, ConsentBanner.tsx, lib/telemetry.ts, app/api/usage/route.ts (204), data-layout on <html>, [data-layout] CSS variants in globals.css. Build green. Not verified: live hub switch, screenshots.


## OWASP LLM Top 10 dispositions (gate item 45, 2026-10-07; list recalled from memory, unverified)
- LLM01 prompt injection: lib/guard.ts present, NOT yet wired into routes; no output filtering or tool sandbox review done. PARTIAL.
- LLM02 sensitive info disclosure: `redact()` helper available; not applied to every log. PARTIAL.
- LLM04/10 DoS / unbounded consumption: per-IP rate limit where present; token budgets not enforced. PARTIAL.
- LLM05 improper output handling: model output rendered as text; not audited for HTML sinks. UNVERIFIED.
- LLM06 excessive agency: no tool-calling agents audited. UNVERIFIED.
- Others (supply chain, poisoning, embeddings, misinformation): not assessed.


## ANIMATED SCOPE (gate items 19/21, derived from code 2026-10-07)
- Moves: AnimatedBg (ambient hero/background); CSS keyframes: al-glow, al-pan, al-ping, al-sweep, blink, ds-float, ds-shift, fadeUp; transitions on interactive elements.
- Trigger: page load (ambient) and hover/press (interactive). Reduced motion: honoured via prefers-reduced-motion block.
- STATUS: scope documented from existing code only. Skill-stack passes (ui-ux-pro-max, emil-design-eng, impeccable critique, review-animations) and 375/1280 screenshot review are NOT yet run for this app. Item 21 stays OPEN until they are.
