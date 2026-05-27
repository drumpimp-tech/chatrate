import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from("host_settings")
      .select("*")
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: "Failed to fetch host settings" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const supabase = await createAdminClient()

    const { data: existing } = await supabase
      .from("host_settings")
      .select("id")
      .single()

    const { data, error } = await supabase
      .from("host_settings")
      .update(body)
      .eq("id", existing?.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: "Failed to update host settings" },
      { status: 500 }
    )
  }
}
