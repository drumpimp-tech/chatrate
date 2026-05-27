"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { SERVICE_TYPES, formatCurrency } from "@/lib/utils"
import { Logo } from "@/components/Logo"

type Host = {
  id: string
  username: string
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
  const { username } = useParams<{ username: string }>()
  const router = useRouter()
  const [host, setHost] = useState<Host | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<Step>(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    clientName: "", clientEmail: "", serviceType: "",
    scheduledAt: "", transcriptOptedIn: false,
    cardNumber: "", cardExpiry: "", cardCvc: "", cardName: "",
  })

  useEffect(() => {
    fetch(`/api/hosts/${username}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.username) {
          setHost(data)
          setForm((f) => ({ ...f, serviceType: data.service_type }))
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [username])

  const priceLabel = host
    ? host.rate_type === "flat"
      ? `${formatCurrency(host.rate)} flat`
      : `${formatCurrency(host.rate)}/min`
    : ""

  const handleSubmit = async () => {
    setSubmitting(true)
    setError("")
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostId: host?.id,
          hostUsername: username,
          clientName: form.clientName,
          clientEmail: form.clientEmail,
          serviceType: form.serviceType,
          scheduledAt: form.scheduledAt,
          transcriptOptedIn: form.transcriptOptedIn,
          cardNumber: form.cardNumber,
          cardExpiry: form.cardExpiry,
          cardCvc: form.cardCvc,
          cardName: form.cardName,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Booking failed")
      router.push(`/book/${username}/confirm?bookingId=${data.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loading />

  if (!host) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-center px-4">
        <div>
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold mb-2">Expert not found</h1>
          <p className="text-gray-400">This ChatRate page doesn&apos;t exist (yet).</p>
          <a href="/" className="mt-4 inline-block text-purple-400 hover:text-purple-300 text-sm">Create your own →</a>
        </div>
      </div>
    )
  }

  if (!host.is_available) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-center px-4">
        <div>
          <div className="text-5xl mb-4">😴</div>
          <h1 className="text-2xl font-bold mb-2">{host.display_name} isn&apos;t available</h1>
          <p className="text-gray-400">Not accepting bookings right now. Check back soon.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between max-w-2xl mx-auto">
        <Logo />
        <span className="text-sm text-gray-500">Secure booking</span>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Host card */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 mb-8 flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-purple-600 flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {host.display_name[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold">{host.display_name}</h1>
              <span className="bg-purple-500/10 text-purple-400 text-xs px-2 py-0.5 rounded-full border border-purple-500/20">
                {host.service_type}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-1 leading-relaxed">{host.bio}</p>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span className="text-purple-400 font-semibold text-base">{priceLabel}</span>
              {host.transcript_fee > 0 && (
                <span className="text-gray-500">+ {formatCurrency(host.transcript_fee)} transcript</span>
              )}
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-3 mb-8">
          {([1, 2, 3] as Step[]).map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step === s ? "bg-purple-600 text-white" : step > s ? "bg-green-600 text-white" : "bg-white/10 text-gray-400"
              }`}>
                {step > s ? "✓" : s}
              </div>
              {s < 3 && <div className={`h-px flex-1 w-10 ${step > s ? "bg-green-600" : "bg-white/10"}`} />}
            </div>
          ))}
          <div className="ml-2 text-sm text-gray-400">
            {step === 1 ? "Your details" : step === 2 ? "Schedule" : "Payment"}
          </div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-5 fade-up">
            <h2 className="text-xl font-bold">Tell us about you</h2>
            <Field label="Your name" value={form.clientName} onChange={(v) => setForm((f) => ({ ...f, clientName: v }))} placeholder="Jane Smith" />
            <Field label="Email address" type="email" value={form.clientEmail} onChange={(v) => setForm((f) => ({ ...f, clientEmail: v }))} placeholder="jane@example.com" />
            <div>
              <label className="block text-sm text-gray-400 mb-2">Service you want</label>
              <select value={form.serviceType} onChange={(e) => setForm((f) => ({ ...f, serviceType: e.target.value }))}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white appearance-none">
                {SERVICE_TYPES.map((s) => <option key={s} value={s} className="bg-[#111]">{s}</option>)}
              </select>
            </div>
            {host.transcript_fee > 0 && (
              <div className="flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                <div>
                  <p className="font-medium text-sm">Add transcript</p>
                  <p className="text-gray-500 text-xs mt-0.5">Full call transcript delivered by email</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-purple-400 text-sm font-semibold">+{formatCurrency(host.transcript_fee)}</span>
                  <button onClick={() => setForm((f) => ({ ...f, transcriptOptedIn: !f.transcriptOptedIn }))}
                    className={`w-11 h-6 rounded-full transition-colors relative ${form.transcriptOptedIn ? "bg-purple-600" : "bg-white/20"}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${form.transcriptOptedIn ? "translate-x-5" : ""}`} />
                  </button>
                </div>
              </div>
            )}
            <button onClick={() => setStep(2)} disabled={!form.clientName || !form.clientEmail}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold py-3.5 rounded-xl transition-all">
              Continue →
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-5 fade-up">
            <h2 className="text-xl font-bold">Pick a time</h2>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Preferred date & time</label>
              <input type="datetime-local" value={form.scheduledAt}
                min={new Date(Date.now() + 3600000).toISOString().slice(0, 16)}
                onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white [color-scheme:dark]" />
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 space-y-2">
              <SummaryRow label="Service" value={form.serviceType} />
              <SummaryRow label="Rate" value={priceLabel} highlight />
              {form.transcriptOptedIn && <SummaryRow label="Transcript" value={`+${formatCurrency(host.transcript_fee)}`} />}
              {form.scheduledAt && <SummaryRow label="Time" value={new Date(form.scheduledAt).toLocaleString()} />}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 border border-white/10 text-gray-300 py-3 rounded-xl hover:bg-white/5">← Back</button>
              <button onClick={() => setStep(3)} disabled={!form.scheduledAt}
                className="flex-[2] bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-all">
                Add Payment →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-5 fade-up">
            <div>
              <h2 className="text-xl font-bold mb-1">Secure payment</h2>
              <p className="text-gray-500 text-sm">Card saved — charged only after the call ends.</p>
            </div>
            <Field label="Name on card" value={form.cardName} onChange={(v) => setForm((f) => ({ ...f, cardName: v }))} placeholder="Jane Smith" />
            <div>
              <label className="block text-sm text-gray-400 mb-2">Card number</label>
              <input type="text" maxLength={19} value={form.cardNumber}
                onChange={(e) => { const v = e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim(); setForm((f) => ({ ...f, cardNumber: v })) }}
                placeholder="4242 4242 4242 4242"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 font-mono tracking-wider" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Expiry</label>
                <input type="text" maxLength={5} value={form.cardExpiry}
                  onChange={(e) => { let v = e.target.value.replace(/\D/g, ""); if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2); setForm((f) => ({ ...f, cardExpiry: v })) }}
                  placeholder="MM/YY" className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white font-mono" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">CVC</label>
                <input type="text" maxLength={4} value={form.cardCvc}
                  onChange={(e) => setForm((f) => ({ ...f, cardCvc: e.target.value.replace(/\D/g, "") }))}
                  placeholder="•••" className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white font-mono" />
              </div>
            </div>
            {error && <div className="bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>}
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 border border-white/10 text-gray-300 py-3 rounded-xl hover:bg-white/5">← Back</button>
              <button onClick={handleSubmit}
                disabled={submitting || !form.cardName || form.cardNumber.length < 19 || form.cardExpiry.length < 5 || form.cardCvc.length < 3}
                className="flex-[2] bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-all">
                {submitting ? "Booking..." : "Confirm Booking ✓"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-2">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600" />
    </div>
  )
}

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={highlight ? "text-purple-400 font-semibold" : "font-medium"}>{value}</span>
    </div>
  )
}

function Loading() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-gray-500 animate-pulse">Loading...</div>
    </div>
  )
}
