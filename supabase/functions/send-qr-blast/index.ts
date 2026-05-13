import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"
import { SMTPClient } from "https://deno.land/x/denomailer/mod.ts"
// QR code generator — pure Deno, no canvas needed
import QRCode from "https://esm.sh/qrcode@1.5.3"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, apikey",
}

const GMAIL_USER = "temitopeyr@gmail.com"
const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD") ?? ""
const FROM_EMAIL = `BUSA Gala <${GMAIL_USER}>`
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? ""
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""

/** Generate a QR code as a base64 PNG data URL */
async function generateQRDataUrl(ticketId: string): Promise<string> {
  return await QRCode.toDataURL(ticketId, {
    width: 300,
    margin: 2,
    color: {
      dark: "#C9A84C",  // gold dots
      light: "#1A0305", // dark red background
    },
  })
}

function buildQREmailHtml(params: {
  first_name: string
  last_name: string
  ticket_id: string
  tier_name: string
  table_number: number
  qr_data_url: string
  manage_url: string
}) {
  const { first_name, last_name, ticket_id, tier_name, table_number, qr_data_url, manage_url } = params
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Your Entry QR Code — BUSA Great Gatsby Gala</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Josefin+Sans:wght@300;400;600&display=swap');
  body { margin: 0; padding: 0; background-color: #1A0305; font-family: 'Josefin Sans', sans-serif; }
  .wrapper { max-width: 600px; margin: 0 auto; background: #1A0305; }
  .header { background: linear-gradient(135deg, #1A0305 0%, #2D0505 50%, #1A0305 100%); padding: 48px 40px 32px; text-align: center; border-bottom: 1px solid #8B0000; }
  .eyebrow { font-size: 10px; color: #9C8060; letter-spacing: 5px; text-transform: uppercase; margin-bottom: 12px; }
  .title { font-family: 'Cormorant Garamond', serif; font-size: 38px; font-weight: 700; color: #C9A84C; margin: 0 0 8px; letter-spacing: 3px; }
  .subtitle { font-size: 11px; color: #9C8060; letter-spacing: 4px; text-transform: uppercase; }
  .body { padding: 40px; }
  .greeting { font-family: 'Cormorant Garamond', serif; font-size: 24px; color: #F5E6C8; margin: 0 0 12px; }
  .text { font-size: 14px; color: #B8A090; line-height: 1.9; margin: 0 0 20px; }
  .divider { width: 60px; height: 1px; background: #C9A84C; margin: 28px auto; }
  .section-label { font-size: 10px; color: #9C8060; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 14px; text-align: center; }

  /* Ticket card */
  .ticket { background: linear-gradient(135deg, #2D0505 0%, #1A0305 100%); border: 1px solid #8B000060; border-radius: 6px; overflow: hidden; margin: 24px 0; }
  .ticket-top { padding: 24px 28px; display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px dashed #8B000050; }
  .ticket-name { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 700; color: #F5E6C8; margin: 0 0 4px; }
  .ticket-meta { font-size: 12px; color: #9C8060; letter-spacing: 1px; }
  .ticket-badge { background: rgba(201,168,76,0.15); border: 1px solid #C9A84C60; border-radius: 3px; padding: 6px 14px; text-align: center; }
  .ticket-badge-label { font-size: 9px; color: #9C8060; letter-spacing: 3px; text-transform: uppercase; display: block; }
  .ticket-badge-value { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 700; color: #C9A84C; display: block; }
  .ticket-bottom { padding: 24px 28px; display: flex; justify-content: space-between; align-items: center; gap: 20px; }
  .ticket-info { flex: 1; }
  .ticket-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(139,0,0,0.2); }
  .ticket-row:last-child { border-bottom: none; }
  .ticket-row-label { font-size: 10px; color: #9C8060; letter-spacing: 2px; text-transform: uppercase; }
  .ticket-row-value { font-family: 'Cormorant Garamond', serif; font-size: 16px; color: #C9A84C; font-weight: 600; }
  .ticket-id-mono { font-family: monospace; font-size: 11px; color: #C9A84C; letter-spacing: 1px; }

  /* QR */
  .qr-wrap { text-align: center; padding: 24px; border: 1px solid #8B000040; border-radius: 6px; background: #1A0305; margin: 24px 0; }
  .qr-img { width: 200px; height: 200px; display: block; margin: 0 auto 12px; border: 2px solid #C9A84C30; border-radius: 4px; }
  .qr-caption { font-size: 10px; color: #6B5040; letter-spacing: 2px; text-transform: uppercase; }

  /* Instruction box */
  .instruction { background: rgba(201,168,76,0.06); border-left: 3px solid #C9A84C; padding: 16px 20px; margin: 20px 0; border-radius: 0 4px 4px 0; }
  .instruction p { font-size: 13px; color: #B8A090; margin: 0; line-height: 1.7; }
  .instruction strong { color: #C9A84C; }

  .btn { display: block; background: linear-gradient(135deg, #8B0000, #C41E3A); color: #F5E6C8 !important; text-decoration: none; padding: 16px 40px; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; border-radius: 2px; margin: 20px auto; text-align: center; max-width: 240px; }
  .footer { padding: 32px 40px; border-top: 1px solid rgba(139,0,0,0.4); text-align: center; }
  .footer-text { font-size: 11px; color: #6B5040; line-height: 1.8; }
</style>
</head>
<body>
<div class="wrapper">

  <!-- Header -->
  <div class="header">
    <div class="eyebrow">Bells University Student Association</div>
    <div class="title">BUSA AWARDS</div>
    <div class="subtitle">Your Entry Pass — The Great Gatsby Gala</div>
  </div>

  <div class="body">
    <div class="greeting">Dear ${first_name} ${last_name},</div>
    <p class="text">
      The night is almost here. Below is your <strong style="color:#C9A84C">personal QR entry pass</strong>
      for the BUSA Great Gatsby Gala. Present it at the door — either on your phone or printed.
    </p>

    <!-- Ticket card -->
    <div class="ticket">
      <div class="ticket-top">
        <div>
          <div class="ticket-name">${first_name} ${last_name}</div>
          <div class="ticket-meta">${tier_name}</div>
        </div>
        <div class="ticket-badge">
          <span class="ticket-badge-label">Table</span>
          <span class="ticket-badge-value">${table_number}</span>
        </div>
      </div>
      <div class="ticket-bottom">
        <div class="ticket-info">
          <div class="ticket-row">
            <span class="ticket-row-label">Ticket ID</span>
            <span class="ticket-id-mono">${ticket_id}</span>
          </div>
          <div class="ticket-row">
            <span class="ticket-row-label">Category</span>
            <span class="ticket-row-value">${tier_name}</span>
          </div>
          <div class="ticket-row">
            <span class="ticket-row-label">Table No.</span>
            <span class="ticket-row-value">${table_number}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- QR Code -->
    <div class="section-label">Your Entry QR Code</div>
    <div class="qr-wrap">
      <img src="${qr_data_url}" alt="Your QR Entry Code" class="qr-img" />
      <div class="qr-caption">Scan at the door · One use only</div>
    </div>

    <!-- Instructions -->
    <div class="instruction">
      <p>
        <strong>How to use it:</strong> Show this QR code to the check-in team at the entrance.
        It can only be scanned once — do not share it. If you've transferred your ticket,
        the new holder will receive their own code.
      </p>
    </div>

    <div class="divider"></div>

    <p class="text" style="font-size:13px; color:#6B5040; text-align:center;">
      Doors open at <strong style="color:#9C8060">6:30 PM</strong> ·
      Black tie required · Please arrive on time.
    </p>

    <a href="${manage_url}" class="btn">Manage My Ticket</a>

    <p class="text" style="text-align:center; font-size:13px; margin-top: 28px;">
      See you on the floor. 🥂<br/>
      <strong style="color:#9C8060; letter-spacing:2px; font-size:11px;">THE BUSA EVENTS TEAM</strong>
    </p>
  </div>

  <div class="footer">
    <div class="footer-text">
      Bells University Student Association · The Great Gatsby Gala<br/>
      Questions? Reply to this email.
    </div>
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
    const body = await req.json().catch(() => ({}))
    const base_url: string = body.base_url ?? "https://busagreatgatbsy.vercel.app"
    const dry_run: boolean = body.dry_run ?? false
    // Single attendee test mode
    const attendee_id: string | null = body.attendee_id ?? null
    // Optional: override the recipient email (for test sends to your own inbox)
    const override_email: string | null = body.override_email ?? null

    if (!GMAIL_APP_PASSWORD) {
      return new Response(
        JSON.stringify({ error: "GMAIL_APP_PASSWORD not configured in Supabase secrets" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Build query
    let query = supabase
      .from("attendees")
      .select(`
        id, first_name, last_name, email, ticket_id, manage_token, table_number,
        tier:ticket_tiers(name)
      `)

    if (attendee_id) {
      // Single-attendee mode (for test sends)
      query = query.eq("id", attendee_id)
    } else {
      // Bulk mode: only those who haven't received it yet
      query = query.eq("qr_code_sent", false).limit(500)
    }

    const { data: attendees, error: fetchErr } = await query

    if (fetchErr || !attendees || attendees.length === 0) {
      return new Response(
        JSON.stringify({ error: "No eligible attendees found", details: fetchErr?.message }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    if (dry_run) {
      return new Response(
        JSON.stringify({
          dry_run: true,
          total: attendees.length,
          recipients: attendees.map((a) => ({
            id: a.id,
            name: `${a.first_name} ${a.last_name}`,
            email: a.email,
            ticket_id: a.ticket_id,
          })),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    const results: { email: string; ticket_id: string; success: boolean; error?: string }[] = []

    for (const att of attendees) {
      const tier_name = (att.tier as any)?.name ?? "Regular"
      const manage_url = `${base_url}/manage/${att.manage_token}`

      try {
        // Generate QR as base64 data URL
        const qr_data_url = await generateQRDataUrl(att.ticket_id)

        const html = buildQREmailHtml({
          first_name: att.first_name,
          last_name: att.last_name,
          ticket_id: att.ticket_id,
          tier_name,
          table_number: att.table_number,
          qr_data_url,
          manage_url,
        })

        const client = new SMTPClient({
          connection: {
            hostname: "smtp.gmail.com",
            port: 465,
            tls: true,
            auth: { username: GMAIL_USER, password: GMAIL_APP_PASSWORD },
          },
        })

        const recipient = override_email ?? att.email
        await client.send({
          from: FROM_EMAIL,
          to: recipient,
          subject: `✦ Your Entry QR Code — BUSA Great Gatsby Gala · ${tier_name} · Table ${att.table_number}${
            override_email ? " [TEST]" : ""
          }`,
          html,
        })

        await client.close()

        // Only mark as sent if this is a real send (not a test override)
        if (!override_email) await supabase
          .from("attendees")
          .update({ qr_code_sent: true })
          .eq("id", att.id)

        results.push({ email: att.email, ticket_id: att.ticket_id, success: true })
      } catch (mailErr: unknown) {
        const errMsg = mailErr instanceof Error ? mailErr.message : String(mailErr)
        console.error("QR email error for", att.email, errMsg)
        results.push({ email: att.email, ticket_id: att.ticket_id, success: false, error: errMsg })
      }
    }

    const successCount = results.filter((r) => r.success).length
    const failCount = results.filter((r) => !r.success).length

    return new Response(
      JSON.stringify({ success: true, total: results.length, sent: successCount, failed: failCount, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("Edge function error:", message)
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  }
})
