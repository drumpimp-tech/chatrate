"use client"

import { useEffect, useState, Suspense } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"

type Booking = {
  id: string
  client_name: string
  service_type: string
  scheduled_at: string
  pricing_model: "flat" | "per_minute"
  rate: number
  transcript_opted_in: boolean
  transcript_fee: number
  daily_room_url: string
  status: string
}

function ConfirmContent() {
  const { username } = useParams<{ username: string }>()
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId")
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!bookingId) return setLoading(false)
    fetch(`/api/bookings/${bookingId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.id) setBooking(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [bookingId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-gray-500 animate-pulse">Loading...</div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 text-center">
        <div>
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-2">Booking not found</h1>
          <Link href={`/book/${username}`} className="text-purple-400 hover:text-purple-300 text-sm">
            ← Back to booking page
          </Link>
        </div>
      </div>
    )
  }

  const totalEstimate =
    booking.pricing_model === "flat"
      ? booking.rate + (booking.transcript_opted_in ? booking.transcript_fee : 0)
      : null

  return (
    <div className="min-h-screen bg-[#050505]">
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between max-w-2xl mx-auto">
        <a href="/" className="text-xl font-bold">
          Chat<span className="text-purple-500">Rate</span>
        </a>
      </nav>

      <div className="max-w-md mx-auto px-4 py-12 text-center fade-up">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold mb-2">You&apos;re booked!</h1>
        <p className="text-gray-400 mb-8 leading-relaxed">
          A confirmation has been sent to your email. You&apos;ll receive a call link before your session.
        </p>

        {/* Booking summary */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 mb-8 text-left space-y-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Booking Summary
          </h2>
          <Row label="Name" value={booking.client_name} />
          <Row label="Service" value={booking.service_type} />
          <Row
            label="Scheduled"
            value={format(new Date(booking.scheduled_at), "MMMM d, yyyy 'at' h:mm a")}
          />
          <Row
            label="Rate"
            value={
              booking.pricing_model === "flat"
                ? `${formatCurrency(booking.rate)} flat`
                : `${formatCurrency(booking.rate)}/min`
            }
            highlight
          />
          {booking.transcript_opted_in && (
            <Row
              label="Transcript"
              value={`+${formatCurrency(booking.transcript_fee)}`}
            />
          )}
          {totalEstimate !== null && (
            <>
              <div className="border-t border-white/10 pt-3 mt-3" />
              <Row
                label="Total charge"
                value={formatCurrency(totalEstimate)}
                highlight
              />
            </>
          )}
          {booking.pricing_model === "per_minute" && (
            <p className="text-gray-600 text-xs pt-1">
              * Your card will be charged after the call based on actual minutes used.
            </p>
          )}
        </div>

        <div className="bg-blue-900/10 border border-blue-500/20 rounded-2xl p-4 mb-8 text-sm text-blue-300">
          <p className="font-medium mb-1">💳 Card saved — not charged yet</p>
          <p className="text-blue-400/70">
            Your card will only be charged after the call ends.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {booking.daily_room_url && (
            <a
              href={booking.daily_room_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 rounded-xl transition-all"
            >
              Join Call →
            </a>
          )}
          <Link
            href={`/book/${username}`}
            className="w-full border border-white/10 text-gray-300 py-3.5 rounded-xl hover:bg-white/5 transition-colors"
          >
            ← Back to booking page
          </Link>
        </div>
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={highlight ? "text-purple-400 font-semibold" : "font-medium"}>
        {value}
      </span>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense>
      <ConfirmContent />
    </Suspense>
  )
}
