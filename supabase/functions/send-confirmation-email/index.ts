import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, apikey",
}

const GOOGLE_SERVICE_ACCOUNT_EMAIL = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL") ?? ""
const GOOGLE_PRIVATE_KEY = Deno.env.get("GOOGLE_PRIVATE_KEY") ?? ""
const FROM_EMAIL = "BUSA Gala <noreply@busagala.com>"
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? ""
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""

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
  const { first_name, last_name, tier_name, table_number, ticket_count, group_booking_code, ticket_id, manage_url } = params
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Your Gatsby Gala Ticket</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Josefin+Sans:wght@300;400;600&family=Playfair+Display:ital,wght@1,400;1,600&display=swap');
  body { margin: 0; padding: 0; background-color: #1A0305; font-family: 'Josefin Sans', sans-serif; }
  .wrapper { max-width: 600px; margin: 0 auto; background: #1A0305; }
  .header { background: linear-gradient(135deg, #1A0305 0%, #2D0505 50%, #1A0305 100%); padding: 48px 40px 32px; text-align: center; border-bottom: 1px solid #8B0000; }
  .gold { color: #C9A84C; }
  .title { font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 700; color: #C9A84C; margin: 0 0 8px; letter-spacing: 2px; }
  .subtitle { font-family: 'Josefin Sans', sans-serif; font-size: 12px; color: #9C8060; letter-spacing: 4px; text-transform: uppercase; }
  .body { padding: 40px; }
  .greeting { font-family: 'Cormorant Garamond', serif; font-size: 24px; color: #F5E6C8; margin: 0 0 16px; }
  .text { font-size: 14px; color: #B8A090; line-height: 1.7; margin: 0 0 24px; }
  .ticket-card { background: linear-gradient(135deg, #2D0505, #1A0305); border: 1px solid #8B0000; border-radius: 4px; padding: 32px; margin: 32px 0; }
  .ticket-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(139,0,0,0.3); }
  .ticket-row:last-child { border-bottom: none; }
  .ticket-label { font-size: 11px; color: #9C8060; letter-spacing: 2px; text-transform: uppercase; }
  .ticket-value { font-family: 'Cormorant Garamond', serif; font-size: 18px; color: #C9A84C; font-weight: 600; }
  .ticket-id { font-size: 12px; color: #C9A84C; letter-spacing: 1px; font-family: monospace; }
  .btn { display: inline-block; background: linear-gradient(135deg, #8B0000, #C41E3A); color: #F5E6C8 !important; text-decoration: none; padding: 16px 40px; font-family: 'Josefin Sans', sans-serif; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; border-radius: 2px; margin: 24px 0; }
  .footer { padding: 32px 40px; border-top: 1px solid #8B0000; text-align: center; }
  .footer-text { font-size: 11px; color: #6B5040; line-height: 1.6; }
  .divider { width: 60px; height: 1px; background: #C9A84C; margin: 24px auto; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div class="title">THE GREAT GATSBY GALA</div>
    <div class="subtitle">BUSA Dinner &amp; Awards 2026</div>
  </div>
  <div class="body">
    <div class="greeting">Welcome to Stardom, ${first_name}.</div>
    <p class="text">Your payment has been processed, and your ticket is officially confirmed. We&apos;re thrilled to have you join us for The Great Gatsby Gala — an unforgettable evening of elegance, celebration, and timeless memories.</p>
    <div class="divider"></div>
    <div class="ticket-card">
      <div class="ticket-row">
        <span class="ticket-label">Ticket ID</span>
        <span class="ticket-id">${ticket_id}</span>
      </div>
      <div class="ticket-row">
        <span class="ticket-label">Category</span>
        <span class="ticket-value">${tier_name}</span>
      </div>
      <div class="ticket-row">
        <span class="ticket-label">Table</span>
        <span class="ticket-value">${table_number}</span>
      </div>
      <div class="ticket-row">
        <span class="ticket-label">Group Code</span>
        <span class="ticket-value">${group_booking_code}</span>
      </div>
      <div class="ticket-row">
        <span class="ticket-label">Seats in Group</span>
        <span class="ticket-value">${ticket_count}</span>
      </div>
    </div>
    <p class="text"><strong style="color: #C9A84C;">Your Booking Details</strong><br/>Everything you need is right here. Your group code and ticket ID are your VIP passes to an extraordinary night.</p>
    <div style="text-align:center">
      <a href="${manage_url}" class="btn">Manage Your Booking</a>
    </div>
    <div class="divider"></div>
    <p class="text" style="font-size:13px; color:#C9A84C; font-weight:600;">A Personal Thank You</p>
    <p class="text" style="font-size:12px; color:#B8A090; line-height:1.8;">Thank you for choosing to celebrate with us. Your presence makes this gala truly special. From the moment you arrive at our red carpet through the final toast, we&apos;ve curated every detail with you in mind. Get ready to experience an evening of unparalleled elegance and celebration.</p>
    <div class="divider"></div>
    <p class="text" style="font-size:12px; color:#6B5040;">📌 <strong>Event Details:</strong> Black tie attire · Doors open 6:30 PM · Bring this email or your Ticket ID. Questions? Contact us at gala@busa.co.uk</p>
  </div>
  <div class="footer">
    <div class="footer-text">Birmingham University Students' Association<br/>The Great Gatsby Gala · BUSA Dinner &amp; Awards 2026</div>
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
    const { reference, groupCode, base_url } = body

    if (!reference && !groupCode) {
      return new Response(
        JSON.stringify({ error: "reference or groupCode required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    // Use service role to bypass RLS and look up all attendees for this booking
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Fetch attendees by group code (preferred) or fall back to reference lookup
    let attendeeRows: any[] = []
    if (groupCode) {
      const { data, error } = await supabase
        .from("attendees")
        .select("id, first_name, last_name, email, ticket_id, manage_token, table_number, group_booking_code, tier_id, transaction_id")
        .eq("group_booking_code", groupCode)
      if (error) throw new Error(`DB attendees lookup failed: ${error.message}`)
      attendeeRows = data ?? []
    } else if (reference) {
      const { data: txn } = await supabase
        .from("transactions")
        .select("id, group_booking_code, quantity")
        .eq("reference", reference)
        .single()
      if (txn) {
        const { data, error } = await supabase
          .from("attendees")
          .select("id, first_name, last_name, email, ticket_id, manage_token, table_number, group_booking_code, tier_id, transaction_id")
          .eq("group_booking_code", txn.group_booking_code)
        if (error) throw new Error(`DB attendees lookup failed: ${error.message}`)
        attendeeRows = data ?? []
      }
    }

    if (attendeeRows.length === 0) {
      return new Response(
        JSON.stringify({ error: "No attendees found for this booking" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
      return new Response(
        JSON.stringify({ error: "Google Mail credentials not configured — add GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY in Supabase Dashboard → Settings → Edge Functions → Secrets" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    // Look up tier name once (all attendees in a group share the same tier)
    const { data: tierRow } = await supabase
      .from("ticket_tiers")
      .select("name")
      .eq("id", attendeeRows[0].tier_id)
      .single()
    const tier_name = tierRow?.name ?? "Regular"
    const ticket_count = attendeeRows.length

    const baseUrl = base_url ?? "https://busagala.com"
    const results: { email: string; success: boolean; error?: string }[] = []

    for (const att of attendeeRows) {
      const manage_url = `${baseUrl}/manage/${att.manage_token}`

      const html = buildEmailHtml({
        first_name: att.first_name,
        last_name: att.last_name ?? att.first_name,
        tier_name,
        table_number: att.table_number,
        ticket_count,
        group_booking_code: att.group_booking_code,
        ticket_id: att.ticket_id,
        manage_url,
      })

      try {
        const success = await sendGoogleMail(
          att.email,
          `✦ Your Gatsby Gala Ticket — ${tier_name} · Table ${att.table_number}`,
          html,
        )

        if (success) {
          results.push({ email: att.email, success: true })
          await supabase.from("attendees").update({ qr_code_sent: true }).eq("id", att.id)
          console.log(`✓ Email sent to ${att.email}`)
        } else {
          console.error("Gmail send failed for", att.email)
          results.push({ email: att.email, success: false, error: "Gmail API returned error" })
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        console.error("Gmail error for", att.email, errorMsg)
        results.push({ email: att.email, success: false, error: errorMsg })
      }
    }

    return new Response(
      JSON.stringify({ success: true, sent: results }),
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
