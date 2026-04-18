import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
}

const SQUAD_SECRET_KEY = Deno.env.get("SQUAD_SECRET_KEY") ?? ""
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? ""
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { Event, Body } = body

    if (Event !== "charge_successful") {
      return new Response(
        JSON.stringify({ received: true, ignored: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    const {
      transaction_ref,
      amount,
      email,
      meta,
    } = Body

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: existing } = await supabase
      .from("transactions")
      .select("id, status")
      .eq("squad_reference", transaction_ref)
      .maybeSingle()

    if (existing?.status === "confirmed") {
      return new Response(
        JSON.stringify({ received: true, already_processed: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    if (existing) {
      await supabase
        .from("transactions")
        .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
        .eq("squad_reference", transaction_ref)
    }

    const parsedMeta = typeof meta === "string" ? JSON.parse(meta) : meta
    const { tier_id, table_id, attendees: attendeeList } = parsedMeta ?? {}

    if (table_id) {
      const { data: tableData } = await supabase
        .from("gala_tables")
        .select("seats_booked, seats_total")
        .eq("id", table_id)
        .maybeSingle()

      if (tableData) {
        const count = Array.isArray(attendeeList) ? attendeeList.length : 1
        await supabase
          .from("gala_tables")
          .update({ seats_booked: tableData.seats_booked + count })
          .eq("id", table_id)
      }
    }

    return new Response(
      JSON.stringify({ received: true, success: true, transaction_ref }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  } catch (err) {
    console.error("Webhook error:", err)
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  }
})
