"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SERVICE_TYPES, formatCurrency } from "@/lib/utils"

type HostSettings = {
  display_name: string
  bio: string
  service_type: string
  rate_type: "flat" | "per_minute"
  rate: number
  transcript_fee: number
  is_available: boolean
}

type Step = 1 | 2 | 3

export default function BookPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<HostSettings | null>(null)
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Form state
  const [form, setForm] = useState({
    clientName: "",
    clientEmail: "",
    serviceType: "",
    scheduledAt: "",
    transcriptOptedIn: false,
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    cardName: "",
  })

  useEffect(() => {
    fetch("/api/host-settings")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.display_name !== undefined) {
          setSettings(data)
          setForm((f) => ({ ...f, serviceType: data.service_type }))
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const priceLabel = settings
    ? settings.rate_type === "flat"
      ? `${formatCurrency(settings.rate)} flat`
      : `${formatCurrency(settings.rate)}/min`
    : ""

  const handleSubmit = async () => {
    setSubmitting(true)
    setError("")
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: form.clientName,
          clientEmail: form.clientEmail,
          serviceType: form.serviceType,
          scheduledAt: form.scheduledAt,
          transcriptOptedIn: form.transcriptOptedIn,
          // Card info goes to Stripe via separate API call
          cardNumber: form.cardNumber,
          cardExpiry: form.cardExpiry,
          cardCvc: form.cardCvc,
          cardName: form.cardName,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Booking failed")
      router.push(`/book/confirm?bookingId=${data.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-gray-500 animate-pulse">Loading...</div>
      </div>
    )
  }

  if (!settings?.is_available) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">😴</div>
          <h1 className="text-2xl font-bold mb-2">Not available right now</h1>
          <p className="text-gray-400">
            {settings?.display_name || "The host"} isn't accepting bookings at
            the moment. Check back soon.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between max-w-3xl mx-auto">
        <a href="/" className="text-xl font-bold tracking-tight">
          Chat<span className="text-purple-500">Rate</span>
        </a>
        <span className="text-sm text-gray-500">Secure booking</span>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Host card */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 mb-8 flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-purple-600 flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {settings.display_name[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold">{settings.display_name}</h1>
              <span className="bg-purple-500/10 text-purple-400 text-xs px-2 py-0.5 rounded-full border border-purple-500/20">
                {settings.service_type}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-1 leading-relaxed">
              {settings.bio}
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span className="text-purple-400 font-semibold text-base">
                {priceLabel}
              </span>
              {settings.transcript_fee > 0 && (
                <span className="text-gray-500">
                  + {formatCurrency(settings.transcript_fee)} transcript
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8">
          {([1, 2, 3] as Step[]).map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step === s
                    ? "bg-purple-600 text-white"
                    : step > s
                    ? "bg-green-600 text-white"
                    : "bg-white/10 text-gray-400"
                }`}
              >
                {step > s ? "✓" : s}
              </div>
              {s < 3 && (
                <div
                  className={`h-px flex-1 w-12 transition-colors ${
                    step > s ? "bg-green-600" : "bg-white/10"
                  }`}
                />
              )}
            </div>
          ))}
          <div className="ml-2 text-sm text-gray-400">
            {step === 1
              ? "Your details"
              : step === 2
              ? "Schedule"
              : "Payment"}
          </div>
        </div>

        {/* Step 1: Details */}
        {step === 1 && (
          <div className="space-y-5 fade-up">
            <h2 className="text-xl font-bold mb-6">Tell us about you</h2>
            <Field
              label="Your name"
              value={form.clientName}
              onChange={(v) => setForm((f) => ({ ...f, clientName: v }))}
              placeholder="Jane Smith"
            />
            <Field
              label="Email address"
              type="email"
              value={form.clientEmail}
              onChange={(v) => setForm((f) => ({ ...f, clientEmail: v }))}
              placeholder="jane@example.com"
            />
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Service you want
              </label>
              <select
                value={form.serviceType}
                onChange={(e) =>
                  setForm((f) => ({ ...f, serviceType: e.target.value }))
                }
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white appearance-none cursor-pointer"
              >
                {SERVICE_TYPES.map((s) => (
                  <option key={s} value={s} className="bg-[#111]">
                    {s}
                  </option>
                ))}
              </select>
            </div>
            {settings.transcript_fee > 0 && (
              <div className="flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                <div>
                  <p className="font-medium text-sm">Add transcript</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Full call transcript delivered by email after the session
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-purple-400 text-sm font-semibold">
                    +{formatCurrency(settings.transcript_fee)}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        transcriptOptedIn: !f.transcriptOptedIn,
                      }))
                    }
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      form.transcriptOptedIn ? "bg-purple-600" : "bg-white/20"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                        form.transcriptOptedIn ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
            <Button
              onClick={() => setStep(2)}
              disabled={!form.clientName || !form.clientEmail}
            >
              Continue →
            </Button>
          </div>
        )}

        {/* Step 2: Schedule */}
        {step === 2 && (
          <div className="space-y-5 fade-up">
            <h2 className="text-xl font-bold mb-6">Pick a time</h2>
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Preferred date & time
              </label>
              <input
                type="datetime-local"
                value={form.scheduledAt}
                min={new Date(Date.now() + 3600000).toISOString().slice(0, 16)}
                onChange={(e) =>
                  setForm((f) => ({ ...f, scheduledAt: e.target.value }))
                }
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white [color-scheme:dark]"
              />
              <p className="text-gray-500 text-xs mt-2">
                Minimum 1 hour from now. All times are in your local timezone.
              </p>
            </div>

            {/* Summary */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-300">
                Booking summary
              </h3>
              <Row label="Service" value={form.serviceType} />
              <Row label="Rate" value={priceLabel} highlight />
              {form.transcriptOptedIn && (
                <Row
                  label="Transcript"
                  value={`+${formatCurrency(settings.transcript_fee)}`}
                />
              )}
              {form.scheduledAt && (
                <Row
                  label="Scheduled"
                  value={new Date(form.scheduledAt).toLocaleString()}
                />
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-white/10 text-gray-300 font-medium py-3.5 rounded-xl hover:bg-white/5 transition-colors"
              >
                ← Back
              </button>
              <Button
                onClick={() => setStep(3)}
                disabled={!form.scheduledAt}
                className="flex-[2]"
              >
                Add Payment →
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div className="space-y-5 fade-up">
            <h2 className="text-xl font-bold mb-1">Secure payment</h2>
            <p className="text-gray-500 text-sm mb-6">
              Your card is saved on file. You won't be charged until after the
              call ends.
            </p>

            <Field
              label="Name on card"
              value={form.cardName}
              onChange={(v) => setForm((f) => ({ ...f, cardName: v }))}
              placeholder="Jane Smith"
            />
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Card number
              </label>
              <input
                type="text"
                maxLength={19}
                value={form.cardNumber}
                onChange={(e) => {
                  const v = e.target.value
                    .replace(/\D/g, "")
                    .replace(/(.{4})/g, "$1 ")
                    .trim()
                  setForm((f) => ({ ...f, cardNumber: v }))
                }}
                placeholder="4242 4242 4242 4242"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 font-mono tracking-wider"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Expiry
                </label>
                <input
                  type="text"
                  maxLength={5}
                  value={form.cardExpiry}
                  onChange={(e) => {
                    let v = e.target.value.replace(/\D/g, "")
                    if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2)
                    setForm((f) => ({ ...f, cardExpiry: v }))
                  }}
                  placeholder="MM/YY"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 font-mono"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">CVC</label>
                <input
                  type="text"
                  maxLength={4}
                  value={form.cardCvc}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      cardCvc: e.target.value.replace(/\D/g, ""),
                    }))
                  }
                  placeholder="•••"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 font-mono"
                />
              </div>
            </div>

            {/* Final summary */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 space-y-3">
              <Row label="Service" value={form.serviceType} />
              <Row label="Rate" value={priceLabel} highlight />
              {form.transcriptOptedIn && (
                <Row
                  label="Transcript add-on"
                  value={`+${formatCurrency(settings.transcript_fee)}`}
                />
              )}
              <Row
                label="Scheduled"
                value={new Date(form.scheduledAt).toLocaleString()}
              />
              <div className="border-t border-white/5 pt-3 mt-2 text-xs text-gray-500">
                Card will only be charged after the call ends. No charge occurs
                now.
              </div>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border border-white/10 text-gray-300 font-medium py-3.5 rounded-xl hover:bg-white/5 transition-colors"
              >
                ← Back
              </button>
              <Button
                onClick={handleSubmit}
                disabled={
                  submitting ||
                  !form.cardName ||
                  form.cardNumber.length < 19 ||
                  form.cardExpiry.length < 5 ||
                  form.cardCvc.length < 3
                }
                className="flex-[2]"
              >
                {submitting ? "Booking..." : "Confirm Booking ✓"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600"
      />
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

function Button({
  children,
  onClick,
  disabled,
  className = "",
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] ${className}`}
    >
      {children}
    </button>
  )
}
