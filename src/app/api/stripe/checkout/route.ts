import { stripe } from "@/lib/stripe"
import { createAdminClient, createClient } from "@/lib/supabase/server"

// POST — create $4.99 Stripe Checkout session (platform payment)
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const { username } = await req.json()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://chatrate-app.com"

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: 499, // $4.99
            product_data: {
              name: "ChatRate — Lifetime Access",
              description: "Your own /book/username page. Unlimited bookings. No monthly fees.",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/onboarding/success?username=${username}`,
      cancel_url: `${appUrl}/onboarding`,
      metadata: { username, userId: user.id },
    })

    // Store the checkout session ID on the host record
    const admin = await createAdminClient()
    await admin
      .from("hosts")
      .update({ stripe_checkout_session_id: session.id })
      .eq("user_id", user.id)

    return Response.json({ url: session.url })
  } catch (e: unknown) {
    console.error(e)
    const msg = e instanceof Error ? e.message : "Checkout failed"
    return Response.json({ error: msg }, { status: 500 })
  }
}

// PATCH — activate host account (called from success page as fallback)
export async function PATCH(req: Request) {
  try {
    const { username } = await req.json()
    if (!username) return Response.json({ error: "Missing username" }, { status: 400 })

    const admin = await createAdminClient()
    const { data, error } = await admin
      .from("hosts")
      .update({ is_activated: true, is_available: true })
      .eq("username", username)
      .select()
      .single()

    if (error) throw error
    return Response.json({ ok: true, host: data })
  } catch (e: unknown) {
    console.error(e)
    return Response.json({ ok: false }, { status: 500 })
  }
}
