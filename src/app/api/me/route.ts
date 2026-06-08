import { createAdminClient, createClient } from "@/lib/supabase/server"

// GET /api/me — return current user's host record
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const admin = await createAdminClient()
    const { data, error } = await admin
      .from("hosts")
      .select(
        "id, username, display_name, bio, service_type, rate_type, rate, transcript_fee, is_available, is_activated, stripe_publishable_key, avatar_url, timezone"
      )
      .eq("user_id", user.id)
      .single()

    if (error) return Response.json(null)
    return Response.json(data)
  } catch (e) {
    console.error(e)
    return Response.json({ error: "Server error" }, { status: 500 })
  }
}

// POST /api/me — create or upsert host record (onboarding)
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const {
      username,
      display_name,
      bio,
      service_type,
      rate_type,
      rate,
      transcript_fee,
      stripe_publishable_key,
      stripe_secret_key,
    } = body

    if (!username || !display_name) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const admin = await createAdminClient()

    // Check username uniqueness (excluding this user)
    const { data: existing } = await admin
      .from("hosts")
      .select("id, user_id")
      .eq("username", username)
      .single()

    if (existing && existing.user_id !== user.id) {
      return Response.json({ error: "Username already taken" }, { status: 409 })
    }

    const { data, error } = await admin
      .from("hosts")
      .upsert(
        {
          user_id: user.id,
          username,
          display_name,
          bio: bio || "",
          service_type: service_type || "Business Consultation",
          rate_type: rate_type || "per_minute",
          rate: parseFloat(rate) || 1.0,
          transcript_fee: parseFloat(transcript_fee) || 0,
          stripe_publishable_key: stripe_publishable_key || null,
          stripe_secret_key: stripe_secret_key || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select()
      .single()

    if (error) throw error
    return Response.json(data)
  } catch (e: unknown) {
    console.error(e)
    const msg = e instanceof Error ? e.message : "Failed to save profile"
    return Response.json({ error: msg }, { status: 500 })
  }
}

// PATCH /api/me — update host settings
export async function PATCH(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const admin = await createAdminClient()

    const { data, error } = await admin
      .from("hosts")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .select(
        "id, username, display_name, bio, service_type, rate_type, rate, transcript_fee, is_available, is_activated, stripe_publishable_key, avatar_url, timezone"
      )
      .single()

    if (error) throw error
    return Response.json(data)
  } catch (e: unknown) {
    console.error(e)
    const msg = e instanceof Error ? e.message : "Update failed"
    return Response.json({ error: msg }, { status: 500 })
  }
}
