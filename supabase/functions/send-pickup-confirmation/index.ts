import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
}

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? ""
const FROM_EMAIL = "BUSA Gala <noreply@busagala.com>"

function buildPickupHtml(params: {
  first_name: string
  pickup_location: string
  pickup_time: string
  contact_name: string
  contact_phone: string
}) {
  const { first_name, pickup_location, pickup_time, contact_name, contact_phone } = params
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>VVIP Pickup Confirmation</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,400&family=Josefin+Sans:wght@300;400;600&family=Playfair+Display:ital,wght@1,400&display=swap');
  body { margin:0; padding:0; background:#1A0305; font-family:'Josefin Sans',sans-serif; }
  .wrapper { max-width:600px; margin:0 auto; padding:40px 20px; }
  .header { text-align:center; padding:32px 0 20px; border-bottom:1px solid #C9962A40; }
  .eyebrow { font-size:10px; letter-spacing:0.4em; color:#C9962A; text-transform:uppercase; }
  .title { font-family:'Cormorant Garamond',serif; font-size:40px; font-weight:700; color:#F5D875; margin:8px 0 0; }
  .badge { display:inline-block; background:#6B0F1A; border:1px solid #C0272D60; color:#C0272D; font-size:9px; letter-spacing:0.3em; text-transform:uppercase; padding:4px 12px; margin-top:12px; }
  .card { background:linear-gradient(180deg,#3D081080 0%,#1A030580 100%); border:1px solid #C9962A40; padding:32px; margin:32px 0; }
  .greeting { font-family:'Cormorant Garamond',serif; font-size:26px; color:#E8B84B; margin-bottom:16px; }
  .body-text { font-size:13px; line-height:1.8; color:#C9962A; letter-spacing:0.05em; }
  .divider { height:1px; background:linear-gradient(90deg,transparent,#C9962A,transparent); margin:20px 0; }
  .detail-box { background:#1A0305; border:1px solid #E8B84B40; padding:20px; margin:20px 0; }
  .detail-row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #C9962A15; }
  .detail-row:last-child { border-bottom:none; }
  .label { font-size:10px; letter-spacing:0.2em; color:#C9962A; text-transform:uppercase; }
  .value { font-size:13px; color:#F5D875; font-weight:600; }
  .note { background:#6B0F1A30; border-left:3px solid #C0272D; padding:12px 16px; font-size:12px; color:#C9962A; line-height:1.7; margin:20px 0; }
  .quote { font-family:'Playfair Display',serif; font-size:12px; font-style:italic; color:#C0272D; line-height:1.7; text-align:center; padding-top:20px; border-top:1px solid #C9962A20; }
  .footer { text-align:center; padding:20px 0; font-size:10px; letter-spacing:0.15em; color:#C9962A60; text-transform:uppercase; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div class="eyebrow">✦ BUSA Dinner &amp; Awards ✦</div>
    <div class="title">THE GREAT GATSBY GALA</div>
    <div class="badge">VVIP · Complimentary Pickup</div>
  </div>
  <div class="card">
    <div class="greeting">Dear ${first_name},</div>
    <div class="divider"></div>
    <p class="body-text">
      As a VVIP guest, your complimentary pickup arrangement has been confirmed. Please find your collection details below and ensure you are ready at the specified time.
    </p>
    <div class="detail-box">
      <div style="text-align:center;margin-bottom:16px;">
        <span style="font-family:'Cormorant Garamond',serif;font-size:16px;color:#E8B84B;letter-spacing:0.1em;">PICKUP DETAILS</span>
      </div>
      <div class="detail-row">
        <span class="label">Location</span>
        <span class="value">${pickup_location}</span>
      </div>
      <div class="detail-row">
        <span class="label">Pickup Time</span>
        <span class="value">${pickup_time}</span>
      </div>
      <div class="detail-row">
        <span class="label">Your Coordinator</span>
        <span class="value">${contact_name}</span>
      </div>
      <div class="detail-row">
        <span class="label">Contact Number</span>
        <span class="value">${contact_phone}</span>
      </div>
    </div>
    <div class="note">
      Please be at your pickup location at least <strong>10 minutes early</strong>. Your coordinator will be in contact closer to the time. Dress code is strictly <strong>Formal / Black Tie</strong>.
    </div>
    <div class="quote">"So we beat on, boats against the current,<br/>borne back ceaselessly into the past."<br/><span style="font-size:10px;letter-spacing:0.15em;color:#C9962A60;font-style:normal;text-transform:uppercase;">— F. Scott Fitzgerald</span></div>
  </div>
  <div class="footer">BUSA · Bells University · Marquee Hall · December 20, 2025</div>
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
    const { attendee_id, email, first_name, pickup_location, pickup_time, contact_name, contact_phone } = body

    if (!email || !first_name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    const html = buildPickupHtml({ first_name, pickup_location, pickup_time, contact_name, contact_phone })

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: `✦ VVIP Pickup Confirmed — Gatsby Gala, December 20`,
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
