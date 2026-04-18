import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
}

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? ""
const FROM_EMAIL = "BUSA Gala <noreply@busagala.com>"

function buildTransferHtml(params: {
  new_name: string
  new_email: string
  old_email: string
  ticket_id: string
  manage_url: string
  is_new_holder: boolean
}) {
  const { new_name, new_email, old_email, ticket_id, manage_url, is_new_holder } = params
  const greeting = is_new_holder
    ? `Dear ${new_name},`
    : `Dear Guest,`
  const intro = is_new_holder
    ? `A Gatsby Gala ticket has been transferred to you. Your details have been updated and your seat is confirmed for the evening of December 20, 2025 at Marquee Hall.`
    : `This is a confirmation that your Gatsby Gala ticket has been successfully transferred to another attendee. If you did not authorise this change, please contact us immediately.`

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Ticket Transfer Confirmation</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,400&family=Josefin+Sans:wght@300;400;600&family=Playfair+Display:ital,wght@1,400&display=swap');
  body { margin:0; padding:0; background:#1A0305; font-family:'Josefin Sans',sans-serif; }
  .wrapper { max-width:600px; margin:0 auto; padding:40px 20px; }
  .header { text-align:center; padding:32px 0 20px; border-bottom:1px solid #C9962A40; }
  .eyebrow { font-size:10px; letter-spacing:0.4em; color:#C9962A; text-transform:uppercase; }
  .title { font-family:'Cormorant Garamond',serif; font-size:40px; font-weight:700; color:#F5D875; margin:8px 0 0; }
  .subtitle-label { font-size:10px; letter-spacing:0.3em; color:#C9962A; text-transform:uppercase; margin-top:16px; }
  .card { background:linear-gradient(180deg,#3D081080 0%,#1A030580 100%); border:1px solid #C9962A40; padding:32px; margin:32px 0; }
  .greeting { font-family:'Cormorant Garamond',serif; font-size:26px; color:#E8B84B; margin-bottom:16px; }
  .body-text { font-size:13px; line-height:1.8; color:#C9962A; letter-spacing:0.05em; }
  .divider { height:1px; background:linear-gradient(90deg,transparent,#C9962A,transparent); margin:24px 0; }
  .info-row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #C9962A20; }
  .info-row:last-child { border-bottom:none; }
  .label { font-size:10px; letter-spacing:0.2em; color:#C9962A; text-transform:uppercase; }
  .value { font-size:13px; color:#F5D875; font-family:monospace; }
  .cta { text-align:center; margin:28px 0; }
  .cta-btn { display:inline-block; background:linear-gradient(135deg,#C9962A,#E8B84B); color:#1A0305; font-size:10px; font-weight:600; letter-spacing:0.25em; text-transform:uppercase; padding:13px 28px; text-decoration:none; font-family:'Josefin Sans',sans-serif; }
  .quote { font-family:'Playfair Display',serif; font-size:12px; font-style:italic; color:#C0272D; line-height:1.7; text-align:center; padding-top:20px; border-top:1px solid #C9962A20; }
  .footer { text-align:center; padding:20px 0; font-size:10px; letter-spacing:0.15em; color:#C9962A60; text-transform:uppercase; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div class="eyebrow">✦ BUSA Dinner &amp; Awards ✦</div>
    <div class="title">THE GREAT GATSBY GALA</div>
    <div class="subtitle-label">Ticket Transfer Confirmation</div>
  </div>
  <div class="card">
    <div class="greeting">${greeting}</div>
    <div class="divider"></div>
    <p class="body-text">${intro}</p>
    <br/>
    <div class="info-row">
      <span class="label">Ticket ID</span>
      <span class="value">${ticket_id}</span>
    </div>
    <div class="info-row">
      <span class="label">New Holder</span>
      <span class="value">${new_name}</span>
    </div>
    <div class="info-row">
      <span class="label">New Email</span>
      <span class="value">${new_email}</span>
    </div>
    ${is_new_holder ? `
    <div class="cta">
      <a href="${manage_url}" class="cta-btn">Manage My Ticket</a>
    </div>
    <p class="body-text" style="font-size:11px;color:#C9962A80;text-align:center;">
      A QR code for entry will be sent to this address three days before the event.
    </p>
    ` : `
    <br/>
    <p class="body-text" style="font-size:11px;">
      If this transfer was not authorised by you, please contact us at <a href="mailto:gala@busa.edu.ng" style="color:#E8B84B;">gala@busa.edu.ng</a> immediately.
    </p>
    `}
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
    const { attendee_id, new_email, new_name, old_email, ticket_id, manage_token, base_url } = body

    if (!new_email || !old_email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    const manage_url = `${base_url ?? "https://busagala.com"}/manage/${manage_token}`

    const emailsToSend = [
      { to: new_email, is_new_holder: true },
      { to: old_email, is_new_holder: false },
    ]

    const results = await Promise.allSettled(
      emailsToSend.map(({ to, is_new_holder }) =>
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: [to],
            subject: is_new_holder
              ? `✦ Gatsby Gala Ticket — Transferred to You`
              : `✦ Gatsby Gala Ticket — Transfer Confirmed`,
            html: buildTransferHtml({ new_name, new_email, old_email, ticket_id, manage_url, is_new_holder }),
          }),
        })
      ),
    )

    return new Response(
      JSON.stringify({ success: true, attendee_id, results: results.map((r) => r.status) }),
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
