# Email Drip Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automated 4-step email drip sequences for both ResumeVault and AnyLocal using Resend, React Email templates, Supabase sequence tracking, and a Vercel daily cron trigger.

**Architecture:** Shared `lib/resend.ts` client. Supabase `email_sequences` table tracks per-user progress. `/api/email/subscribe` inserts row + sends step-0 immediately. `/api/cron/email-drip` runs daily, finds due rows, sends next step, advances counter. React Email components render each email.

**Tech Stack:** Resend SDK (`resend`), React Email (`@react-email/components`), Supabase, Vercel Cron, Next.js 15 App Router, TypeScript

---

## File Map — ResumeVault (`ai-resume-builder`)

| File | Action | Responsibility |
|------|--------|---------------|
| `src/lib/resend.ts` | Create | Shared Resend client singleton |
| `src/emails/resumevault/welcome.tsx` | Create | Step 0: "Your resume is ready" |
| `src/emails/resumevault/ats-explained.tsx` | Create | Step 1: "3 keywords you're missing" |
| `src/emails/resumevault/cover-letter.tsx` | Create | Step 2: "Write a cover letter in 30s" |
| `src/emails/resumevault/pro-upsell.tsx` | Create | Step 3: "Pro is 50% off this week" |
| `src/app/api/email/subscribe/route.ts` | Create | POST: insert row, send step-0 |
| `src/app/api/email/unsubscribe/route.ts` | Create | GET: set unsubscribed=true |
| `src/app/api/cron/email-drip/route.ts` | Create | GET: daily cron — send due emails |

## File Map — AnyLocal (`tradespot`)

| File | Action | Responsibility |
|------|--------|---------------|
| `lib/resend.ts` | Create | Shared Resend client singleton |
| `emails/anylocal/quote-sent.tsx` | Create | Step 0: "Your quote request is in" |
| `emails/anylocal/tips.tsx` | Create | Step 1: "3 tips for faster responses" |
| `emails/anylocal/top-trades.tsx` | Create | Step 2: "Top-rated trades near you" |
| `emails/anylocal/provider-acquisition.tsx` | Create | Step 3: "List your business free" |
| `app/api/email/subscribe/route.ts` | Create | POST: insert row, send step-0 |
| `app/api/email/unsubscribe/route.ts` | Create | GET: set unsubscribed=true |
| `app/api/cron/email-drip/route.ts` | Create | GET: daily cron — send due emails |

---

### Task 1: Supabase table

- [ ] **Step 1: Create the table via Supabase SQL editor**

Run this SQL in both Supabase projects (or the shared project if using one):
```sql
create table if not exists email_sequences (
  id               uuid primary key default gen_random_uuid(),
  email            text not null,
  product          text not null check (product in ('resumevault', 'anylocal')),
  step             integer not null default 0,
  subscribed_at    timestamptz default now(),
  last_sent_at     timestamptz,
  unsubscribed     boolean not null default false,
  unique (email, product)
);

create index on email_sequences (product, unsubscribed, last_sent_at);
```

- [ ] **Step 2: Add `RESEND_API_KEY` to `.env.local` and Vercel env**

Get key from resend.com (free tier). Add to both projects:
```
RESEND_API_KEY=re_xxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
```

For ResumeVault: `FROM_EMAIL=noreply@resumevault.app`
For AnyLocal: `FROM_EMAIL=noreply@anylocal.co.uk` (or whatever domain)

- [ ] **Step 3: Install packages in both projects**

```bash
# In ai-resume-builder:
cd /Users/sivaprakasam/projects/agents/ai-resume-builder
npm install resend @react-email/components

# In tradespot:
cd /Users/sivaprakasam/projects/agents/tradespot
npm install resend @react-email/components
```

- [ ] **Step 4: Commit package changes**

```bash
cd /Users/sivaprakasam/projects/agents/ai-resume-builder
git add package.json package-lock.json
git commit -m "deps: add resend + react-email"

cd /Users/sivaprakasam/projects/agents/tradespot
git add package.json package-lock.json
git commit -m "deps: add resend + react-email"
```

---

### Task 2: Shared Resend client (ResumeVault)

**Files:**
- Create: `src/lib/resend.ts`

- [ ] **Step 1: Create client**

```typescript
// src/lib/resend.ts
import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)
export const FROM = process.env.FROM_EMAIL ?? 'noreply@resumevault.app'
```

- [ ] **Step 2: Commit**

```bash
cd /Users/sivaprakasam/projects/agents/ai-resume-builder
git add src/lib/resend.ts
git commit -m "feat: resend client singleton"
```

---

### Task 3: React Email templates — ResumeVault

**Files:**
- Create: `src/emails/resumevault/welcome.tsx`
- Create: `src/emails/resumevault/ats-explained.tsx`
- Create: `src/emails/resumevault/cover-letter.tsx`
- Create: `src/emails/resumevault/pro-upsell.tsx`

- [ ] **Step 1: Create welcome email (step 0)**

```typescript
// src/emails/resumevault/welcome.tsx
import { Html, Head, Body, Container, Heading, Text, Button, Hr, Section } from '@react-email/components'

interface Props { name?: string; unsubscribeUrl: string }

export default function WelcomeEmail({ name, unsubscribeUrl }: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#fafafa', fontFamily: 'system-ui, sans-serif' }}>
        <Container style={{ maxWidth: '560px', margin: '40px auto', padding: '32px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <Heading style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
            Your resume is ready{name ? `, ${name}` : ''}
          </Heading>
          <div style={{ height: '3px', background: 'linear-gradient(90deg, #0f766e, #7c3aed)', borderRadius: '2px', marginBottom: '24px' }} />
          <Text style={{ color: '#475569', lineHeight: '1.6' }}>
            Your AI-written resume has been generated. Here's what happened behind the scenes:
          </Text>
          <Section style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '16px', margin: '16px 0' }}>
            <Text style={{ margin: '0 0 8px', color: '#0f172a', fontWeight: '600' }}>✓ ATS-optimised formatting</Text>
            <Text style={{ margin: '0 0 8px', color: '#0f172a', fontWeight: '600' }}>✓ Action-verb bullet points</Text>
            <Text style={{ margin: '0', color: '#0f172a', fontWeight: '600' }}>✓ Keyword-matched to your job description</Text>
          </Section>
          <Text style={{ color: '#475569', lineHeight: '1.6' }}>
            Head back to ResumeVault any time to regenerate, tweak, or download your resume as PDF.
          </Text>
          <Button
            href="https://resumevault.app"
            style={{ backgroundColor: '#7c3aed', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', display: 'inline-block', marginTop: '16px' }}
          >
            View my resume →
          </Button>
          <Hr style={{ margin: '32px 0 16px', borderColor: '#e2e8f0' }} />
          <Text style={{ fontSize: '12px', color: '#94a3b8' }}>
            ResumeVault · London, UK ·{' '}
            <a href={unsubscribeUrl} style={{ color: '#94a3b8' }}>Unsubscribe</a>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
```

- [ ] **Step 2: Create ATS explained email (step 1)**

```typescript
// src/emails/resumevault/ats-explained.tsx
import { Html, Head, Body, Container, Heading, Text, Button, Hr } from '@react-email/components'

interface Props { unsubscribeUrl: string }

export default function ATSExplainedEmail({ unsubscribeUrl }: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#fafafa', fontFamily: 'system-ui, sans-serif' }}>
        <Container style={{ maxWidth: '560px', margin: '40px auto', padding: '32px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <Heading style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
            The 3 keywords you're probably missing
          </Heading>
          <div style={{ height: '3px', background: 'linear-gradient(90deg, #0f766e, #7c3aed)', borderRadius: '2px', marginBottom: '24px' }} />
          <Text style={{ color: '#475569', lineHeight: '1.6' }}>
            Most resumes fail ATS screening for one reason: missing exact keywords from the job description.
          </Text>
          <Text style={{ color: '#475569', lineHeight: '1.6' }}>
            ResumeVault's keyword match bar shows you exactly which terms are present and which are absent — before a recruiter ever sees your application.
          </Text>
          <Text style={{ color: '#0f172a', fontWeight: '600', marginTop: '16px' }}>Here's the fix:</Text>
          <Text style={{ color: '#475569', lineHeight: '1.6' }}>
            1. Paste a new job description into ResumeVault<br />
            2. Check the keyword match bar — aim for 70%+<br />
            3. Approve AI-suggested bullets that fill the gaps
          </Text>
          <Button
            href="https://resumevault.app"
            style={{ backgroundColor: '#0f766e', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', display: 'inline-block', marginTop: '16px' }}
          >
            Check my keyword match →
          </Button>
          <Hr style={{ margin: '32px 0 16px', borderColor: '#e2e8f0' }} />
          <Text style={{ fontSize: '12px', color: '#94a3b8' }}>
            ResumeVault · London, UK ·{' '}
            <a href={unsubscribeUrl} style={{ color: '#94a3b8' }}>Unsubscribe</a>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
```

- [ ] **Step 3: Create cover letter email (step 2)**

```typescript
// src/emails/resumevault/cover-letter.tsx
import { Html, Head, Body, Container, Heading, Text, Button, Hr } from '@react-email/components'

interface Props { unsubscribeUrl: string }

export default function CoverLetterEmail({ unsubscribeUrl }: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#fafafa', fontFamily: 'system-ui, sans-serif' }}>
        <Container style={{ maxWidth: '560px', margin: '40px auto', padding: '32px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <Heading style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
            Write a tailored cover letter in 30 seconds
          </Heading>
          <div style={{ height: '3px', background: 'linear-gradient(90deg, #0f766e, #7c3aed)', borderRadius: '2px', marginBottom: '24px' }} />
          <Text style={{ color: '#475569', lineHeight: '1.6' }}>
            A good cover letter doubles your interview rate. A bad one gets you filtered out.
          </Text>
          <Text style={{ color: '#475569', lineHeight: '1.6' }}>
            ResumeVault generates a cover letter that references the company, the role, and your specific experience — not a generic template.
          </Text>
          <Button
            href="https://resumevault.app"
            style={{ backgroundColor: '#7c3aed', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', display: 'inline-block', marginTop: '16px' }}
          >
            Generate my cover letter →
          </Button>
          <Hr style={{ margin: '32px 0 16px', borderColor: '#e2e8f0' }} />
          <Text style={{ fontSize: '12px', color: '#94a3b8' }}>
            ResumeVault · London, UK ·{' '}
            <a href={unsubscribeUrl} style={{ color: '#94a3b8' }}>Unsubscribe</a>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
```

- [ ] **Step 4: Create Pro upsell email (step 3)**

```typescript
// src/emails/resumevault/pro-upsell.tsx
import { Html, Head, Body, Container, Heading, Text, Button, Hr, Section } from '@react-email/components'

interface Props { unsubscribeUrl: string }

export default function ProUpsellEmail({ unsubscribeUrl }: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#fafafa', fontFamily: 'system-ui, sans-serif' }}>
        <Container style={{ maxWidth: '560px', margin: '40px auto', padding: '32px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <Heading style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
            Unlimited resumes — 50% off this week only
          </Heading>
          <div style={{ height: '3px', background: 'linear-gradient(90deg, #0f766e, #7c3aed)', borderRadius: '2px', marginBottom: '24px' }} />
          <Text style={{ color: '#475569', lineHeight: '1.6' }}>
            You've used ResumeVault's free tier. Here's what Pro unlocks:
          </Text>
          <Section style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '16px', margin: '16px 0' }}>
            <Text style={{ margin: '0 0 8px', color: '#0f172a', fontWeight: '600' }}>✓ Unlimited resume generations</Text>
            <Text style={{ margin: '0 0 8px', color: '#0f172a', fontWeight: '600' }}>✓ PDF download (A4 formatted)</Text>
            <Text style={{ margin: '0 0 8px', color: '#0f172a', fontWeight: '600' }}>✓ Cover letter for every application</Text>
            <Text style={{ margin: '0', color: '#0f172a', fontWeight: '600' }}>✓ Interview prep with STAR answers</Text>
          </Section>
          <Button
            href="https://resumevault.app/#pricing"
            style={{ backgroundColor: '#7c3aed', color: '#ffffff', padding: '14px 28px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', display: 'inline-block', marginTop: '8px', fontSize: '16px' }}
          >
            Upgrade to Pro — 50% off →
          </Button>
          <Hr style={{ margin: '32px 0 16px', borderColor: '#e2e8f0' }} />
          <Text style={{ fontSize: '12px', color: '#94a3b8' }}>
            ResumeVault · London, UK ·{' '}
            <a href={unsubscribeUrl} style={{ color: '#94a3b8' }}>Unsubscribe</a>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
```

- [ ] **Step 5: Commit all templates**

```bash
cd /Users/sivaprakasam/projects/agents/ai-resume-builder
git add src/emails/
git commit -m "feat: ResumeVault email templates — welcome, ATS, cover letter, pro upsell"
```

---

### Task 4: Subscribe + unsubscribe routes (ResumeVault)

**Files:**
- Create: `src/app/api/email/subscribe/route.ts`
- Create: `src/app/api/email/unsubscribe/route.ts`

- [ ] **Step 1: Create subscribe route**

```typescript
// src/app/api/email/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resend, FROM } from '@/lib/resend'
import { render } from '@react-email/render'
import WelcomeEmail from '@/emails/resumevault/welcome'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  let body: { email?: string; name?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Bad JSON' }, { status: 400 }) }
  if (!body.email?.includes('@')) return NextResponse.json({ error: 'Valid email required' }, { status: 400 })

  const { email, name } = body

  // Upsert — ignore duplicate (email already subscribed)
  const { data: row, error } = await supabase
    .from('email_sequences')
    .upsert({ email, product: 'resumevault', step: 0 }, { onConflict: 'email,product', ignoreDuplicates: true })
    .select('id')
    .single()

  if (error && error.code !== '23505') {
    console.error('email subscribe error:', error)
    return NextResponse.json({ ok: true }) // silent — don't block user flow
  }

  const seqId = row?.id
  if (!seqId) return NextResponse.json({ ok: true }) // already existed

  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/email/unsubscribe?id=${seqId}`

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Your resume is ready — here\'s what ATS sees',
      html: await render(WelcomeEmail({ name, unsubscribeUrl })),
    })
    await supabase.from('email_sequences').update({ last_sent_at: new Date().toISOString() }).eq('id', seqId)
  } catch (e) {
    console.error('resend send error:', e)
  }

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Create unsubscribe route**

```typescript
// src/app/api/email/unsubscribe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return new NextResponse('Missing id', { status: 400 })

  await supabase.from('email_sequences').update({ unsubscribed: true }).eq('id', id)

  return new NextResponse(
    '<html><body style="font-family:system-ui;text-align:center;padding:60px;color:#475569"><h2>You\'ve been unsubscribed</h2><p>You won\'t receive any more emails from ResumeVault.</p></body></html>',
    { headers: { 'Content-Type': 'text/html' } }
  )
}
```

- [ ] **Step 3: Add `SUPABASE_SERVICE_ROLE_KEY` and `NEXT_PUBLIC_APP_URL` to `.env.local`**

```
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # from Supabase project settings → API
NEXT_PUBLIC_APP_URL=https://resumevault.app
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/email/
git commit -m "feat: email subscribe/unsubscribe API routes"
```

---

### Task 5: Daily cron route (ResumeVault)

**Files:**
- Create: `src/app/api/cron/email-drip/route.ts`

- [ ] **Step 1: Create cron handler**

```typescript
// src/app/api/cron/email-drip/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resend, FROM } from '@/lib/resend'
import { render } from '@react-email/render'
import ATSExplainedEmail from '@/emails/resumevault/ats-explained'
import CoverLetterEmail  from '@/emails/resumevault/cover-letter'
import ProUpsellEmail    from '@/emails/resumevault/pro-upsell'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Step delays in days after previous send
const DELAYS = [0, 2, 5, 9]  // step 0 sent immediately; steps 1/2/3 at +2/+5/+9 days

const EMAILS = [
  null, // step 0 sent by subscribe route
  async (unsubUrl: string) => ({
    subject: 'The 3 keywords you\'re probably missing',
    html: await render(ATSExplainedEmail({ unsubscribeUrl: unsubUrl }))
  }),
  async (unsubUrl: string) => ({
    subject: 'Write a tailored cover letter in 30 seconds',
    html: await render(CoverLetterEmail({ unsubscribeUrl: unsubUrl }))
  }),
  async (unsubUrl: string) => ({
    subject: 'Unlimited resumes — 50% off this week only',
    html: await render(ProUpsellEmail({ unsubscribeUrl: unsubUrl }))
  }),
]

export async function GET(req: NextRequest) {
  // Vercel cron sends Authorization header
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  // Find rows that have a next step due
  const { data: rows } = await supabase
    .from('email_sequences')
    .select('id, email, step, last_sent_at')
    .eq('product', 'resumevault')
    .eq('unsubscribed', false)
    .lt('step', EMAILS.length - 1) // not on final step yet

  if (!rows?.length) return NextResponse.json({ sent: 0 })

  let sent = 0

  for (const row of rows) {
    const nextStep = row.step + 1
    const lastSent = row.last_sent_at ? new Date(row.last_sent_at) : new Date(row.subscribed_at ?? now)
    const daysSinceLast = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60 * 24)
    const requiredDelay = DELAYS[nextStep] - DELAYS[row.step]

    if (daysSinceLast < requiredDelay) continue

    const unsubUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/email/unsubscribe?id=${row.id}`
    const emailFn = EMAILS[nextStep]
    if (!emailFn) continue

    try {
      const { subject, html } = await emailFn(unsubUrl)
      await resend.emails.send({ from: FROM, to: row.email, subject, html })
      await supabase
        .from('email_sequences')
        .update({ step: nextStep, last_sent_at: now.toISOString() })
        .eq('id', row.id)
      sent++
    } catch (e) {
      console.error(`cron email error for ${row.email}:`, e)
    }
  }

  return NextResponse.json({ sent })
}
```

- [ ] **Step 2: Add `CRON_SECRET` to `.env.local` and Vercel env**

```
CRON_SECRET=<random 32-char string — generate with: openssl rand -hex 16>
```

- [ ] **Step 3: Add cron to `vercel.json` in ai-resume-builder**

Create or update `vercel.json`:
```json
{
  "crons": [
    { "path": "/api/cron/email-drip", "schedule": "0 9 * * *" }
  ]
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/cron/ vercel.json
git commit -m "feat: daily email drip cron — sends due sequence steps via Resend"
```

---

### Task 6: Wire subscribe call into ResumeVault form

**Files:**
- Modify: `src/components/ResumeForm.tsx`

- [ ] **Step 1: Call subscribe after successful generate**

In `handleGenerate` (the main form submit handler), after a successful API response, add:
```typescript
// After onGenerate(data.resume) call:
if (name) {
  fetch('/api/email/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: jobDesc.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0] ?? '', name })
  }).catch(() => {}) // fire-and-forget, never block user
}
```

Note: this tries to extract email from jobDesc (users sometimes paste it). If no email found, skip silently — the subscribe call with empty email returns 400 but we catch it. A future iteration can add an explicit email field.

- [ ] **Step 2: Commit**

```bash
git add src/components/ResumeForm.tsx
git commit -m "feat: fire subscribe after resume generation (email extracted from JD if present)"
```

---

### Task 7: AnyLocal email — same pattern, different templates

**Files (all in `/Users/sivaprakasam/projects/agents/tradespot`):**
- Create: `lib/resend.ts`
- Create: `emails/anylocal/quote-sent.tsx`
- Create: `emails/anylocal/tips.tsx`
- Create: `emails/anylocal/top-trades.tsx`
- Create: `emails/anylocal/provider-acquisition.tsx`
- Create: `app/api/email/subscribe/route.ts`
- Create: `app/api/email/unsubscribe/route.ts`
- Create: `app/api/cron/email-drip/route.ts`

- [ ] **Step 1: Create resend client**

```typescript
// lib/resend.ts
import { Resend } from 'resend'
export const resend = new Resend(process.env.RESEND_API_KEY)
export const FROM = process.env.FROM_EMAIL ?? 'noreply@anylocal.co.uk'
```

- [ ] **Step 2: Create quote-sent email (step 0)**

```typescript
// emails/anylocal/quote-sent.tsx
import { Html, Head, Body, Container, Heading, Text, Button, Hr } from '@react-email/components'

interface Props { query?: string; unsubscribeUrl: string }

export default function QuoteSentEmail({ query, unsubscribeUrl }: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#0d0d1a', fontFamily: 'system-ui, sans-serif' }}>
        <Container style={{ maxWidth: '560px', margin: '40px auto', padding: '32px', backgroundColor: '#13131f', borderRadius: '12px', border: '1px solid rgba(249,115,22,0.2)' }}>
          <Heading style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>
            Your quote request is in
          </Heading>
          <div style={{ height: '3px', background: 'linear-gradient(90deg, #f97316, #fb923c)', borderRadius: '2px', marginBottom: '24px' }} />
          <Text style={{ color: '#94a3b8', lineHeight: '1.6' }}>
            {query ? `We've sent your "${query}" request to local businesses near you.` : "We've sent your quote request to local businesses near you."}
          </Text>
          <Text style={{ color: '#94a3b8', lineHeight: '1.6' }}>
            Most businesses respond within 2–4 hours. You'll hear back via the portal with pricing and availability.
          </Text>
          <Button
            href="https://anylocal.co.uk/portal"
            style={{ backgroundColor: '#f97316', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', display: 'inline-block', marginTop: '16px' }}
          >
            Check my responses →
          </Button>
          <Hr style={{ margin: '32px 0 16px', borderColor: 'rgba(255,255,255,0.08)' }} />
          <Text style={{ fontSize: '12px', color: '#475569' }}>
            AnyLocal · London, UK ·{' '}
            <a href={unsubscribeUrl} style={{ color: '#475569' }}>Unsubscribe</a>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
```

- [ ] **Step 3: Create tips email (step 1)**

```typescript
// emails/anylocal/tips.tsx
import { Html, Head, Body, Container, Heading, Text, Button, Hr } from '@react-email/components'

interface Props { unsubscribeUrl: string }

export default function TipsEmail({ unsubscribeUrl }: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#0d0d1a', fontFamily: 'system-ui, sans-serif' }}>
        <Container style={{ maxWidth: '560px', margin: '40px auto', padding: '32px', backgroundColor: '#13131f', borderRadius: '12px', border: '1px solid rgba(249,115,22,0.2)' }}>
          <Heading style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>
            3 tips to get faster responses
          </Heading>
          <div style={{ height: '3px', background: 'linear-gradient(90deg, #f97316, #fb923c)', borderRadius: '2px', marginBottom: '24px' }} />
          <Text style={{ color: '#94a3b8', lineHeight: '1.6' }}>
            <strong style={{ color: '#ffffff' }}>1. Include your postcode.</strong><br />
            Businesses prioritise jobs they can reach quickly. A postcode cuts response time by 40%.
          </Text>
          <Text style={{ color: '#94a3b8', lineHeight: '1.6' }}>
            <strong style={{ color: '#ffffff' }}>2. Be specific about the job.</strong><br />
            "Leaking pipe under kitchen sink" gets better quotes than "plumbing issue".
          </Text>
          <Text style={{ color: '#94a3b8', lineHeight: '1.6' }}>
            <strong style={{ color: '#ffffff' }}>3. Mention urgency.</strong><br />
            If it's urgent, say so. Businesses with availability today will respond first.
          </Text>
          <Button
            href="https://anylocal.co.uk"
            style={{ backgroundColor: '#f97316', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', display: 'inline-block', marginTop: '16px' }}
          >
            Search for a tradesperson →
          </Button>
          <Hr style={{ margin: '32px 0 16px', borderColor: 'rgba(255,255,255,0.08)' }} />
          <Text style={{ fontSize: '12px', color: '#475569' }}>
            AnyLocal · London, UK ·{' '}
            <a href={unsubscribeUrl} style={{ color: '#475569' }}>Unsubscribe</a>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
```

- [ ] **Step 4: Create top-trades email (step 2)**

```typescript
// emails/anylocal/top-trades.tsx
import { Html, Head, Body, Container, Heading, Text, Button, Hr } from '@react-email/components'

interface Props { postcode?: string; unsubscribeUrl: string }

export default function TopTradesEmail({ postcode, unsubscribeUrl }: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#0d0d1a', fontFamily: 'system-ui, sans-serif' }}>
        <Container style={{ maxWidth: '560px', margin: '40px auto', padding: '32px', backgroundColor: '#13131f', borderRadius: '12px', border: '1px solid rgba(249,115,22,0.2)' }}>
          <Heading style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>
            Top-rated trades {postcode ? `near ${postcode}` : 'near you'}
          </Heading>
          <div style={{ height: '3px', background: 'linear-gradient(90deg, #f97316, #fb923c)', borderRadius: '2px', marginBottom: '24px' }} />
          <Text style={{ color: '#94a3b8', lineHeight: '1.6' }}>
            AnyLocal ranks businesses by review quality, response time, and real customer feedback — not just the highest bidder.
          </Text>
          <Text style={{ color: '#94a3b8', lineHeight: '1.6' }}>
            Search for any trade service and see AI-summarised reviews, distance, and availability — all in one place.
          </Text>
          <Button
            href="https://anylocal.co.uk"
            style={{ backgroundColor: '#f97316', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', display: 'inline-block', marginTop: '16px' }}
          >
            Find top trades near me →
          </Button>
          <Hr style={{ margin: '32px 0 16px', borderColor: 'rgba(255,255,255,0.08)' }} />
          <Text style={{ fontSize: '12px', color: '#475569' }}>
            AnyLocal · London, UK ·{' '}
            <a href={unsubscribeUrl} style={{ color: '#475569' }}>Unsubscribe</a>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
```

- [ ] **Step 5: Create provider acquisition email (step 3)**

```typescript
// emails/anylocal/provider-acquisition.tsx
import { Html, Head, Body, Container, Heading, Text, Button, Hr, Section } from '@react-email/components'

interface Props { unsubscribeUrl: string }

export default function ProviderAcquisitionEmail({ unsubscribeUrl }: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#0d0d1a', fontFamily: 'system-ui, sans-serif' }}>
        <Container style={{ maxWidth: '560px', margin: '40px auto', padding: '32px', backgroundColor: '#13131f', borderRadius: '12px', border: '1px solid rgba(249,115,22,0.2)' }}>
          <Heading style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>
            Are you a tradesperson? List for free
          </Heading>
          <div style={{ height: '3px', background: 'linear-gradient(90deg, #f97316, #fb923c)', borderRadius: '2px', marginBottom: '24px' }} />
          <Text style={{ color: '#94a3b8', lineHeight: '1.6' }}>
            Know someone who's a plumber, electrician, builder, or cleaner? They can list on AnyLocal for free and start receiving quote requests today.
          </Text>
          <Section style={{ backgroundColor: 'rgba(249,115,22,0.08)', borderRadius: '8px', padding: '16px', margin: '16px 0', border: '1px solid rgba(249,115,22,0.15)' }}>
            <Text style={{ margin: '0 0 8px', color: '#ffffff', fontWeight: '600' }}>✓ Free to list — no monthly fees</Text>
            <Text style={{ margin: '0 0 8px', color: '#ffffff', fontWeight: '600' }}>✓ Quote requests direct to your inbox</Text>
            <Text style={{ margin: '0', color: '#ffffff', fontWeight: '600' }}>✓ AI summary of your reviews shown to customers</Text>
          </Section>
          <Button
            href="https://anylocal.co.uk/providers"
            style={{ backgroundColor: '#f97316', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', display: 'inline-block', marginTop: '8px' }}
          >
            List my business free →
          </Button>
          <Hr style={{ margin: '32px 0 16px', borderColor: 'rgba(255,255,255,0.08)' }} />
          <Text style={{ fontSize: '12px', color: '#475569' }}>
            AnyLocal · London, UK ·{' '}
            <a href={unsubscribeUrl} style={{ color: '#475569' }}>Unsubscribe</a>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
```

- [ ] **Step 6: Create subscribe route (AnyLocal)**

```typescript
// app/api/email/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resend, FROM } from '@/lib/resend'
import { render } from '@react-email/render'
import QuoteSentEmail from '@/emails/anylocal/quote-sent'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  let body: { email?: string; query?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Bad JSON' }, { status: 400 }) }
  if (!body.email?.includes('@')) return NextResponse.json({ ok: true }) // silent skip

  const { email, query } = body

  const { data: row, error } = await supabase
    .from('email_sequences')
    .upsert({ email, product: 'anylocal', step: 0 }, { onConflict: 'email,product', ignoreDuplicates: true })
    .select('id')
    .single()

  if (error && error.code !== '23505') return NextResponse.json({ ok: true })
  const seqId = row?.id
  if (!seqId) return NextResponse.json({ ok: true })

  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/email/unsubscribe?id=${seqId}`

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Your quote request is in — here\'s what happens next',
      html: await render(QuoteSentEmail({ query, unsubscribeUrl })),
    })
    await supabase.from('email_sequences').update({ last_sent_at: new Date().toISOString() }).eq('id', seqId)
  } catch (e) {
    console.error('resend error:', e)
  }

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 7: Create unsubscribe route (AnyLocal)**

```typescript
// app/api/email/unsubscribe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return new NextResponse('Missing id', { status: 400 })
  await supabase.from('email_sequences').update({ unsubscribed: true }).eq('id', id)
  return new NextResponse(
    '<html><body style="font-family:system-ui;text-align:center;padding:60px;background:#080712;color:#94a3b8"><h2 style="color:#fff">Unsubscribed</h2><p>You won\'t receive any more emails from AnyLocal.</p></body></html>',
    { headers: { 'Content-Type': 'text/html' } }
  )
}
```

- [ ] **Step 8: Create cron route (AnyLocal)**

```typescript
// app/api/cron/email-drip/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resend, FROM } from '@/lib/resend'
import { render } from '@react-email/render'
import TipsEmail                from '@/emails/anylocal/tips'
import TopTradesEmail           from '@/emails/anylocal/top-trades'
import ProviderAcquisitionEmail from '@/emails/anylocal/provider-acquisition'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DELAYS = [0, 2, 5, 10]

const EMAILS = [
  null,
  async (u: string) => ({ subject: '3 tips to get faster responses from local tradespeople', html: await render(TipsEmail({ unsubscribeUrl: u })) }),
  async (u: string) => ({ subject: 'Top-rated trades near you', html: await render(TopTradesEmail({ unsubscribeUrl: u })) }),
  async (u: string) => ({ subject: 'Are you a tradesperson? List for free on AnyLocal', html: await render(ProviderAcquisitionEmail({ unsubscribeUrl: u })) }),
]

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const { data: rows } = await supabase
    .from('email_sequences')
    .select('id, email, step, last_sent_at')
    .eq('product', 'anylocal')
    .eq('unsubscribed', false)
    .lt('step', EMAILS.length - 1)

  if (!rows?.length) return NextResponse.json({ sent: 0 })

  let sent = 0
  for (const row of rows) {
    const nextStep = row.step + 1
    const lastSent = row.last_sent_at ? new Date(row.last_sent_at) : now
    const daysSinceLast = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60 * 24)
    const requiredDelay = DELAYS[nextStep] - DELAYS[row.step]
    if (daysSinceLast < requiredDelay) continue
    const emailFn = EMAILS[nextStep]
    if (!emailFn) continue
    const unsubUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/email/unsubscribe?id=${row.id}`
    try {
      const { subject, html } = await emailFn(unsubUrl)
      await resend.emails.send({ from: FROM, to: row.email, subject, html })
      await supabase.from('email_sequences').update({ step: nextStep, last_sent_at: now.toISOString() }).eq('id', row.id)
      sent++
    } catch (e) { console.error(`cron error for ${row.email}:`, e) }
  }

  return NextResponse.json({ sent })
}
```

- [ ] **Step 9: Add cron to tradespot `vercel.json`**

Check if `vercel.json` exists. If not, create it:
```json
{
  "crons": [
    { "path": "/api/cron/email-drip", "schedule": "0 9 * * *" }
  ]
}
```

- [ ] **Step 10: Wire subscribe call into QuoteModal**

In `components/QuoteModal.tsx`, after a successful quote submission, add:
```typescript
// After successful Supabase insert in handleSubmit:
if (email) {
  fetch('/api/email/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, query })
  }).catch(() => {})
}
```

- [ ] **Step 11: Commit all AnyLocal email files**

```bash
cd /Users/sivaprakasam/projects/agents/tradespot
git add lib/resend.ts emails/ app/api/email/ app/api/cron/ vercel.json
git commit -m "feat: AnyLocal email drip — templates, subscribe/unsubscribe, daily cron"
```

---

### Task 8: Env vars — sync to Vercel

- [ ] **Step 1: Add to both Vercel projects via CLI**

```bash
# ResumeVault
cd /Users/sivaprakasam/projects/agents/ai-resume-builder
vercel env add RESEND_API_KEY production
vercel env add FROM_EMAIL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add CRON_SECRET production

# AnyLocal
cd /Users/sivaprakasam/projects/agents/tradespot
vercel env add RESEND_API_KEY production
vercel env add FROM_EMAIL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add CRON_SECRET production
```

- [ ] **Step 2: Deploy both projects**

```bash
cd /Users/sivaprakasam/projects/agents/ai-resume-builder && git push origin main
cd /Users/sivaprakasam/projects/agents/tradespot && git push origin main
```

- [ ] **Step 3: Verify cron registered in Vercel dashboard**

Check Vercel project → Settings → Cron Jobs — confirm `/api/cron/email-drip` appears with `0 9 * * *` schedule.
