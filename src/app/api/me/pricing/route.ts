import { createAdminClient, createClient } from "@/lib/supabase/server"

// PATCH /api/me/pricing — update ONLY pricing fields for the current host.
// Kept separate from /api/me (which is a full upsert) so editing price from the
// dashboard can never overwrite Stripe keys, bio, availability, etc.
export async function PATCH(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()

    // Build a partial update with only the pricing fields that were provided.
    const update: { rate_type?: "flat" | "per_minute"; rate?: number; transcript_fee?: number; updated_at: string } = {
      updated_at: new Date().toISOString(),
    }
    if (body.rate_type === "flat" || body.rate_type === "per_minute") update.rate_type = body.rate_type
    if (body.rate !== undefined) {
      const r = parseFloat(body.rate)
      if (!Number.isNaN(r) && r >= 0) update.rate = r
    }
    if (body.transcript_fee !== undefined) {
      const t = parseFloat(body.transcript_fee)
      if (!Number.isNaN(t) && t >= 0) update.transcript_fee = t
    }

    const admin = await createAdminClient()
    const { data, error } = await admin
      .from("hosts")
      .update(update)
      .eq("user_id", user.id)
      .select(
        "id, username, display_name, bio, service_type, rate_type, rate, transcript_fee, is_available, is_activated, stripe_publishable_key, avatar_url"
      )
      .single()

    if (error) throw error
    return Response.json(data)
  } catch (e: unknown) {
    console.error(e)
    const msg = e instanceof Error ? e.message : "Failed to update pricing"
    return Response.json({ error: msg }, { status: 500 })
  }
}
