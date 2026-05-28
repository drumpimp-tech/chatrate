import { createAdminClient, createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get("avatar") as File | null
    if (!file) return Response.json({ error: "No file provided" }, { status: 400 })

    // Validate type and size (5 MB max)
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if (!allowed.includes(file.type)) {
      return Response.json({ error: "Invalid file type. Use JPEG, PNG, WebP, or GIF." }, { status: 400 })
    }
    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ error: "File too large. Max 5 MB." }, { status: 400 })
    }

    const ext = file.name.split(".").pop() || "jpg"
    const path = `${user.id}/avatar.${ext}`

    const admin = await createAdminClient()
    const bytes = await file.arrayBuffer()

    const { error: uploadError } = await admin.storage
      .from("avatars")
      .upload(path, bytes, {
        contentType: file.type,
        upsert: true, // overwrite existing
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = admin.storage
      .from("avatars")
      .getPublicUrl(path)

    // Bust cache by appending timestamp
    const avatarUrl = `${publicUrl}?t=${Date.now()}`

    // Save to host record
    await admin
      .from("hosts")
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)

    return Response.json({ url: avatarUrl })
  } catch (e: unknown) {
    console.error(e)
    const msg = e instanceof Error ? e.message : "Upload failed"
    return Response.json({ error: msg }, { status: 500 })
  }
}
