import { createAdminClient } from "@/lib/supabase/server"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params
  const admin = await createAdminClient()

  const { data: booking } = await admin
    .from("bookings")
    .select("host_id")
    .eq("id", bookingId)
    .single()

  if (!booking) return Response.json({ availability: [], blocked: [] })

  const [{ data: availability }, { data: blocked }] = await Promise.all([
    admin.from("host_availability").select("day_of_week,start_time,end_time").eq("host_id", booking.host_id).order("day_of_week"),
    admin.from("host_blocked_dates").select("blocked_date").eq("host_id", booking.host_id),
  ])

  return Response.json({ availability: availability || [], blocked: blocked || [] })
}
