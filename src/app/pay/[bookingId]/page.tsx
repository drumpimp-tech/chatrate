"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Logo } from "@/components/Logo"
import { formatCurrency } from "@/lib/utils"
import { loadStripe, type Stripe as StripeType, type StripeCardElement } from "@stripe/stripe-js"
import { format } from "date-fns"

type BookingInvite = {
  id: string
  client_name: string | null
  client_email: string | null
  service_type: string
  pricing_model: "flat" | "per_minute"
  rate: number
  transcript_fee: number
  scheduled_at: string
  status: string
  notes: string | null
  is_group: boolean
  max_seats: number
  seatsTaken: number
  host: {
    display_name: string
    avatar_url: string | null
    bio: string
    username: string
  }
}

export default function PayPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const router = useRouter()

  const [booking, setBooking] = useState<BookingInvite | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [transcriptOptIn, setTranscriptOptIn] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [stripe, setStripe] = useState<StripeType | null>(null)
  const [cardElement, setCardElement] = useState<StripeCardElement | null>(null)
  const [cardReady, setCardReady] = useState(false)
  const [setupClientSecret, setSetupClientSecret] = useState("")
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`/api/pay/${bookingId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); setLoading(false); return }
        setBooking(data)
        if (data.client_name) setName(data.client_name)
        if (data.client_email) setEmail(data.client_email)
        setLoading(false)
      })
      .catch(() => { setError("Failed to load invite"); setLoading(false) })
  }, [bookingId])

  // Load Stripe + SetupIntent once booking is loaded
  useEffect(() => {
    if (!booking) return
    let mounted = true

    async function init() {
      try {
        const res = await fetch("/api/bookings/setup-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hostUsername: booking!.host.username }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Payment setup failed")

        const stripeInstance = await loadStripe(data.publishableKey)
        if (!stripeInstance || !mounted) return

        setStripe(stripeInstance)
        setSetupClientSecret(data.clientSecret)

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

    init()
    return () => { mounted = false }
  }, [booking])

  const handlePay = async () => {
    if (!stripe || !cardElement || !setupClientSecret) return
    if (!name.trim()) { setError("Please enter your name"); return }
    if (!email.trim()) { setError("Please enter your email"); return }
    if (!agreedToTerms) { setError("Please agree to the terms"); return }

    setSubmitting(true)
    setError("")

    try {
      const { setupIntent, error: stripeError } = await stripe.confirmCardSetup(
        setupClientSecret,
        { payment_method: { card: cardElement, billing_details: { name, email } } }
      )

      if (stripeError) throw new Error(stripeError.message)
      if (!setupIntent?.payment_method) throw new Error("Card setup failed")

      const res = await fetch(`/api/pay/${bookingId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: name,
          clientEmail: email,
          transcriptOptedIn: transcriptOptIn,
          paymentMethodId: setupIntent.payment_method,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Payment failed")

      router.push(`/pay/${bookingId}/confirmed`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-gray-500 animate-pulse">Loading invite...</div>
      </div>
    )
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-center px-4">
        <div>
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">Invite not found</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  // For 1-on-1: block if already confirmed. For group: block only if full or cancelled.
  const isFull = booking?.is_group && (booking.seatsTaken ?? 0) >= (booking.max_seats ?? 1)
  if (
    (!booking?.is_group && (booking?.status === "confirmed" || booking?.status === "in_progress" || booking?.status === "completed")) ||
    booking?.status === "cancelled" ||
    isFull
  ) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-center px-4">
        <div>
          <div className="text-5xl mb-4">{isFull ? "🈵" : "✅"}</div>
          <h1 className="text-2xl font-bold mb-2">{isFull ? "Session is full" : "Already confirmed"}</h1>
          <p className="text-gray-400">{isFull ? "All seats have been claimed for this session." : "This booking has already been paid and confirmed."}</p>
        </div>
      </div>
    )
  }

  if (!booking) return null

  const priceLabel = booking.pricing_model === "flat"
    ? `${formatCurrency(booking.rate)} flat`
    : `${formatCurrency(booking.rate)}/min`

  return (
    <div className="min-h-screen bg-[#050505]">
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between max-w-xl mx-auto">
        <Logo />
        <span className="text-sm text-gray-500">Secure payment</span>
      </nav>

      <div className="max-w-xl mx-auto px-4 py-8 space-y-6">

        {/* Invite banner */}
        <div className="bg-purple-900/10 border border-purple-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-purple-400 font-medium uppercase tracking-wider">
              {booking.is_group ? "Group session" : "Personal invite"}
            </p>
            {booking.is_group && (
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                (booking.max_seats - booking.seatsTaken) <= 1
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-green-500/20 text-green-400 border border-green-500/30"
              }`}>
                {booking.max_seats - booking.seatsTaken} seat{booking.max_seats - booking.seatsTaken !== 1 ? "s" : ""} left
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-purple-600">
              {booking.host.avatar_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={booking.host.avatar_url} alt={booking.host.display_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl font-bold">
                  {booking.host.display_name[0]}
                </div>
              )}
            </div>
            <div>
              <p className="font-bold text-lg">{booking.host.display_name}</p>
              <p className="text-gray-400 text-sm">{booking.service_type}</p>
            </div>
          </div>
        </div>

        {/* Booking details */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Session details</h2>
          <div className="bg-purple-900/10 border border-purple-500/20 rounded-xl px-4 py-3 mb-1">
            <p className="text-xs text-purple-400 font-medium uppercase tracking-wider mb-0.5">Date & Time</p>
            <p className="text-white font-bold text-base">{format(new Date(booking.scheduled_at), "EEEE, MMMM d, yyyy")}</p>
            <p className="text-purple-300 font-semibold text-sm">{format(new Date(booking.scheduled_at), "h:mm a")}</p>
          </div>
          <Row label="Service" value={booking.service_type} />
          <Row label="Rate" value={priceLabel} highlight />
          {booking.notes && (
            <div className="pt-2 border-t border-white/[0.05]">
              <p className="text-xs text-gray-500 mb-1">Note from {booking.host.display_name.split(" ")[0]}</p>
              <p className="text-sm text-gray-300">{booking.notes}</p>
            </div>
          )}
        </div>

        {/* Transcript opt-in */}
        {booking.transcript_fee > 0 && (
          <button
            onClick={() => setTranscriptOptIn((v) => !v)}
            className={`w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
              transcriptOptIn
                ? "bg-purple-600/10 border-purple-500/40"
                : "bg-white/[0.02] border-white/[0.06] hover:border-white/10"
            }`}
          >
            <span className={`mt-0.5 w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${
              transcriptOptIn ? "bg-purple-600 border-purple-600" : "border-white/30"
            }`}>
              {transcriptOptIn && <span className="text-white text-xs">✓</span>}
            </span>
            <div>
              <p className="text-sm font-medium">Add transcript — {formatCurrency(booking.transcript_fee)}</p>
              <p className="text-xs text-gray-500 mt-0.5">Get a full written transcript of the call emailed to you.</p>
            </div>
          </button>
        )}

        {/* Client info */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Your details</h2>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Your name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Your email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Card input */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Payment</h2>
          <p className="text-xs text-gray-500">
            {booking.pricing_model === "per_minute"
              ? "Your card is saved now and charged automatically at the end of the call based on actual duration."
              : `Your card is saved now and charged ${formatCurrency(booking.rate)} at the end of the call.`}
          </p>
          <div
            ref={cardRef}
            className={`bg-white/[0.04] border rounded-xl px-4 py-3.5 transition-all ${
              cardReady ? "border-white/10" : "border-white/5 opacity-60"
            }`}
          />
          {!cardReady && (
            <p className="text-xs text-gray-600 animate-pulse">Loading secure card input...</p>
          )}
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Terms checkbox */}
        <button
          onClick={() => setAgreedToTerms((v) => !v)}
          className="flex items-start gap-3 text-left w-full"
        >
          <span className={`mt-0.5 w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${
            agreedToTerms ? "bg-purple-600 border-purple-600" : "border-white/20"
          }`}>
            {agreedToTerms && <span className="text-white text-xs">✓</span>}
          </span>
          <p className="text-xs text-gray-500 leading-relaxed">
            I agree to the{" "}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline">
              privacy policy
            </a>{" "}
            and understand my card will be charged after the call.
          </p>
        </button>

        <button
          onClick={handlePay}
          disabled={submitting || !cardReady || !agreedToTerms}
          className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold py-4 rounded-xl transition-all text-lg"
        >
          {submitting ? "Confirming..." : "Confirm & Save Card →"}
        </button>

        <p className="text-center text-gray-600 text-xs">
          🔒 Card details are processed securely by Stripe. ChatRate never stores your card number.
        </p>
      </div>
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={highlight ? "text-purple-400 font-semibold" : "text-white font-medium"}>{value}</span>
    </div>
  )
}
