"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"

function ConfirmContent() {
  const params = useSearchParams()
  const bookingId = params.get("bookingId")

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center fade-up">
        <div className="w-20 h-20 rounded-full bg-green-600/20 border-2 border-green-500/40 flex items-center justify-center text-4xl mx-auto mb-6">
          ✓
        </div>
        <h1 className="text-3xl font-bold mb-3">You're booked!</h1>
        <p className="text-gray-400 mb-8 leading-relaxed">
          Your call is confirmed. Check your email for details and the call room
          link. Your card is on file and will only be charged after the session
          ends.
        </p>

        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 mb-8 text-left space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Booking ID</span>
            <span className="font-mono text-xs text-gray-300">{bookingId}</span>
          </div>
          <p className="text-xs text-gray-600">
            Save this ID in case you need to reference your booking.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/book"
            className="w-full border border-white/10 text-gray-300 font-medium py-3 rounded-xl hover:bg-white/5 transition-colors text-center"
          >
            Book another call
          </Link>
          <Link
            href="/"
            className="text-gray-600 text-sm hover:text-gray-400 transition-colors"
          >
            Return home
          </Link>
        </div>
      </div>
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
