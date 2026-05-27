"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/Logo"

export default function SignupPage() {
  const router = useRouter()
  const [mode, setMode] = useState<"signup" | "login">("signup")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  const supabase = createClient()

  const handleSubmit = async () => {
    setLoading(true)
    setError("")
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSent(true)
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push("/dashboard")
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center fade-up">
          <div className="text-5xl mb-4">📬</div>
          <h2 className="text-2xl font-bold mb-3">Check your email</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            We sent a confirmation link to <strong>{email}</strong>.
            Click it to verify your account, then come back here to sign in.
          </p>
          <button
            onClick={() => { setSent(false); setMode("login") }}
            className="mt-6 text-purple-400 text-sm hover:text-purple-300 transition-colors"
          >
            Back to sign in →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <div className="max-w-sm w-full fade-up">
        <div className="text-center mb-8">
          <Logo size={44} />
          <p className="text-gray-500 text-sm mt-1">
            {mode === "signup" ? "Create your expert page" : "Welcome back"}
          </p>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
          {/* Mode toggle */}
          <div className="flex bg-white/[0.04] rounded-xl p-1">
            {(["signup", "login"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError("") }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mode === m ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                {m === "signup" ? "Sign up" : "Log in"}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !email || !password}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold py-3.5 rounded-xl transition-all"
          >
            {loading ? "..." : mode === "signup" ? "Create account →" : "Sign in →"}
          </button>
        </div>

        {mode === "signup" && (
          <p className="text-center text-gray-600 text-xs mt-4">
            By signing up you agree to our terms. $4.99 activation required after onboarding.
          </p>
        )}
      </div>
    </div>
  )
}
