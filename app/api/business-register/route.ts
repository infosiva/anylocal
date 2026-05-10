/**
 * POST /api/business-register
 * Tradesperson/business self-registration for AnyLocal listing
 * Saves to Supabase + sends confirmation + notifies admin
 */
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { name, bizName, email, phone, postcode, trades, message } = body

  if (!name || !email || !postcode || !trades?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const id = crypto.randomUUID()
  const createdAt = new Date().toISOString()

  // Save to Supabase
  if (supabase) {
    const { error: dbErr } = await supabase.from('business_registrations').insert({
      id,
      name,
      biz_name: bizName || null,
      email,
      phone: phone || null,
      postcode,
      trades: JSON.stringify(trades),
      message: message || null,
      status: 'pending',
      created_at: createdAt,
    })
    if (dbErr) console.error('[business-register] Supabase error:', dbErr.message)
  }

  const displayName = bizName || name
  const tradeList = trades.join(', ')

  // Confirmation to tradesperson
  if (resend) {
    await resend.emails.send({
      from:    'AnyLocal <hello@anylocal.app>',
      to:      email,
      subject: `You're registered on AnyLocal — ${displayName}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#080712;color:#f0eeff;">
          <div style="text-align:center;margin-bottom:32px;">
            <h1 style="color:#f97316;font-size:28px;margin:0;">AnyLocal</h1>
            <p style="color:#888;font-size:13px;margin:4px 0 0;">Find anything local, anywhere</p>
          </div>
          <h2 style="color:#ffffff;font-size:22px;">You're registered, ${displayName}!</h2>
          <p style="color:#aaa;line-height:1.6;">Thanks for joining AnyLocal. Your listing is being verified and will go live within <strong style="color:#fff;">24 hours</strong>.</p>
          <div style="background:#1a1030;border:1px solid rgba(249,115,22,0.25);border-radius:12px;padding:20px;margin:24px 0;">
            <h3 style="color:#f97316;margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;">Your registration summary</h3>
            <table style="width:100%;font-size:13px;">
              <tr><td style="color:#888;padding:4px 0;width:120px;">Name</td><td style="color:#fff;">${name}</td></tr>
              ${bizName ? `<tr><td style="color:#888;padding:4px 0;">Business</td><td style="color:#fff;">${bizName}</td></tr>` : ''}
              <tr><td style="color:#888;padding:4px 0;">Trades</td><td style="color:#fff;">${tradeList}</td></tr>
              <tr><td style="color:#888;padding:4px 0;">Area</td><td style="color:#fff;">${postcode}</td></tr>
            </table>
          </div>
          <h3 style="color:#fff;font-size:16px;">What happens next:</h3>
          <ul style="color:#aaa;line-height:2;padding-left:20px;">
            <li>Your listing goes live within <strong style="color:#fff;">24 hours</strong></li>
            <li>When a local customer searches your trade, you appear</li>
            <li>When they request a quote, you get the lead <strong style="color:#fff;">straight to this inbox</strong></li>
            <li>You win the job — AnyLocal takes <strong style="color:#f97316;">zero commission</strong></li>
          </ul>
          <div style="background:rgba(249,115,22,0.08);border-left:3px solid #f97316;padding:16px;border-radius:4px;margin:24px 0;">
            <strong style="color:#f97316;">Your 30-day free trial starts today.</strong>
            <p style="color:#aaa;margin:4px 0 0;font-size:13px;">After 30 days, continue for just £15/month — less than a single call-out charge.</p>
          </div>
          <p style="color:#555;font-size:12px;text-align:center;margin-top:32px;">AnyLocal · anylocal.app · hello@anylocal.app</p>
        </div>
      `,
    }).catch(e => console.error('[business-register] Confirmation email failed:', e.message))

    // Admin notification
    await resend.emails.send({
      from:    'AnyLocal Registrations <hello@anylocal.app>',
      to:      'itsmesivaprakasam@gmail.com',
      subject: `New business registration: ${displayName} — ${tradeList}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <h2 style="color:#f97316;">New Business Registration</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:6px 0;color:#888;width:120px;">Name</td><td><strong>${name}</strong></td></tr>
            <tr><td style="padding:6px 0;color:#888;">Business</td><td>${bizName || '—'}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">Email</td><td>${email}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">Phone</td><td>${phone || '—'}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">Postcode</td><td>${postcode}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">Trades</td><td>${tradeList}</td></tr>
            ${message ? `<tr><td style="padding:6px 0;color:#888;">Message</td><td>${message}</td></tr>` : ''}
          </table>
        </div>
      `,
    }).catch(e => console.error('[business-register] Admin email failed:', e.message))
  }

  return NextResponse.json({ ok: true, id })
}
