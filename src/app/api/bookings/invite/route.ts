import { createAdminClient, createClient } from "@/lib/supabase/server"

// POST /api/bookings/invite — host creates a booking invite link
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { clientName, clientEmail, scheduledAt, serviceType, notes } = body

    if (!scheduledAt) {
      return Response.json({ error: "Scheduled time is required" }, { status: 400 })
    }

    const admin = await createAdminClient()

    // Get host record
    const { data: host } = await admin
      .from("hosts")
      .select("id, rate_type, rate, transcript_fee, service_type, stripe_secret_key")
      .eq("user_id", user.id)
      .single()

    if (!host) return Response.json({ error: "Host not found" }, { status: 404 })
    if (!host.stripe_secret_key) return Response.json({ error: "Stripe not connected" }, { status: 400 })

    const { data: booking, error } = await admin
      .from("bookings")
      .insert({
        host_id: host.id,
        client_name: clientName || null,
        client_email: clientEmail || null,
        service_type: serviceType || host.service_type,
        pricing_model: host.rate_type,
        rate: host.rate,
        transcript_opted_in: false,
        transcript_fee: host.transcript_fee,
        scheduled_at: scheduledAt,
        status: "invited",
        notes: notes || null,
      })
      .select()
      .single()

    if (error) throw error

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://chatrate-app.com"
    return Response.json({
      id: booking.id,
      inviteUrl: `${appUrl}/pay/${booking.id}`,
    })
  } catch (e: unknown) {
    console.error(e)
    const msg = e instanceof Error ? e.message : "Failed to create invite"
    return Response.json({ error: msg }, { status: 500 })
  }
}
