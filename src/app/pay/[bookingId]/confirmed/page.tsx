"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Logo } from "@/components/Logo"

function ConfirmedContent() {
  const searchParams = useSearchParams()
  const roomUrl = searchParams.get("room")

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md w-full space-y-6 fade-up">
        <Logo size={52} href="/" />

        <div className="space-y-3 py-6">
          <div className="text-6xl">🎉</div>
          <h1 className="text-3xl font-bold">You&apos;re confirmed!</h1>
          <p className="text-gray-400 leading-relaxed">
            Your card has been saved. You&apos;ll be charged at the end of the call — no surprise fees.
          </p>
        </div>

        {/* Join call button — shown directly when room URL is available */}
        {roomUrl && (
          <a
            href={roomUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl transition-all text-lg"
          >
            Join Call Room →
          </a>
        )}

        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-3 text-left">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">What happens next</h3>
          <div className="space-y-3">
            {[
              { icon: "📧", text: "A confirmation email with the call link has been sent to you" },
              { icon: "📅", text: roomUrl ? "Use the button above or the email link to join at the scheduled time" : "Join the call at the scheduled time using the link in your email" },
              { icon: "💳", text: "Your card is charged automatically when the call ends" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex gap-3 text-sm text-gray-400">
                <span className="flex-shrink-0">{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-gray-600 text-xs">
          Didn&apos;t get the email? Check your spam folder or contact the host directly.
        </p>
      </div>
    </div>
  )
}

export default function ConfirmedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] flex items-center justify-center"><div className="text-gray-500 animate-pulse">Loading...</div></div>}>
      <ConfirmedContent />
    </Suspense>
  )
}
