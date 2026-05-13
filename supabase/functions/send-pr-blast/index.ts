import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"
import { SMTPClient } from "https://deno.land/x/denomailer/mod.ts"

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

function buildPREmailHtml(params: {
  first_name: string
  manage_url: string
}) {
  const { first_name, manage_url } = params
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>10 Days to the Great Gatsby Gala</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Josefin+Sans:wght@300;400;600&family=Playfair+Display:ital,wght@1,400;1,600&display=swap');
  body { margin: 0; padding: 0; background-color: #1A0305; font-family: 'Josefin Sans', sans-serif; }
  .wrapper { max-width: 600px; margin: 0 auto; background: #1A0305; }
  .header { background: linear-gradient(135deg, #1A0305 0%, #2D0505 50%, #1A0305 100%); padding: 48px 40px 32px; text-align: center; border-bottom: 1px solid #8B0000; }
  .eyebrow { font-family: 'Josefin Sans', sans-serif; font-size: 10px; color: #9C8060; letter-spacing: 5px; text-transform: uppercase; margin-bottom: 12px; }
  .title { font-family: 'Cormorant Garamond', serif; font-size: 40px; font-weight: 700; color: #C9A84C; margin: 0 0 8px; letter-spacing: 3px; }
  .subtitle { font-family: 'Josefin Sans', sans-serif; font-size: 11px; color: #9C8060; letter-spacing: 4px; text-transform: uppercase; }
  .body { padding: 40px; }
  .countdown { font-family: 'Cormorant Garamond', serif; font-size: 56px; font-weight: 700; color: #C9A84C; text-align: center; line-height: 1; margin: 0 0 4px; }
  .countdown-label { font-family: 'Josefin Sans', sans-serif; font-size: 10px; color: #9C8060; letter-spacing: 5px; text-transform: uppercase; text-align: center; margin-bottom: 36px; }
  .greeting { font-family: 'Cormorant Garamond', serif; font-size: 24px; color: #F5E6C8; margin: 0 0 16px; }
  .text { font-size: 14px; color: #B8A090; line-height: 1.9; margin: 0 0 20px; }
  .divider { width: 60px; height: 1px; background: #C9A84C; margin: 28px auto; }
  .section-title { font-family: 'Josefin Sans', sans-serif; font-size: 10px; color: #9C8060; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 12px; }
  .highlight-box { background: linear-gradient(135deg, #2D0505, #1A0305); border: 1px solid rgba(139,0,0,0.5); border-radius: 4px; padding: 24px 28px; margin: 24px 0; }
  .highlight-box ul { margin: 0; padding: 0 0 0 16px; }
  .highlight-box li { font-size: 13px; color: #B8A090; line-height: 2; }
  .highlight-box li strong { color: #C9A84C; font-weight: 600; }
  .dress-box { border-left: 3px solid #C9A84C; padding: 16px 20px; margin: 24px 0; background: rgba(201,168,76,0.05); }
  .dress-box p { font-size: 13px; color: #B8A090; margin: 0; line-height: 1.7; }
  .quote { font-family: 'Playfair Display', serif; font-size: 15px; font-style: italic; color: #8B0000; text-align: center; line-height: 1.7; margin: 28px 0; }
  .btn { display: block; background: linear-gradient(135deg, #8B0000, #C41E3A); color: #F5E6C8 !important; text-decoration: none; padding: 18px 40px; font-family: 'Josefin Sans', sans-serif; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; border-radius: 2px; margin: 28px auto; text-align: center; max-width: 260px; }
  .btn-outline { display: block; background: transparent; color: #C9A84C !important; text-decoration: none; padding: 16px 40px; font-family: 'Josefin Sans', sans-serif; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; border-radius: 2px; border: 1px solid rgba(201,168,76,0.5); margin: 12px auto; text-align: center; max-width: 260px; }
  .footer { padding: 32px 40px; border-top: 1px solid rgba(139,0,0,0.4); text-align: center; }
  .footer-text { font-size: 11px; color: #6B5040; line-height: 1.8; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div class="eyebrow">Bells University Student Association</div>
    <div class="title">BUSA AWARDS</div>
    <div class="subtitle">The Great Gatsby Gala</div>
  </div>
  <div class="body">

    <!-- Countdown -->
    <div class="countdown">10</div>
    <div class="countdown-label">Days to go</div>

    <div class="greeting">Dear ${first_name},</div>

    <p class="text">
      Ten days. That's all that stands between you and the night everyone on campus
      will be talking about for years to come.
    </p>
    <p class="text">
      The <strong style="color:#C9A84C">BUSA Great Gatsby Gala</strong> is almost here —
      and we want to make sure you're fully ready to step into the most glamorous evening
      this campus has ever seen.
    </p>

    <div class="divider"></div>

    <!-- What to expect -->
    <div class="section-title">What to Expect on the Night</div>
    <div class="highlight-box">
      <ul>
        <li><strong>The BUSA Awards Ceremony</strong> — celebrating the best across Innovation, Entertainment, Sports, Leadership, Creative Arts &amp; Social</li>
        <li><strong>Live performances</strong> from campus's finest talent</li>
        <li><strong>A roaring 20s atmosphere</strong> — gold, glam, and greatness</li>
        <li><strong>Moments you'll never forget</strong></li>
      </ul>
    </div>

    <!-- Dress code -->
    <div class="section-title">Dress Code</div>
    <div class="dress-box">
      <p>
        This is a <strong style="color:#C9A84C">black-tie / glamorous</strong> event.
        Think gowns, suits, pearls, feathers, gold — the full Gatsby.
        Come dressed like you belong in the room, because you do.
      </p>
    </div>

    <div class="divider"></div>

    <!-- Manage ticket CTA -->
    <div class="section-title">Your Ticket</div>
    <p class="text">
      Your ticket is already secured. Use the link below to view your details,
      update your name, or transfer your ticket to someone else — transfers close 24 hours before the event.
    </p>
    <a href="${manage_url}" class="btn">Manage My Ticket</a>

    <!-- Awards nomination CTA -->
    <div class="section-title" style="margin-top:32px">Have You Nominated?</div>
    <p class="text">
      The BUSA Awards nominations are still open. Put forward the people who deserve
      to be celebrated — nominations close soon.
    </p>
    <a href="https://busagreatgatbsy.vercel.app/awards" class="btn-outline">Submit Your Nominations</a>

    <div class="divider"></div>

    <!-- Quote -->
    <div class="quote">
      "In his blue gardens, men and girls came and went like moths<br/>
      among the whisperings and the champagne and the stars."<br/>
      <span style="font-size:11px; color:#6B5040; font-family:'Josefin Sans',sans-serif; letter-spacing:2px; font-style:normal;">— F. SCOTT FITZGERALD</span>
    </div>

    <p class="text" style="text-align:center; font-size:13px;">
      We've been building this night for you.<br/>
      Show up, show out, and let's make history together. 🥂
    </p>

    <p class="text" style="text-align:center; font-size:12px; color:#6B5040;">
      With love &amp; anticipation,<br/>
      <strong style="color:#9C8060; letter-spacing:2px;">THE BUSA EVENTS TEAM</strong>
    </p>

  </div>
  <div class="footer">
    <div class="footer-text">
      Bells University Student Association · The Great Gatsby Gala<br/>
      You're receiving this because you purchased a ticket to the event.<br/>
      For support, reply to this email.
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
    // Optional: pass dry_run: true to just return the list without sending
    const dry_run: boolean = body.dry_run ?? false

    if (!GMAIL_APP_PASSWORD) {
      return new Response(
        JSON.stringify({ error: "GMAIL_APP_PASSWORD not configured in Supabase secrets" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Fetch every confirmed attendee
    const { data: attendees, error: fetchErr } = await supabase
      .from("attendees")
      .select("id, first_name, last_name, email, manage_token")
      .not("manage_token", "is", null)

    if (fetchErr || !attendees || attendees.length === 0) {
      return new Response(
        JSON.stringify({ error: "No attendees found", details: fetchErr?.message }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    if (dry_run) {
      return new Response(
        JSON.stringify({
          dry_run: true,
          total: attendees.length,
          recipients: attendees.map((a) => ({ name: `${a.first_name} ${a.last_name}`, email: a.email })),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    const results: { email: string; success: boolean; error?: string }[] = []

    for (const att of attendees) {
      const manage_url = `${base_url}/manage/${att.manage_token}`
      const html = buildPREmailHtml({ first_name: att.first_name, manage_url })

      try {
        const client = new SMTPClient({
          connection: {
            hostname: "smtp.gmail.com",
            port: 465,
            tls: true,
            auth: {
              username: GMAIL_USER,
              password: GMAIL_APP_PASSWORD,
            },
          },
        })

        await client.send({
          from: FROM_EMAIL,
          to: att.email,
          subject: "10 Days to the Great Gatsby Gala ✨ — BUSA Awards Night",
          html,
        })

        await client.close()
        results.push({ email: att.email, success: true })
      } catch (mailErr: unknown) {
        const errMsg = mailErr instanceof Error ? mailErr.message : String(mailErr)
        console.error("SMTP error for", att.email, errMsg)
        results.push({ email: att.email, success: false, error: errMsg })
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
