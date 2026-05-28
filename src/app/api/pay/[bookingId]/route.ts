import { createAdminClient } from "@/lib/supabase/server"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params
  try {
    const admin = await createAdminClient()

    const { data: booking, error } = await admin
      .from("bookings")
      .select("id, client_name, client_email, service_type, pricing_model, rate, transcript_fee, scheduled_at, status, notes, host_id, is_group, max_seats")
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

    // For group sessions, count how many seats are taken
    let seatsTaken = 0
    if (booking.is_group) {
      const { count } = await admin
        .from("booking_participants")
        .select("id", { count: "exact", head: true })
        .eq("booking_id", bookingId)
      seatsTaken = count ?? 0
    }

    return Response.json({ ...booking, host, seatsTaken })
  } catch (e) {
    console.error(e)
    return Response.json({ error: "Server error" }, { status: 500 })
  }
}
