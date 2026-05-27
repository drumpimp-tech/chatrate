"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Logo } from "@/components/Logo"

function SuccessContent() {
  const params = useSearchParams()
  const username = params.get("username")
  const [activated, setActivated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!username) return
    // Activate the host account
    fetch("/api/stripe/checkout", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    })
      .then((r) => r.json())
      .then((d) => {
        setActivated(d.ok)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [username])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-gray-500 animate-pulse">Activating your account...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center fade-up">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold mb-3">You&apos;re live!</h1>
        <p className="text-gray-400 mb-8 leading-relaxed">
          Your ChatRate page is active. Share your link and start getting paid.
        </p>
        <div className="bg-purple-900/20 border border-purple-500/30 rounded-2xl p-5 mb-8">
          <p className="text-sm text-gray-500 mb-2">Your booking link</p>
          <p className="text-purple-400 font-bold text-lg break-all">
            chatrate-app.netlify.app/book/{username}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Link
            href={`/book/${username}`}
            target="_blank"
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 rounded-xl transition-all"
          >
            Preview your page →
          </Link>
          <Link
            href="/dashboard"
            className="w-full border border-white/10 text-gray-300 py-3.5 rounded-xl hover:bg-white/5 transition-colors"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return <Suspense><SuccessContent /></Suspense>
}
