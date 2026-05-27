import { stripe } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/server"
import Stripe from "stripe"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event: Stripe.Event

  try {
    if (!sig || !webhookSecret || webhookSecret === "pending") {
      // No webhook secret configured yet — parse the event without verification
      event = JSON.parse(body) as Stripe.Event
    } else {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Webhook error"
    console.error("Webhook error:", msg)
    return Response.json({ error: msg }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const username = session.metadata?.username

    if (username) {
      const admin = await createAdminClient()
      await admin
        .from("hosts")
        .update({ is_activated: true, is_available: true })
        .eq("username", username)
        .then(({ error }) => {
          if (error) console.error("Failed to activate host:", error)
          else console.log(`Activated host: ${username}`)
        })
    }
  }

  return Response.json({ received: true })
}
