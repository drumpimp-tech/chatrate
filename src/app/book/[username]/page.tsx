"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { SERVICE_TYPES, formatCurrency } from "@/lib/utils"
import { Logo } from "@/components/Logo"
import { loadStripe, type Stripe as StripeType, type StripeCardElement } from "@stripe/stripe-js"
import { addDays, format, parseISO } from "date-fns"

type HostAvailDay = { day_of_week: number; start_time: string; end_time: string }

function fmt12(time24: string) {
  const [hStr, mStr] = time24.split(":")
  const h = parseInt(hStr), m = parseInt(mStr)
  const period = h < 12 ? "AM" : "PM"
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, "0")} ${period}`
}

function generateSlots(startTime: string, endTime: string) {
  const [sh, sm] = startTime.split(":").map(Number)
  const [eh, em] = endTime.split(":").map(Number)
  const slots = []
  for (let t = sh * 60 + sm; t < eh * 60 + em; t += 30) {
    const h = Math.floor(t / 60), m = t % 60
    const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
    slots.push({ value, label: fmt12(value) })
  }
  return slots
}

function hostTimeToUTC(dateStr: string, timeStr: string, hostTZ: string): string {
  const approx = new Date(`${dateStr}T${timeStr}:00`)
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: hostTZ, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  }).formatToParts(approx)
  const get = (type: string) => parseInt(parts.find((p) => p.type === type)!.value)
  const tzMs = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"))
  return new Date(approx.getTime() - (tzMs - approx.getTime())).toISOString()
}

function tzAbbr(tz: string) {
  try {
    return new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "short" })
      .formatToParts(new Date()).find((p) => p.type === "timeZoneName")?.value ?? tz
  } catch { return tz }
}

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
  avatar_url: string | null
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
    cardName: "", agreedToTerms: false,
  })

  // Availability
  const [hostAvail, setHostAvail] = useState<HostAvailDay[]>([])
  const [hostBlocked, setHostBlocked] = useState<string[]>([])
  const [hostTZ, setHostTZ] = useState("America/New_York")
  const [availLoaded, setAvailLoaded] = useState(false)
  const [pickedDay, setPickedDay] = useState("")
  const [pickedTime, setPickedTime] = useState("")

  // Stripe Elements state
  const [stripe, setStripe] = useState<StripeType | null>(null)
  const [cardElement, setCardElement] = useState<StripeCardElement | null>(null)
  const [cardReady, setCardReady] = useState(false)
  const [setupClientSecret, setSetupClientSecret] = useState("")
  const cardRef = useRef<HTMLDivElement>(null)

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

    fetch(`/api/availability/username/${username}`)
      .then((r) => r.json())
      .then((data) => {
        setHostAvail(data.availability || [])
        setHostBlocked((data.blocked || []).map((b: { blocked_date: string }) => b.blocked_date))
        setHostTZ(data.timezone || "America/New_York")
        setAvailLoaded(true)
      })
      .catch(() => setAvailLoaded(true))
  }, [username])

  // When entering Step 3: fetch SetupIntent + load Stripe Elements
  useEffect(() => {
    if (step !== 3 || !host) return

    let mounted = true

    async function initStripe() {
      try {
        const res = await fetch("/api/bookings/setup-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hostUsername: username }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to initialize payment")

        const stripeInstance = await loadStripe(data.publishableKey)
        if (!stripeInstance || !mounted) return

        setStripe(stripeInstance)
        setSetupClientSecret(data.clientSecret)

        // Mount CardElement after state settles
        setTimeout(() => {
          if (!cardRef.current || !mounted) return
          const elements = stripeInstance.elements()
          const card = elements.create("card", {
            style: {
              base: {
                color: "#ffffff",
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: "16px",
                "::placeholder": { color: "#4b5563" },
                iconColor: "#a78bfa",
              },
              invalid: { color: "#f87171" },
            },
          })
          card.mount(cardRef.current!)
          card.on("ready", () => setCardReady(true))
          setCardElement(card)
        }, 100)
      } catch (e: unknown) {
        if (mounted) setError(e instanceof Error ? e.message : "Payment setup failed")
      }
    }

    initStripe()
    return () => { mounted = false }
  }, [step, host, username])

  const hasAvailability = hostAvail.length > 0

  const dateGrid = useMemo(() => {
    if (!hasAvailability) return []
    const today = new Date(); today.setHours(0, 0, 0, 0)
    return Array.from({ length: 60 }, (_, i) => {
      const d = addDays(today, i)
      const dateStr = format(d, "yyyy-MM-dd")
      const dow = d.getDay()
      const availDay = hostAvail.find((a) => a.day_of_week === dow)
      const isBlocked = hostBlocked.includes(dateStr)
      return { dateStr, d, available: !!availDay && !isBlocked, availDay: availDay || null }
    })
  }, [hasAvailability, hostAvail, hostBlocked])

  const availableSlots = useMemo(() => {
    if (!hasAvailability || !pickedDay) return []
    const dow = parseISO(pickedDay).getDay()
    const availDay = hostAvail.find((a) => a.day_of_week === dow)
    if (!availDay) return []
    return generateSlots(availDay.start_time.slice(0, 5), availDay.end_time.slice(0, 5))
  }, [hasAvailability, pickedDay, hostAvail])

  const priceLabel = host
    ? host.rate_type === "flat"
      ? `${formatCurrency(host.rate)} flat`
      : `${formatCurrency(host.rate)}/min`
    : ""

  const handleSubmit = async () => {
    if (!stripe || !cardElement || !setupClientSecret) return
    setSubmitting(true)
    setError("")

    try {
      // Confirm the SetupIntent client-side — Stripe tokenizes the card
      const { setupIntent, error: stripeError } = await stripe.confirmCardSetup(
        setupClientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: { name: form.cardName, email: form.clientEmail },
          },
        }
      )

      if (stripeError) throw new Error(stripeError.message)
      if (!setupIntent?.payment_method) throw new Error("Card setup failed")

      // Send only the payment method ID to our server
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostUsername: username,
          clientName: form.clientName,
          clientEmail: form.clientEmail,
          serviceType: form.serviceType,
          scheduledAt: form.scheduledAt,
          transcriptOptedIn: form.transcriptOptedIn,
          paymentMethodId: setupIntent.payment_method,
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
          <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-purple-600">
            {host.avatar_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={host.avatar_url} alt={host.display_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold">
                {host.display_name[0]}
              </div>
            )}
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

        {/* Progress steps */}
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

            {!availLoaded ? (
              <div className="text-gray-500 text-sm animate-pulse py-8 text-center">Loading available slots…</div>
            ) : hasAvailability ? (
              <>
                <p className="text-xs text-gray-500">🕐 All times shown in {tzAbbr(hostTZ)} ({hostTZ})</p>

                {/* Date grid */}
                <div>
                  <label className="block text-sm text-gray-400 mb-3">Select a date</label>
                  <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-1">
                    {dateGrid.filter((d) => d.available).slice(0, 30).map(({ dateStr, d }) => (
                      <button
                        key={dateStr}
                        onClick={() => { setPickedDay(dateStr); setPickedTime(""); setForm((f) => ({ ...f, scheduledAt: "" })) }}
                        className={`rounded-xl py-2.5 px-1 text-center transition-all border ${
                          pickedDay === dateStr
                            ? "bg-purple-600 border-purple-500 text-white"
                            : "bg-white/[0.04] border-white/10 text-gray-300 hover:bg-white/10"
                        }`}
                      >
                        <div className="text-xs text-gray-400 mb-0.5">{format(d, "EEE")}</div>
                        <div className="text-sm font-semibold">{format(d, "MMM d")}</div>
                      </button>
                    ))}
                  </div>
                  {dateGrid.filter((d) => d.available).length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">No available dates in the next 60 days.</p>
                  )}
                </div>

                {/* Time slots */}
                {pickedDay && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-3">Select a time</label>
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => {
                            setPickedTime(value)
                            setForm((f) => ({ ...f, scheduledAt: hostTimeToUTC(pickedDay, value, hostTZ) }))
                          }}
                          className={`rounded-xl py-2.5 text-sm transition-all border ${
                            pickedTime === value
                              ? "bg-purple-600 border-purple-500 text-white font-semibold"
                              : "bg-white/[0.04] border-white/10 text-gray-300 hover:bg-white/10"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div>
                <label className="block text-sm text-gray-400 mb-2">Preferred date & time</label>
                <input type="datetime-local" value={form.scheduledAt}
                  min={new Date(Date.now() + 3600000).toISOString().slice(0, 16)}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white [color-scheme:dark]" />
              </div>
            )}

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

        {/* Step 3 — Stripe Elements */}
        {step === 3 && (
          <div className="space-y-5 fade-up">
            <div>
              <h2 className="text-xl font-bold mb-1">Secure payment</h2>
              <p className="text-gray-500 text-sm">Card saved — charged only after the call ends.</p>
            </div>

            <Field label="Name on card" value={form.cardName} onChange={(v) => setForm((f) => ({ ...f, cardName: v }))} placeholder="Jane Smith" />

            {/* Stripe Card Element */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Card details</label>
              <div
                ref={cardRef}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-4 min-h-[52px]"
              />
              {!cardReady && !error && (
                <p className="text-xs text-gray-600 mt-1 animate-pulse">Loading secure card input...</p>
              )}
              <p className="text-xs text-gray-600 mt-1.5 flex items-center gap-1">
                <span>🔒</span> Powered by Stripe. We never see your card number.
              </p>
            </div>

            {/* Privacy agreement */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div
                onClick={() => setForm((f) => ({ ...f, agreedToTerms: !f.agreedToTerms }))}
                className={`mt-0.5 w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${
                  form.agreedToTerms ? "bg-purple-600 border-purple-600" : "border-white/20 group-hover:border-purple-500/50"
                }`}
              >
                {form.agreedToTerms && <span className="text-white text-xs font-bold">✓</span>}
              </div>
              <span className="text-sm text-gray-400 leading-relaxed">
                I agree to the{" "}
                <a href="/privacy" target="_blank" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">
                  Privacy Policy
                </a>
                . I understand my card will be saved securely and charged only after the call ends.
              </span>
            </label>

            {error && <div className="bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>}

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 border border-white/10 text-gray-300 py-3 rounded-xl hover:bg-white/5">← Back</button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !cardReady || !form.cardName || !form.agreedToTerms || !stripe}
                className="flex-[2] bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-all"
              >
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
