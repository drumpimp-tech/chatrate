import { createAdminClient } from "@/lib/supabase/server"

// GET /api/pay/[bookingId] — public, returns booking + host info for the payment page
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params
  try {
    const admin = await createAdminClient()

    const { data: booking, error } = await admin
      .from("bookings")
      .select("id, client_name, client_email, service_type, pricing_model, rate, transcript_fee, scheduled_at, status, notes, host_id")
      .eq("id", bookingId)
      .single()

    if (error || !booking) {
      return Response.json({ error: "Invite not found" }, { status: 404 })
    }

    const { data: host } = await admin
      .from("hosts")
      .select("display_name, avatar_url, bio, username")
      .eq("id", booking.host_id)
      .single()

    return Response.json({ ...booking, host })
  } catch (e) {
    console.error(e)
    return Response.json({ error: "Server error" }, { status: 500 })
  }
}
