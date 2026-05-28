import { createAdminClient } from "@/lib/supabase/server"
import Stripe from "stripe"

// POST /api/bookings/setup-intent
// Creates a Stripe SetupIntent using the host's own keys.
// Returns { clientSecret, publishableKey } to the booking page.
export async function POST(req: Request) {
  try {
    const { hostUsername } = await req.json()
    if (!hostUsername) {
      return Response.json({ error: "Missing hostUsername" }, { status: 400 })
    }

    const admin = await createAdminClient()
    const { data: host } = await admin
      .from("hosts")
      .select("id, stripe_secret_key, stripe_publishable_key, is_available, is_activated")
      .eq("username", hostUsername)
      .single()

    if (!host) return Response.json({ error: "Host not found" }, { status: 404 })
    if (!host.is_activated) return Response.json({ error: "Host not activated" }, { status: 403 })
    if (!host.is_available) return Response.json({ error: "Host not available" }, { status: 403 })
    if (!host.stripe_secret_key) return Response.json({ error: "Host has not connected Stripe" }, { status: 400 })

    const hostStripe = new Stripe(host.stripe_secret_key, {
      apiVersion: "2026-04-22.dahlia" as const,
    })

    const setupIntent = await hostStripe.setupIntents.create({
      usage: "off_session",
      metadata: { source: "chatrate", hostUsername },
    })

    return Response.json({
      clientSecret: setupIntent.client_secret,
      publishableKey: host.stripe_publishable_key,
    })
  } catch (e: unknown) {
    console.error(e)
    const msg = e instanceof Error ? e.message : "Failed to create setup intent"
    return Response.json({ error: msg }, { status: 500 })
  }
}
