import { createAdminClient } from "@/lib/supabase/server"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params
  try {
    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from("hosts")
      .select(
        "id, username, display_name, bio, service_type, rate_type, rate, transcript_fee, is_available, is_activated, avatar_url"
      )
      .eq("username", username)
      .single()

    if (error || !data) {
      return Response.json({ error: "Not found" }, { status: 404 })
    }

    return Response.json(data)
  } catch (e) {
    console.error(e)
    return Response.json({ error: "Server error" }, { status: 500 })
  }
}
