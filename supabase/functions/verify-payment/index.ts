import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

const SQUAD_SECRET_KEY = Deno.env.get("SQUAD_SECRET_KEY") ?? ""
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? ""
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  try {
    const { reference, gatewayRef } = await req.json()

    if (!reference) {
      return new Response(JSON.stringify({ success: false, reason: "missing_reference" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get transaction from database
    const { data: txn, error: txnErr } = await supabase
      .from("transactions")
      .select("*")
      .eq("reference", reference)
      .single()

    if (txnErr || !txn) {
      return new Response(JSON.stringify({ success: false, reason: "transaction_not_found" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // If already confirmed, return success
    if (txn.payment_status === "confirmed") {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // If no gateway ref provided, payment was likely cancelled
    if (!gatewayRef) {
      return new Response(JSON.stringify({ success: false, reason: "cancelled" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Query Squad API to verify payment status
    const squadRes = await fetch(`https://api.squad.co/transaction/verify/${gatewayRef}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${SQUAD_SECRET_KEY}`,
      },
    })

    const squadData = await squadRes.json()

    if (!squadRes.ok || squadData.status !== "success") {
      console.error("Squad payment verification failed:", squadData)
      return new Response(JSON.stringify({ success: false, reason: "payment_failed" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Verify the amount and reference match
    if (squadData.data.amount !== txn.total_kobo || squadData.data.reference !== reference) {
      console.error("Payment mismatch - amount or reference doesn't match")
      return new Response(JSON.stringify({ success: false, reason: "verification_mismatch" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Payment is verified! Store Squad confirmation
    await supabase
      .from("transactions")
      .update({
        payment_status: "confirmed",
        squad_reference: gatewayRef,
        confirmed_at: new Date().toISOString(),
        squad_payload: squadData.data,
      })
      .eq("id", txn.id)

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (err) {
    const error = err as Error
    console.error("Verify payment error:", error.message)
    return new Response(JSON.stringify({ success: false, reason: "error", message: error.message }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
