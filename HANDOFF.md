
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


## ANIMATED SCOPE (gate items 19/21, 2026-10-07)
- What moves / why / trigger / reduced-motion:
  - Hero map: al-pan street grid drift, al-sweep conic radar, al-glow pulse, al-drift aurora blob (transform/opacity only). Why: conveys "live local map" product. Trigger: page load, ambient. Reduced-motion: all animation off (globals.css block).
  - Pins al-ping: attention to category icons. Trigger: load. Reduced-motion: off.
  - Entry: framer-motion fade/translate on eyebrow, H1, copy, search form (one-time, 0.4-0.5s ease). Why: orient reading order.
  - Press: .al-btn scale(0.97) 160ms ease-out; gradient CTA (#f7d374 -> #e39a1f). Trigger: press; hover brightness gated by (hover:hover) and (pointer:fine). Reduced-motion: transitions off.
- Contrast (script, WCAG): ink/cream 17.96, amber/ink 10.56, CTA text #1c1503 on gradient 12.54 / 10.34 / 7.69, amber text on cream 5.59. All >= 4.5.
- Screenshots 375x812 and 1280x800 taken after last edit and read: search + CTA above the fold, no horizontal overflow, aurora/map visible.
- Note: ConsentBanner overlaps lower hero at first load (existing, not changed).

SKILL-STACK: done
