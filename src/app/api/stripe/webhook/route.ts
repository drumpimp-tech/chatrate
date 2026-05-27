import { stripe } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/server"
import Stripe from "stripe"

export const runtime = "nodejs"

// Stripe requires the raw body for signature verification — never parse as JSON first
export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  // Reject if secret is missing or still placeholder
  if (!webhookSecret || webhookSecret === "pending") {
    console.error("STRIPE_WEBHOOK_SECRET is not configured")
    return Response.json({ error: "Webhook not configured" }, { status: 500 })
  }

  if (!sig) {
    console.error("Missing stripe-signature header")
    return Response.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Signature verification failed"
    console.error("Webhook signature error:", msg)
    return Response.json({ error: msg }, { status: 400 })
  }

  // Handle events
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const username = session.metadata?.username
        const userId = session.metadata?.userId

        if (!username) {
          console.error("checkout.session.completed: missing username in metadata", session.id)
          break
        }

        const admin = await createAdminClient()

        // Idempotent — only update if not already activated
        const { data: host } = await admin
          .from("hosts")
          .select("id, is_activated")
          .eq("username", username)
          .single()

        if (!host) {
          console.error(`Host not found for username: ${username}`)
          break
        }

        if (host.is_activated) {
          console.log(`Host ${username} already activated — skipping`)
          break
        }

        const { error } = await admin
          .from("hosts")
          .update({
            is_activated: true,
            is_available: true,
            stripe_checkout_session_id: session.id,
          })
          .eq("id", host.id)

        if (error) {
          console.error(`Failed to activate host ${username}:`, error)
        } else {
          console.log(`✅ Activated host: ${username} (userId: ${userId})`)
        }
        break
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent
        console.warn(`Payment failed: ${pi.id} — ${pi.last_payment_error?.message}`)
        break
      }

      default:
        // Ignore unhandled event types
        break
    }
  } catch (e) {
    console.error("Error processing webhook event:", e)
    // Return 200 anyway so Stripe doesn't retry — we log the error
  }

  return Response.json({ received: true })
}
