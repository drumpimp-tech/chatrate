import { NextResponse } from "next/server"
import { createDailyMeetingToken } from "@/lib/daily"

export async function POST(req: Request) {
  try {
    const { roomName, isOwner } = await req.json()
    const token = await createDailyMeetingToken(roomName, isOwner ?? false)
    return NextResponse.json({ token })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to create token" }, { status: 500 })
  }
}
