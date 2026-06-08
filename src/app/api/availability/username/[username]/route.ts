import { createAdminClient } from "@/lib/supabase/server"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params
  const admin = await createAdminClient()

  const { data: host } = await admin
    .from("hosts")
    .select("id, timezone")
    .eq("username", username)
    .single()

  if (!host) return Response.json({ availability: [], blocked: [], timezone: "America/New_York" })

  const [{ data: availability }, { data: blocked }] = await Promise.all([
    admin.from("host_availability").select("day_of_week,start_time,end_time").eq("host_id", host.id).order("day_of_week"),
    admin.from("host_blocked_dates").select("blocked_date").eq("host_id", host.id),
  ])

  return Response.json({
    availability: availability || [],
    blocked: blocked || [],
    timezone: host.timezone || "America/New_York",
  })
}
