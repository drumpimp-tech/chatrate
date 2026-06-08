import { createClient, createAdminClient } from "@/lib/supabase/server"
import { NextRequest } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const admin = await createAdminClient()
  const { data: host } = await admin.from("hosts").select("id").eq("user_id", user.id).single()
  if (!host) return Response.json({ availability: [], blocked: [] })

  const [{ data: availability }, { data: blocked }] = await Promise.all([
    admin.from("host_availability").select("*").eq("host_id", host.id).order("day_of_week"),
    admin.from("host_blocked_dates").select("*").eq("host_id", host.id).order("blocked_date"),
  ])

  return Response.json({ availability: availability || [], blocked: blocked || [] })
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const admin = await createAdminClient()
    const { data: host, error: hostError } = await admin.from("hosts").select("id").eq("user_id", user.id).single()
    if (hostError || !host) return Response.json({ error: "Host not found" }, { status: 404 })

    const body = await req.json()

    const { error: delAvailError } = await admin.from("host_availability").delete().eq("host_id", host.id)
    if (delAvailError) throw delAvailError

    if (body.availability?.length > 0) {
      const { error: insertError } = await admin.from("host_availability").insert(
        body.availability.map((a: { day_of_week: number; start_time: string; end_time: string }) => ({
          host_id: host.id,
          day_of_week: a.day_of_week,
          start_time: a.start_time,
          end_time: a.end_time,
        }))
      )
      if (insertError) throw insertError
    }

    const { error: delBlockError } = await admin.from("host_blocked_dates").delete().eq("host_id", host.id)
    if (delBlockError) throw delBlockError

    if (body.blocked?.length > 0) {
      const { error: insertBlockError } = await admin.from("host_blocked_dates").insert(
        body.blocked.map((d: string) => ({ host_id: host.id, blocked_date: d }))
      )
      if (insertBlockError) throw insertBlockError
    }

    return Response.json({ ok: true })
  } catch (e: unknown) {
    console.error("PUT /api/me/availability error:", JSON.stringify(e))
    const msg = (e as { message?: string })?.message || (e instanceof Error ? e.message : JSON.stringify(e))
    return Response.json({ error: msg }, { status: 500 })
  }
}
