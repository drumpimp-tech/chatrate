"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { formatCurrency, formatDuration } from "@/lib/utils"
import { Suspense } from "react"
import Image from "next/image"

type BookingData = {
  id: string
  client_name: string
  service_type: string
  pricing_model: "flat" | "per_minute"
  rate: number
  transcript_opted_in: boolean
  transcript_fee: number
  daily_room_url: string
  daily_room_name: string
  status: string
  started_at: string | null
}

type CallState = "waiting" | "connected" | "ended"

function CallRoomContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const bookingId = params.roomId as string
  const isHost = searchParams.get("host") === "true"

  const [booking, setBooking] = useState<BookingData | null>(null)
  const [callState, setCallState] = useState<CallState>("waiting")
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [loading, setLoading] = useState(true)
  const [ending, setEnding] = useState(false)
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)

  const callFrameRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dailyRef = useRef<any>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startedAtRef = useRef<string | null>(null)

  // Load booking data
  useEffect(() => {
    fetch(`/api/bookings/${bookingId}`)
      .then((r) => r.json())
      .then((data) => {
        setBooking(data)
        if (data.started_at) {
          startedAtRef.current = data.started_at
          const elapsed = Math.round(
            (Date.now() - new Date(data.started_at).getTime()) / 1000
          )
          setElapsedSeconds(elapsed)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [bookingId])

  // Init Daily.co
  useEffect(() => {
    if (!booking || loading || !callFrameRef.current) return

    let frame: typeof dailyRef.current

    const initDaily = async () => {
      // Load Daily.co SDK
      const DailyIframe = (await import("@daily-co/daily-js")).default

      // Get meeting token
      const tokenRes = await fetch("/api/daily/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: booking.daily_room_name,
          isOwner: isHost,
        }),
      })
      const { token } = await tokenRes.json()

      frame = DailyIframe.createFrame(callFrameRef.current!, {
        showLeaveButton: false,
        showFullscreenButton: true,
        iframeStyle: {
          width: "100%",
          height: "100%",
          border: "none",
          borderRadius: "12px",
        },
      })

      dailyRef.current = frame

      frame.on("joined-meeting", async () => {
        setCallState("connected")
        const now = new Date().toISOString()
        startedAtRef.current = now
        // Mark booking as in_progress
        await fetch(`/api/bookings/${bookingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "in_progress", started_at: now }),
        })
        // Start timer
        timerRef.current = setInterval(() => {
          setElapsedSeconds((s) => s + 1)
        }, 1000)
      })

      frame.on("left-meeting", () => {
        setCallState("ended")
        if (timerRef.current) clearInterval(timerRef.current)
      })

      await frame.join({
        url: booking.daily_room_url,
        token,
        startVideoOff: false,
        startAudioOff: false,
      })
    }

    initDaily().catch(console.error)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (frame) frame.destroy()
    }
  }, [booking, loading, bookingId, isHost])

  const endCall = useCallback(async () => {
    if (!booking || ending) return
    setEnding(true)

    // Leave Daily room
    if (dailyRef.current) {
      await dailyRef.current.leave()
    }

    const endedAt = new Date().toISOString()
    // Use started_at from event, DB, or fall back to now (gives 0 duration rather than epoch)
    const startedAt = startedAtRef.current || booking.started_at || endedAt

    // Mark as completed + trigger charge
    await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "completed",
        ended_at: endedAt,
        started_at: startedAt,
      }),
    })

    setCallState("ended")
    setEnding(false)
  }, [booking, bookingId, ending])

  const toggleMic = () => {
    if (!dailyRef.current) return
    if (micOn) {
      dailyRef.current.setLocalAudio(false)
    } else {
      dailyRef.current.setLocalAudio(true)
    }
    setMicOn((m) => !m)
  }

  const toggleCam = () => {
    if (!dailyRef.current) return
    if (camOn) {
      dailyRef.current.setLocalVideo(false)
    } else {
      dailyRef.current.setLocalVideo(true)
    }
    setCamOn((c) => !c)
  }

  // Calculate running cost
  const runningCost = (() => {
    if (!booking) return 0
    if (booking.pricing_model === "flat") return booking.rate
    const minutes = Math.ceil(elapsedSeconds / 60) || 0
    return booking.rate * minutes
  })()

  const totalWithTranscript =
    runningCost + (booking?.transcript_opted_in ? (booking.transcript_fee ?? 0) : 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-gray-500 animate-pulse">Connecting...</div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg">Booking not found</p>
          <a href="/" className="text-gray-500 text-sm mt-2 block hover:text-white">
            Return home
          </a>
        </div>
      </div>
    )
  }

  if (callState === "ended") {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center fade-up">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-3xl font-bold mb-3">Call Complete</h1>
          <p className="text-gray-400 mb-8">
            Duration: {formatDuration(elapsedSeconds)} •{" "}
            {booking.pricing_model === "flat" ? "Flat rate" : `${Math.ceil(elapsedSeconds / 60)} min`}
          </p>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 mb-8 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Session cost</span>
              <span className="font-bold text-lg text-purple-400">
                {formatCurrency(runningCost)}
              </span>
            </div>
            {booking.transcript_opted_in && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Transcript add-on</span>
                <span className="font-medium">
                  +{formatCurrency(booking.transcript_fee)}
                </span>
              </div>
            )}
            <div className="border-t border-white/5 pt-3 flex justify-between font-bold">
              <span>Total charged</span>
              <span className="text-purple-400">
                {formatCurrency(totalWithTranscript)}
              </span>
            </div>
          </div>
          <p className="text-gray-500 text-sm">
            A receipt has been sent to {booking.client_name}&apos;s email.
            {booking.transcript_opted_in && " Transcript included."}
          </p>
          {isHost && (
            <a
              href="/dashboard"
              className="mt-6 inline-block bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 py-3 rounded-xl transition-colors"
            >
              Back to Dashboard
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col">
      {/* Top bar */}
      <div className="border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Image src="/icon.png" alt="ChatRate" width={28} height={28} className="rounded-lg" />
            <span className="text-lg font-bold">Chat<span className="text-purple-500">Rate</span></span>
          </div>
          {callState === "connected" && (
            <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 rounded-full px-3 py-1">
              <span className="w-2 h-2 rounded-full bg-red-500 pulse-dot" />
              <span className="text-red-400 text-xs font-medium">LIVE</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Timer */}
          {callState === "connected" && (
            <div className="text-center">
              <div className="font-mono text-xl font-bold text-white">
                {formatDuration(elapsedSeconds)}
              </div>
              <div className="text-xs text-gray-500">elapsed</div>
            </div>
          )}

          {/* Running cost */}
          {callState === "connected" && booking.pricing_model === "per_minute" && (
            <div className="text-center">
              <div className="font-mono text-xl font-bold cost-flash">
                {formatCurrency(runningCost)}
              </div>
              <div className="text-xs text-gray-500">running total</div>
            </div>
          )}
        </div>

        {/* Service badge */}
        <div className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-1.5 text-sm">
          {booking.service_type}
        </div>
      </div>

      {/* Video area */}
      <div className="flex-1 p-4 flex gap-4">
        <div className="flex-1 bg-black rounded-2xl overflow-hidden relative min-h-[400px]">
          <div ref={callFrameRef} className="w-full h-full" />

          {/* Waiting overlay */}
          {callState === "waiting" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-center">
                <div className="text-4xl mb-4 animate-bounce">📞</div>
                <p className="text-lg font-semibold">Connecting to call...</p>
                <p className="text-gray-500 text-sm mt-2">
                  {booking.client_name} • {booking.service_type}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="w-64 space-y-4 hidden lg:block">
          {/* Session info */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Session
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Client</span>
                <span className="font-medium">{booking.client_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Service</span>
                <span className="font-medium text-xs text-right">
                  {booking.service_type}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Rate</span>
                <span className="font-medium text-purple-400">
                  {booking.pricing_model === "flat"
                    ? `${formatCurrency(booking.rate)} flat`
                    : `${formatCurrency(booking.rate)}/min`}
                </span>
              </div>
              {booking.transcript_opted_in && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Transcript</span>
                  <span className="text-green-400 text-xs">Opted in ✓</span>
                </div>
              )}
            </div>
          </div>

          {/* Live cost tracker */}
          {callState === "connected" && (
            <div className="bg-purple-900/20 border border-purple-500/20 rounded-2xl p-4">
              <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">
                Running Total
              </h3>
              <div className="text-3xl font-bold font-mono cost-flash">
                {formatCurrency(runningCost)}
              </div>
              {booking.transcript_opted_in && (
                <div className="text-xs text-gray-500 mt-1">
                  +{formatCurrency(booking.transcript_fee)} transcript
                </div>
              )}
              <div className="text-xs text-gray-600 mt-3 leading-relaxed">
                Charged to card on file after call ends.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="border-t border-white/5 px-6 py-4 flex items-center justify-center gap-4">
        <ControlBtn
          onClick={toggleMic}
          active={micOn}
          icon={micOn ? "🎙️" : "🔇"}
          label={micOn ? "Mute" : "Unmute"}
        />
        <ControlBtn
          onClick={toggleCam}
          active={camOn}
          icon={camOn ? "📹" : "📷"}
          label={camOn ? "Cam off" : "Cam on"}
        />

        {isHost && (
          <button
            onClick={endCall}
            disabled={ending}
            className="bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
          >
            {ending ? (
              "Processing..."
            ) : (
              <>
                <span>⏹</span> End Call & Charge
              </>
            )}
          </button>
        )}

        {!isHost && callState === "connected" && (
          <div className="text-gray-500 text-sm">
            Waiting for host to end the session
          </div>
        )}
      </div>
    </div>
  )
}

function ControlBtn({
  onClick,
  active,
  icon,
  label,
}: {
  onClick: () => void
  active: boolean
  icon: string
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
        active
          ? "bg-white/10 hover:bg-white/15"
          : "bg-red-900/30 hover:bg-red-900/50"
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-xs text-gray-400">{label}</span>
    </button>
  )
}

export default function CallRoomPage() {
  return (
    <Suspense>
      <CallRoomContent />
    </Suspense>
  )
}
