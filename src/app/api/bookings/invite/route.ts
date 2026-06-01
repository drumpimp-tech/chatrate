import { createAdminClient, createClient } from "@/lib/supabase/server"

// POST /api/bookings/invite — host creates a booking invite link (1-on-1 or group)
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { clientName, clientEmail, scheduledAt, serviceType, notes, isGroup, maxSeats } = body

    const admin = await createAdminClient()

    const { data: host } = await admin
      .from("hosts")
      .select("id, rate_type, rate, transcript_fee, service_type, stripe_secret_key")
      .eq("user_id", user.id)
      .single()

    if (!host) return Response.json({ error: "Host not found" }, { status: 404 })
    if (!host.stripe_secret_key) return Response.json({ error: "Stripe not connected" }, { status: 400 })

    const groupSession = isGroup === true
    const seats = groupSession ? Math.max(2, parseInt(maxSeats) || 2) : 1

    const { data: booking, error } = await admin
      .from("bookings")
      .insert({
        host_id: host.id,
        client_name: groupSession ? null : (clientName || null),
        client_email: groupSession ? null : (clientEmail || null),
        service_type: serviceType || host.service_type,
        pricing_model: host.rate_type,
        rate: host.rate,
        transcript_opted_in: false,
        transcript_fee: host.transcript_fee,
        scheduled_at: scheduledAt || null,
        status: "invited",
        notes: notes || null,
        is_group: groupSession,
        max_seats: seats,
      })
      .select()
      .single()

    if (error) throw error

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://chatrate-app.com"
    return Response.json({
      id: booking.id,
      inviteUrl: `${appUrl}/pay/${booking.id}`,
      isGroup: groupSession,
      maxSeats: seats,
    })
  } catch (e: unknown) {
    console.error(e)
    const msg = e instanceof Error ? e.message : "Failed to create invite"
    return Response.json({ error: msg }, { status: 500 })
  }
}
