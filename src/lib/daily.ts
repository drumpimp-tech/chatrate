const DAILY_API_URL = "https://api.daily.co/v1"

export async function createDailyRoom(bookingId: string, maxParticipants = 2): Promise<{
  url: string
  name: string
}> {
  const roomName = `chatrate-${bookingId}`

  const response = await fetch(`${DAILY_API_URL}/rooms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
    },
    body: JSON.stringify({
      name: roomName,
      properties: {
        enable_transcription: "deepgram",
        enable_chat: false,
        enable_prejoin_ui: false,
        start_video_off: false,
        start_audio_off: false,
        // +1 to include the host alongside all paying participants
        max_participants: maxParticipants + 1,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
      },
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Daily API error: ${err}`)
  }

  const room = await response.json()
  return { url: room.url, name: room.name }
}

export async function deleteDailyRoom(roomName: string): Promise<void> {
  await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
    },
  })
}

export async function getDailyRoomTranscript(roomName: string): Promise<string | null> {
  const response = await fetch(
    `${DAILY_API_URL}/transcript?room_name=${roomName}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
      },
    }
  )

  if (!response.ok) return null

  const data = await response.json()
  if (!data.data || data.data.length === 0) return null

  // Combine all transcript segments
  return data.data
    .map((seg: { text: string }) => seg.text)
    .join("\n")
}

export async function createDailyMeetingToken(
  roomName: string,
  isOwner: boolean
): Promise<string> {
  const response = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
    },
    body: JSON.stringify({
      properties: {
        room_name: roomName,
        is_owner: isOwner,
        enable_recording: "cloud",
      },
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to create Daily meeting token")
  }

  const data = await response.json()
  return data.token
}
