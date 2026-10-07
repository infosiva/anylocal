# AnyLocal design

Source of truth: `design-system/` (MASTER.md, tokens, `components/AnimatedBg.tsx`). This file only records project choices.

- Accent: `#f0bc42` (amber); palette checked with `design-system/scripts/check-palettes.mjs`.
- Hub override: Edge Config `theme_anylocal.design` (dials, brief, palette, `layout.bgAnimation`/`bgSpeed`) wins over these values; loaded by `lib/theme-loader.ts` and applied in `app/layout.tsx`.
- Background: `components/AnimatedBg.tsx` (hub-driven, reduced-motion safe).
- Logo: `components/Logo.tsx` (AnyLocal wordmark), used in the navbar/header; favicon is `app/icon.svg` (same mark).
- ai-core: exempt for now: place lookup and chat use the in-route free-first chain; no document upload, RAG or memory today (HANDOFF.md records the pillar gap, not faked). If saved-place notes or semantic search are added, route them through ai-core.
