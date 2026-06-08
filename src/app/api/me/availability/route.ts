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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const admin = await createAdminClient()
  const { data: host } = await admin.from("hosts").select("id").eq("user_id", user.id).single()
  if (!host) return Response.json({ error: "Host not found" }, { status: 404 })

  const body = await req.json()

  await admin.from("host_availability").delete().eq("host_id", host.id)
  if (body.availability?.length > 0) {
    await admin.from("host_availability").insert(
      body.availability.map((a: { day_of_week: number; start_time: string; end_time: string }) => ({
        host_id: host.id,
        day_of_week: a.day_of_week,
        start_time: a.start_time,
        end_time: a.end_time,
      }))
    )
  }

  await admin.from("host_blocked_dates").delete().eq("host_id", host.id)
  if (body.blocked?.length > 0) {
    await admin.from("host_blocked_dates").insert(
      body.blocked.map((d: string) => ({ host_id: host.id, blocked_date: d }))
    )
  }

  return Response.json({ ok: true })
}
