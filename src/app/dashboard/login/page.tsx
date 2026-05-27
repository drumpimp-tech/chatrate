"use client"

import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("drumpimp@gmail.com")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (res.ok) setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <div className="max-w-sm w-full fade-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-1">
            Chat<span className="text-purple-500">Rate</span>
          </h1>
          <p className="text-gray-500 text-sm">Host Dashboard</p>
        </div>

        {!sent ? (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">Sign in</h2>
            <p className="text-gray-400 text-sm">
              We'll send a magic link to your email.
            </p>
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600"
                placeholder="you@example.com"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={loading || !email}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-all"
            >
              {loading ? "Sending..." : "Send Magic Link →"}
            </button>
          </div>
        ) : (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">📬</div>
            <h2 className="text-xl font-bold mb-2">Check your inbox</h2>
            <p className="text-gray-400 text-sm">
              We sent a magic link to <strong>{email}</strong>. Click it to
              access your dashboard.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
