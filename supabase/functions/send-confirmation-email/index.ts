import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
}

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? ""
const FROM_EMAIL = "BUSA Gala <noreply@busagala.com>"

function buildEmailHtml(params: {
  first_name: string
  last_name: string
  tier_name: string
  table_number: number
  ticket_count: number
  group_booking_code: string
  ticket_id: string
  manage_url: string
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Your Gatsby Gala Ticket</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Josefin+Sans:wght@300;400;600&family=Playfair+Display:ital,wght@1,400;1,600&display=swap');
  body { margin: 0; padding: 0; background-color: #1A0305; font-family: 'Josefin Sans', sans-serif; }
  .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
  .header { text-align: center; padding: 40px 0 20px; border-bottom: 1px solid #C9962A40; }
  .eyebrow { font-family: 'Josefin Sans', sans-serif; font-size: 11px; letter-spacing: 0.4em; color: #C9962A; text-transform: uppercase; margin-bottom: 12px; }
  .title { font-family: 'Cormorant Garamond', serif; font-size: 48px; font-weight: 700; color: #F5D875; margin: 0; line-height: 1.1; }
  .subtitle { font-family: 'Playfair Display', serif; font-size: 22px; font-style: italic; color: #C0272D; margin: 8px 0 0; }
  .card { background: linear-gradient(180deg, #3D081080 0%, #1A030580 100%); border: 1px solid #C9962A40; padding: 32px; margin: 32px 0; }
  .greeting { font-family: 'Cormorant Garamond', serif; font-size: 28px; color: #E8B84B; margin-bottom: 8px; }
  .body-text { font-size: 13px; line-height: 1.8; color: #C9962A; letter-spacing: 0.05em; margin-bottom: 24px; }
  .ticket-box { background: #1A0305; border: 1px solid #E8B84B60; padding: 24px; margin: 24px 0; }
  .ticket-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #C9962A20; }
  .ticket-row:last-child { border-bottom: none; }
  .ticket-label { font-size: 10px; letter-spacing: 0.2em; color: #C9962A; text-transform: uppercase; }
  .ticket-value { font-size: 13px; color: #F5D875; font-weight: 600; }
  .ticket-id { font-family: monospace; font-size: 11px; color: #E8B84B; }
  .group-code { font-family: monospace; font-size: 18px; color: #F5D875; letter-spacing: 0.15em; background: #6B0F1A40; padding: 8px 16px; display: inline-block; border: 1px solid #C9962A40; }
  .cta { text-align: center; margin: 32px 0; }
  .cta-btn { display: inline-block; background: linear-gradient(135deg, #C9962A, #E8B84B); color: #1A0305; font-family: 'Josefin Sans', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.25em; text-transform: uppercase; padding: 14px 32px; text-decoration: none; }
  .quote-box { border-top: 1px solid #C9962A20; padding-top: 24px; text-align: center; margin-top: 24px; }
  .quote { font-family: 'Playfair Display', serif; font-size: 13px; font-style: italic; color: #C0272D; line-height: 1.7; }
  .footer { text-align: center; padding: 24px 0; border-top: 1px solid #C9962A20; }
  .footer-text { font-size: 10px; letter-spacing: 0.15em; color: #C9962A60; text-transform: uppercase; }
  .divider { height: 1px; background: linear-gradient(90deg, transparent, #C9962A, transparent); margin: 24px 0; }
  .ornament { color: #C9962A; font-size: 14px; letter-spacing: 0.3em; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div class="eyebrow">✦ &nbsp; Bells University Student Association &nbsp; ✦</div>
    <div class="title">THE GREAT GATSBY</div>
    <div class="subtitle">Gala</div>
    <div style="margin-top:12px; font-size:11px; letter-spacing:0.2em; color:#C9962A;">Dinner &amp; Awards · December 20, 2025</div>
  </div>

  <div class="card">
    <div class="greeting">Dear ${params.first_name},</div>
    <div class="divider"></div>
    <p class="body-text">
      You are cordially confirmed for an evening of unparalleled elegance. Your seat at the Great Gatsby Gala awaits — an affair of golden splendour at the Marquee Hall.
    </p>
    <p class="body-text">
      Please find your ticket details below. Present your Ticket ID or QR code upon arrival. Doors open at <strong style="color:#F5D875">7:00 PM</strong>. Dress code is strictly <strong style="color:#F5D875">Formal / Black Tie</strong>.
    </p>

    <div class="ticket-box">
      <div style="text-align:center; margin-bottom:16px;">
        <span class="ornament">✦ ✦ ✦</span>
        <div style="font-family:'Cormorant Garamond',serif; font-size:18px; color:#E8B84B; letter-spacing:0.1em; margin-top:8px;">YOUR TICKET</div>
      </div>
      <div class="ticket-row">
        <span class="ticket-label">Name</span>
        <span class="ticket-value">${params.first_name} ${params.last_name}</span>
      </div>
      <div class="ticket-row">
        <span class="ticket-label">Tier</span>
        <span class="ticket-value">${params.tier_name}</span>
      </div>
      <div class="ticket-row">
        <span class="ticket-label">Table</span>
        <span class="ticket-value">${params.table_number}</span>
      </div>
      <div class="ticket-row">
        <span class="ticket-label">Tickets</span>
        <span class="ticket-value">${params.ticket_count}</span>
      </div>
      <div class="ticket-row">
        <span class="ticket-label">Ticket ID</span>
        <span class="ticket-id">${params.ticket_id}</span>
      </div>
      <div class="ticket-row">
        <span class="ticket-label">Group Code</span>
        <span class="group-code">${params.group_booking_code}</span>
      </div>
    </div>

    <p class="body-text">
      Need to transfer this ticket or update your name? Use your personal management link below — available until 24 hours before the event.
    </p>

    <div class="cta">
      <a href="${params.manage_url}" class="cta-btn">Manage My Ticket</a>
    </div>

    <p class="body-text" style="font-size:11px; color:#C9962A80;">
      A QR code for seamless entry will be sent to this email address three days before the event.
    </p>

    <div class="quote-box">
      <div class="quote">"So we beat on, boats against the current,<br />borne back ceaselessly into the past."</div>
      <div style="font-size:10px; letter-spacing:0.15em; color:#C9962A60; margin-top:8px; text-transform:uppercase;">— F. Scott Fitzgerald</div>
    </div>
  </div>

  <div class="footer">
    <div class="footer-text">BUSA · Bells University Student Association</div>
    <div class="footer-text" style="margin-top:4px;">Marquee Hall · December 20, 2025</div>
  </div>
</div>
</body>
</html>`
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const {
      attendee_id,
      first_name,
      last_name,
      email,
      tier_name,
      table_number,
      ticket_count,
      group_booking_code,
      ticket_id,
      manage_token,
      base_url,
    } = body

    if (!email || !first_name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    const manage_url = `${base_url ?? "https://busagala.com"}/manage/${manage_token}`
    const html = buildEmailHtml({
      first_name,
      last_name,
      tier_name,
      table_number,
      ticket_count,
      group_booking_code,
      ticket_id,
      manage_url,
    })

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: `✦ Your Gatsby Gala Ticket — ${tier_name} · Table ${table_number}`,
        html,
      }),
    })

    const resendData = await resendRes.json()

    if (!resendRes.ok) {
      console.error("Resend error:", resendData)
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: resendData }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    return new Response(
      JSON.stringify({ success: true, message_id: resendData.id, attendee_id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  } catch (err) {
    console.error("Function error:", err)
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  }
})
