"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { formatCurrency, formatDuration } from "@/lib/utils"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/Logo"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://chatrate-app.com"

type Booking = {
  id: string
  client_name: string | null
  client_email: string | null
  service_type: string
  pricing_model: "flat" | "per_minute"
  rate: number
  transcript_opted_in: boolean
  transcript_fee: number
  status: string
  scheduled_at: string | null
  started_at: string | null
  ended_at: string | null
  duration_seconds: number | null
  amount_charged: number | null
  daily_room_url: string
  daily_room_name: string
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
  is_activated: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [clearedIds, setClearedIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set()
    try { return new Set(JSON.parse(localStorage.getItem("chatrate_cleared") || "[]")) } catch { return new Set() }
  })
  const [host, setHost] = useState<Host | null>(null)
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming")
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  // Create invite state
  const [showInvite, setShowInvite] = useState(false)
  const [inviteForm, setInviteForm] = useState({ clientName: "", clientEmail: "", scheduledAt: "", notes: "", isGroup: false, maxSeats: "4" })
  const [inviteCreating, setInviteCreating] = useState(false)
  const [inviteLink, setInviteLink] = useState("")
  const [inviteCopied, setInviteCopied] = useState(false)
  const [toast, setToast] = useState("")

  useEffect(() => {
    Promise.all([
      fetch("/api/bookings").then((r) => r.json()),
      fetch("/api/me").then((r) => r.json()),
    ]).then(([bookingsData, hostData]) => {
      setBookings(Array.isArray(bookingsData) ? bookingsData : [])
      if (hostData && hostData.username) setHost(hostData)
      setLoading(false)
    })
  }, [])

  const createInvite = async () => {
    setInviteCreating(true)
    try {
      const res = await fetch("/api/bookings/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...inviteForm, maxSeats: parseInt(inviteForm.maxSeats) || 4 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const fullUrl = data.inviteUrl
      navigator.clipboard.writeText(fullUrl).catch(() => {})
      setToast("🔗 Invite link copied to clipboard!")
      setTimeout(() => setToast(""), 4000)

      // Add booking directly to state immediately — no re-fetch needed
      const newBooking: Booking = {
        id: data.id,
        client_name: inviteForm.clientName || null,
        client_email: inviteForm.clientEmail || null,
        service_type: host?.service_type || "",
        pricing_model: host?.rate_type || "flat",
        rate: host?.rate || 0,
        transcript_opted_in: false,
        transcript_fee: 0,
        status: "invited",
        scheduled_at: inviteForm.scheduledAt || null,
        started_at: null,
        ended_at: null,
        duration_seconds: null,
        amount_charged: null,
        daily_room_url: "",
        daily_room_name: "",
      }
      setBookings((prev) => [newBooking, ...prev])
      setActiveTab("upcoming")

      // Close panel and reset form
      setShowInvite(false)
      setInviteLink("")
      setInviteForm({ clientName: "", clientEmail: "", scheduledAt: "", notes: "", isGroup: false, maxSeats: "4" })

      // Scroll upcoming into view
      setTimeout(() => {
        document.getElementById("upcoming-section")?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 100)
    } catch (e: unknown) {
      setToast("❌ " + (e instanceof Error ? e.message : "Failed to create invite"))
      setTimeout(() => setToast(""), 4000)
    } finally {
      setInviteCreating(false)
    }
  }

  const copyInviteLink = (url: string) => {
    navigator.clipboard.writeText(url)
    setInviteCopied(true)
    setTimeout(() => setInviteCopied(false), 3000)
    setToast("🔗 Link copied to clipboard!")
    setTimeout(() => setToast(""), 3500)
  }

  const clearBooking = (id: string) => {
    setClearedIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      try { localStorage.setItem("chatrate_cleared", JSON.stringify([...next])) } catch {}
      return next
    })
  }

  const upcoming = bookings.filter((b) =>
    ["confirmed", "pending", "in_progress", "invited"].includes(b.status) && !clearedIds.has(b.id)
  )
  const past = bookings.filter((b) => b.status === "completed" && !clearedIds.has(b.id))
  const totalEarnings = past.reduce((sum, b) => sum + (b.amount_charged ?? 0), 0)

  const toggleAvailability = async () => {
    if (!host) return
    setToggling(true)
    const res = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_available: !host.is_available }),
    })
    const updated = await res.json()
    if (updated?.username) setHost(updated)
    setToggling(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/signup")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-gray-500 animate-pulse">Loading dashboard...</div>
      </div>
    )
  }

  // If no host record, redirect to onboarding
  if (!host) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 text-center">
        <div>
          <div className="text-4xl mb-4">👋</div>
          <h1 className="text-2xl font-bold mb-2">Complete your setup</h1>
          <p className="text-gray-400 mb-6 text-sm">Finish onboarding to get your booking page.</p>
          <Link
            href="/onboarding"
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-xl transition-all"
          >
            Complete Setup →
          </Link>
        </div>
      </div>
    )
  }

  const bookingLink = `${process.env.NEXT_PUBLIC_APP_URL || "https://chatrate-app.com"}/book/${host.username}`

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl animate-bounce-in">
          {toast}
        </div>
      )}
      {/* Top nav */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/settings"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ⚙ Settings
          </Link>
          <a
            href={`/book/${host.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-400 px-3 py-1.5 rounded-lg transition-colors"
          >
            ↗ My Page
          </a>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-600 hover:text-gray-400 transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Welcome + booking link */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">
            Hey, {host.display_name.split(" ")[0]} 👋
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-gray-500 text-sm">Your booking link:</span>
            <a
              href={`/book/${host.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 text-sm hover:text-purple-300 font-mono"
            >
              chatrate-app.com/book/{host.username}
            </a>
            <button
              onClick={() => navigator.clipboard.writeText(bookingLink)}
              className="text-xs text-gray-600 hover:text-gray-400 px-2 py-0.5 rounded border border-white/10 hover:border-white/20 transition-colors"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Earnings" value={formatCurrency(totalEarnings)} icon="💰" highlight />
          <StatCard label="Completed Calls" value={past.length.toString()} icon="✅" />
          <StatCard label="Upcoming" value={upcoming.length.toString()} icon="📅" />
          <StatCard
            label="Current Rate"
            value={
              host.rate_type === "flat"
                ? `${formatCurrency(host.rate)} flat`
                : `${formatCurrency(host.rate)}/min`
            }
            icon="⚡"
          />
        </div>

        {/* Availability toggle */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 mb-6 flex items-center justify-between">
          <div>
            <p className="font-semibold">Availability</p>
            <p className="text-gray-500 text-sm mt-0.5">
              {host.is_available ? "You're accepting bookings" : "Bookings are paused"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${host.is_available ? "text-green-400" : "text-gray-500"}`}>
              {host.is_available ? "Open" : "Closed"}
            </span>
            <button
              onClick={toggleAvailability}
              disabled={toggling}
              className={`w-14 h-7 rounded-full transition-colors relative disabled:opacity-60 ${
                host.is_available ? "bg-green-600" : "bg-white/20"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white transition-transform ${
                  host.is_available ? "translate-x-7" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Create Invite */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Send a payment invite</p>
              <p className="text-gray-500 text-sm mt-0.5">Create a link to send to your client — they pay, you call.</p>
            </div>
            <button
              onClick={() => { setShowInvite((v) => !v); setInviteLink("") }}
              className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all flex-shrink-0"
            >
              {showInvite ? "✕ Cancel" : "+ New Invite"}
            </button>
          </div>

          {showInvite && (
            <div className="mt-5 space-y-4 border-t border-white/[0.05] pt-5">
              {!inviteLink ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">Client name <span className="text-gray-600">(optional)</span></label>
                      <input
                        type="text"
                        value={inviteForm.clientName}
                        onChange={(e) => setInviteForm((f) => ({ ...f, clientName: e.target.value }))}
                        placeholder="Jane Smith"
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">Client email <span className="text-gray-600">(optional)</span></label>
                      <input
                        type="email"
                        value={inviteForm.clientEmail}
                        onChange={(e) => setInviteForm((f) => ({ ...f, clientEmail: e.target.value }))}
                        placeholder="jane@email.com"
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Date & time <span className="text-gray-600">(optional — client can pick if left blank)</span></label>
                    <input
                      type="datetime-local"
                      value={inviteForm.scheduledAt}
                      onChange={(e) => { if (e.target.value) setInviteForm((f) => ({ ...f, scheduledAt: e.target.value })) }}
                      onBlur={(e) => { if (e.target.value) setInviteForm((f) => ({ ...f, scheduledAt: e.target.value })) }}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Note to client <span className="text-gray-600">(optional)</span></label>
                    <input
                      type="text"
                      value={inviteForm.notes}
                      onChange={(e) => setInviteForm((f) => ({ ...f, notes: e.target.value }))}
                      placeholder="e.g. &quot;Looking forward to our music consultation!&quot;"
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Group session toggle */}
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">Group session</p>
                        <p className="text-xs text-gray-500 mt-0.5">Multiple people join & pay separately</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setInviteForm((f) => ({ ...f, isGroup: !f.isGroup }))}
                        className={`w-11 h-6 rounded-full transition-colors relative ${inviteForm.isGroup ? "bg-purple-600" : "bg-white/20"}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${inviteForm.isGroup ? "translate-x-5" : ""}`} />
                      </button>
                    </div>
                    {inviteForm.isGroup && (
                      <div>
                        <label className="block text-xs text-gray-500 mb-1.5">Max seats</label>
                        <input
                          type="number"
                          min="2"
                          max="50"
                          value={inviteForm.maxSeats}
                          onChange={(e) => setInviteForm((f) => ({ ...f, maxSeats: e.target.value }))}
                          className="w-24 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                        />
                        <p className="text-xs text-gray-600 mt-1">Each person gets their own card charge at call end</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={createInvite}
                    disabled={inviteCreating}
                    className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-all"
                  >
                    {inviteCreating ? "Creating..." : "Generate invite link →"}
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-green-400 font-semibold">✓ Invite created — link copied to clipboard!</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white/[0.04] border border-purple-500/30 rounded-xl px-3 py-2.5 font-mono text-purple-400 text-xs truncate">
                      {inviteLink}
                    </div>
                    <button
                      onClick={() => copyInviteLink(inviteLink)}
                      className={`flex-shrink-0 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all ${
                        inviteCopied ? "bg-green-600 hover:bg-green-500" : "bg-purple-600 hover:bg-purple-500"
                      }`}
                    >
                      {inviteCopied ? "✓ Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Your client opens this link, adds their card, and confirms. You&apos;ll get an email when they do.</p>
                  <button
                    onClick={() => { setInviteLink(""); setInviteForm({ clientName: "", clientEmail: "", scheduledAt: "", notes: "", isGroup: false, maxSeats: "5" }) }}
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    + Create another invite
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bookings tabs */}
        <div className="flex gap-1 mb-6">
          <TabBtn active={activeTab === "upcoming"} onClick={() => setActiveTab("upcoming")}>
            Upcoming ({upcoming.length})
          </TabBtn>
          <TabBtn active={activeTab === "past"} onClick={() => setActiveTab("past")}>
            Past Calls ({past.length})
          </TabBtn>
        </div>

        {activeTab === "upcoming" && (
          <div id="upcoming-section" className="space-y-3">
            {upcoming.length === 0 ? (
              <Empty message="No upcoming bookings. Share your booking link to get started." />
            ) : (
              upcoming.map((b) => <UpcomingCard key={b.id} booking={b} onClear={clearBooking} />)
            )}
          </div>
        )}

        {activeTab === "past" && (
          <div className="space-y-3">
            {past.length === 0 ? (
              <Empty message="No completed calls yet." />
            ) : (
              past.map((b) => (
                <PastCard
                  key={b.id}
                  booking={b}
                  onClear={clearBooking}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, highlight }: { label: string; value: string; icon: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 border ${highlight ? "bg-purple-900/20 border-purple-500/20" : "bg-white/[0.03] border-white/[0.06]"}`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className={`text-2xl font-bold mb-1 ${highlight ? "text-purple-400" : ""}`}>{value}</div>
      <div className="text-gray-500 text-xs">{label}</div>
    </div>
  )
}

function TabBtn({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
        active ? "bg-purple-600 text-white" : "bg-white/[0.03] text-gray-400 hover:text-white"
      }`}
    >
      {children}
    </button>
  )
}

function useLongPress(onLongPress: () => void, ms = 600) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const start = () => { timer.current = setTimeout(onLongPress, ms) }
  const cancel = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null } }
  return { onTouchStart: start, onTouchEnd: cancel, onTouchMove: cancel, onMouseDown: start, onMouseUp: cancel, onMouseLeave: cancel }
}

function UpcomingCard({ booking, onClear }: { booking: Booking; onClear: (id: string) => void }) {
  const isLive = booking.status === "in_progress"
  const isInvited = booking.status === "invited"
  const [copied, setCopied] = useState(false)
  const [showClear, setShowClear] = useState(false)

  const inviteUrl = `${APP_URL}/pay/${booking.id}`

  const copyLink = () => {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const longPress = useLongPress(() => setShowClear(true))

  return (
    <div
      className={`bg-white/[0.03] border rounded-2xl p-5 relative select-none ${
        isLive ? "border-red-500/30" : isInvited ? "border-amber-500/20" : "border-white/[0.06]"
      }`}
      {...longPress}
    >
      {/* Clear button */}
      <button
        onClick={() => onClear(booking.id)}
        className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/10 hover:bg-red-500/30 text-gray-500 hover:text-red-400 flex items-center justify-center text-xs transition-all"
        title="Clear"
      >
        ✕
      </button>

      <div className="flex items-center justify-between gap-4 pr-6">
        <div className="flex items-center gap-4">
          {isLive && (
            <span className="flex items-center gap-1 bg-red-500/10 border border-red-500/20 rounded-full px-2 py-0.5 text-red-400 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              LIVE
            </span>
          )}
          {isInvited && (
            <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full">
              ⏳ Awaiting payment
            </span>
          )}
          <div>
            <p className="font-semibold">{booking.client_name || <span className="text-gray-500 italic">Client pending</span>}</p>
            <p className="text-gray-500 text-sm">{booking.service_type}</p>
          </div>
        </div>
        <div className="text-right">
          {booking.scheduled_at ? (
            <p className="text-sm font-semibold text-white">{format(new Date(booking.scheduled_at), "MMM d, yyyy · h:mm a")}</p>
          ) : (
            <p className="text-xs text-amber-400 italic">Client picks time</p>
          )}
          <p className="text-gray-500 text-xs mt-0.5">
            {booking.pricing_model === "flat"
              ? formatCurrency(booking.rate) + " flat"
              : formatCurrency(booking.rate) + "/min"}
          </p>
        </div>
        {isInvited ? (
          <button
            onClick={copyLink}
            className="flex-shrink-0 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-300 font-bold px-4 py-2.5 rounded-xl transition-all text-sm"
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
        ) : (
          <Link
            href={`/call/${booking.id}?host=true`}
            className={`flex-shrink-0 font-bold px-5 py-2.5 rounded-xl transition-all text-sm ${
              isLive ? "bg-red-600 hover:bg-red-500 text-white" : "bg-purple-600 hover:bg-purple-500 text-white"
            }`}
          >
            {isLive ? "Rejoin →" : "Join Call →"}
          </Link>
        )}
      </div>
      {isInvited && (
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-1.5 font-mono text-purple-400 text-xs truncate">
            {inviteUrl}
          </div>
        </div>
      )}
      {showClear && (
        <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between">
          <p className="text-xs text-gray-500">Remove this booking from your list?</p>
          <div className="flex gap-2">
            <button onClick={() => setShowClear(false)} className="text-xs text-gray-500 hover:text-white px-3 py-1.5 rounded-lg border border-white/10">Keep</button>
            <button onClick={() => onClear(booking.id)} className="text-xs text-red-400 hover:text-white hover:bg-red-600 px-3 py-1.5 rounded-lg border border-red-500/30 transition-all">Remove</button>
          </div>
        </div>
      )}
    </div>
  )
}

function PastCard({ booking, onClear }: { booking: Booking; onClear: (id: string) => void }) {
  const [showClear, setShowClear] = useState(false)
  const longPress = useLongPress(() => setShowClear(true))

  return (
    <div
      className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 relative select-none"
      {...longPress}
    >
      {/* Clear button */}
      <button
        onClick={() => onClear(booking.id)}
        className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/10 hover:bg-red-500/30 text-gray-500 hover:text-red-400 flex items-center justify-center text-xs transition-all"
        title="Clear"
      >
        ✕
      </button>

      <div className="flex items-center justify-between gap-4 pr-6">
        <div>
          <p className="font-semibold">{booking.client_name}</p>
          <p className="text-gray-500 text-sm">{booking.service_type}</p>
          {booking.duration_seconds && (
            <p className="text-gray-600 text-xs mt-0.5">{formatDuration(booking.duration_seconds)}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-purple-400 font-bold text-lg">
            {booking.amount_charged ? formatCurrency(booking.amount_charged) : "—"}
          </p>
          {booking.scheduled_at && <p className="text-gray-600 text-xs">{format(new Date(booking.scheduled_at), "MMM d, yyyy")}</p>}
          {booking.transcript_opted_in && (
            <p className="text-xs text-green-500 mt-0.5">Transcript sent ✓</p>
          )}
        </div>
      </div>
      {showClear && (
        <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between">
          <p className="text-xs text-gray-500">Remove this call from your history?</p>
          <div className="flex gap-2">
            <button onClick={() => setShowClear(false)} className="text-xs text-gray-500 hover:text-white px-3 py-1.5 rounded-lg border border-white/10">Keep</button>
            <button onClick={() => onClear(booking.id)} className="text-xs text-red-400 hover:text-white hover:bg-red-600 px-3 py-1.5 rounded-lg border border-red-500/30 transition-all">Remove</button>
          </div>
        </div>
      )}
    </div>
  )
}

function Empty({ message }: { message: string }) {
  return (
    <div className="text-center py-16 text-gray-600">
      <div className="text-4xl mb-3">📭</div>
      <p>{message}</p>
    </div>
  )
}
