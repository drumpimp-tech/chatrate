"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SERVICE_TYPES, formatCurrency } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { Logo } from "@/components/Logo"

type Step = 1 | 2 | 3 | 4

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState<Step>(1)
  const [checking, setChecking] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    username: "",
    displayName: "",
    bio: "",
    serviceType: "Business Consultation",
    rateType: "per_minute" as "flat" | "per_minute",
    rate: "1.00",
    transcriptFee: "10.00",
    stripePublishableKey: "",
    stripeSecretKey: "",
  })

  // Check username availability
  useEffect(() => {
    if (!form.username || form.username.length < 3) {
      setUsernameAvailable(null)
      return
    }
    const timer = setTimeout(async () => {
      setChecking(true)
      const res = await fetch(`/api/hosts/${form.username}`)
      setUsernameAvailable(res.status === 404)
      setChecking(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [form.username])

  const handleActivate = async () => {
    setSubmitting(true)
    setError("")
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not logged in")

      // Save host record
      const res = await fetch("/api/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          display_name: form.displayName,
          bio: form.bio,
          service_type: form.serviceType,
          rate_type: form.rateType,
          rate: parseFloat(form.rate),
          transcript_fee: parseFloat(form.transcriptFee),
          stripe_publishable_key: form.stripePublishableKey,
          stripe_secret_key: form.stripeSecretKey,
        }),
      })

      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Failed to save profile")
      }

      // Redirect to Stripe checkout for $4.99
      const checkoutRes = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.username }),
      })
      const { url } = await checkoutRes.json()
      if (url) window.location.href = url
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
      setSubmitting(false)
    }
  }

  const slugify = (v: string) =>
    v.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")

  return (
    <div className="min-h-screen bg-[#050505]">
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between max-w-2xl mx-auto">
        <Logo />
        <span className="text-sm text-gray-500">Step {step} of 4</span>
      </nav>

      <div className="max-w-xl mx-auto px-4 py-10">
        {/* Progress bar */}
        <div className="flex gap-1 mb-10">
          {([1, 2, 3, 4] as Step[]).map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-purple-600" : "bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Username */}
        {step === 1 && (
          <div className="fade-up space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-1">Choose your username</h1>
              <p className="text-gray-500 text-sm">
                This becomes your public booking link.
              </p>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Username</label>
              <div className="flex items-center bg-white/[0.04] border border-white/10 rounded-xl overflow-hidden focus-within:border-purple-500">
                <span className="px-4 text-gray-500 text-sm border-r border-white/10 py-3">
                  chatrate-app.netlify.app/book/
                </span>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, username: slugify(e.target.value) }))
                  }
                  placeholder="yourname"
                  className="flex-1 bg-transparent px-3 py-3 text-white placeholder-gray-600 outline-none"
                />
              </div>
              {form.username.length >= 3 && (
                <p className={`text-xs mt-2 ${
                  checking ? "text-gray-500" :
                  usernameAvailable ? "text-green-400" : "text-red-400"
                }`}>
                  {checking ? "Checking..." :
                   usernameAvailable ? "✓ Available!" : "✗ Already taken"}
                </p>
              )}
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!usernameAvailable}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold py-3.5 rounded-xl transition-all"
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 2: Profile & Service */}
        {step === 2 && (
          <div className="fade-up space-y-5">
            <div>
              <h1 className="text-2xl font-bold mb-1">Your profile</h1>
              <p className="text-gray-500 text-sm">This shows on your public booking page.</p>
            </div>
            <Field
              label="Display name"
              value={form.displayName}
              onChange={(v) => setForm((f) => ({ ...f, displayName: v }))}
              placeholder="Jane Smith"
            />
            <div>
              <label className="block text-sm text-gray-400 mb-2">Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                rows={3}
                placeholder="Tell clients what you offer and why they should book you..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Primary service</label>
              <select
                value={form.serviceType}
                onChange={(e) => setForm((f) => ({ ...f, serviceType: e.target.value }))}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white appearance-none"
              >
                {SERVICE_TYPES.map((s) => (
                  <option key={s} value={s} className="bg-[#111]">{s}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 border border-white/10 text-gray-300 py-3 rounded-xl hover:bg-white/5 transition-colors">
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!form.displayName || !form.bio}
                className="flex-[2] bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-all"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Rates */}
        {step === 3 && (
          <div className="fade-up space-y-5">
            <div>
              <h1 className="text-2xl font-bold mb-1">Set your rates</h1>
              <p className="text-gray-500 text-sm">You can change these any time from your dashboard.</p>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-3">Pricing model</label>
              <div className="grid grid-cols-2 gap-3">
                {(["per_minute", "flat"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setForm((f) => ({ ...f, rateType: type }))}
                    className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                      form.rateType === type
                        ? "bg-purple-600/20 border-purple-500/50 text-purple-400"
                        : "bg-white/[0.03] border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    {type === "per_minute" ? "⏱ Per Minute" : "📋 Flat Rate"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                {form.rateType === "per_minute" ? "Rate per minute (USD)" : "Flat rate per call (USD)"}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number" min="0.50" step="0.50"
                  value={form.rate}
                  onChange={(e) => setForm((f) => ({ ...f, rate: e.target.value }))}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white"
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {form.rateType === "per_minute"
                  ? `A 30-min call = ${formatCurrency(parseFloat(form.rate || "0") * 30)}`
                  : `Client pays ${formatCurrency(parseFloat(form.rate || "0"))} regardless of duration`}
              </p>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Transcript add-on (USD, 0 to disable)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number" min="0" step="1"
                  value={form.transcriptFee}
                  onChange={(e) => setForm((f) => ({ ...f, transcriptFee: e.target.value }))}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 border border-white/10 text-gray-300 py-3 rounded-xl hover:bg-white/5 transition-colors">← Back</button>
              <button
                onClick={() => setStep(4)}
                className="flex-[2] bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-all"
              >Continue →</button>
            </div>
          </div>
        )}

        {/* Step 4: Stripe + Pay */}
        {step === 4 && (
          <div className="fade-up space-y-5">
            <div>
              <h1 className="text-2xl font-bold mb-1">Connect your Stripe</h1>
              <p className="text-gray-500 text-sm">
                Call payments go directly to your Stripe account. We never touch your money.
              </p>
            </div>
            <div className="bg-blue-900/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300">
              💡 Get these from{" "}
              <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="underline">
                dashboard.stripe.com/apikeys
              </a>
            </div>
            <Field
              label="Publishable key (pk_live_... or pk_test_...)"
              value={form.stripePublishableKey}
              onChange={(v) => setForm((f) => ({ ...f, stripePublishableKey: v }))}
              placeholder="pk_live_..."
            />
            <Field
              label="Secret key (sk_live_... or sk_test_...)"
              value={form.stripeSecretKey}
              onChange={(v) => setForm((f) => ({ ...f, stripeSecretKey: v }))}
              placeholder="sk_live_..."
            />

            {/* Summary */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 space-y-2">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Your page preview</h3>
              <Row label="URL" value={`/book/${form.username}`} />
              <Row label="Name" value={form.displayName} />
              <Row label="Service" value={form.serviceType} />
              <Row label="Rate" value={form.rateType === "per_minute" ? `$${form.rate}/min` : `$${form.rate} flat`} highlight />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="flex-1 border border-white/10 text-gray-300 py-3 rounded-xl hover:bg-white/5 transition-colors">← Back</button>
              <button
                onClick={handleActivate}
                disabled={submitting || !form.stripePublishableKey || !form.stripeSecretKey}
                className="flex-[2] bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-all"
              >
                {submitting ? "Redirecting..." : "Activate for $4.99 →"}
              </button>
            </div>
            <p className="text-center text-gray-600 text-xs">
              One-time payment. No monthly fees. Ever.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-2">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600" />
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={highlight ? "text-purple-400 font-semibold" : "font-medium"}>{value}</span>
    </div>
  )
}
