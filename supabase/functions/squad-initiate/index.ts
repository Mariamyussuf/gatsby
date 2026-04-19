import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, apikey",
}

const SQUAD_SECRET_KEY = Deno.env.get("SQUAD_SECRET_KEY") ?? ""
const SQUAD_BASE_URL = Deno.env.get("SQUAD_BASE_URL") ?? "https://sandbox-api-d.squadco.com"

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    if (!SQUAD_SECRET_KEY) {
      return new Response(
        JSON.stringify({ error: "SQUAD_SECRET_KEY not configured in Supabase secrets" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    const body = await req.json()
    const { email, amount, transaction_ref, callback_url, metadata } = body

    if (!email || !amount || !transaction_ref || !callback_url) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email, amount, transaction_ref, callback_url" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    const squadRes = await fetch(`${SQUAD_BASE_URL}/transaction/initiate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SQUAD_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount,
        currency: "NGN",
        initiate_type: "inline",
        transaction_ref,
        callback_url,
        pass_charge: false,
        metadata: JSON.stringify(metadata ?? {}),
      }),
    })

    const squadData = await squadRes.json()

    if (!squadRes.ok || !squadData?.data?.auth_url) {
      console.error("Squad initiate error:", squadData)
      return new Response(
        JSON.stringify({ error: "Squad failed to initiate transaction", details: squadData }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    return new Response(
      JSON.stringify({
        auth_url: squadData.data.auth_url,
        transaction_ref: squadData.data.transaction_ref ?? transaction_ref,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  }
})
