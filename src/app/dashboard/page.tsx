"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { formatCurrency, formatDuration } from "@/lib/utils"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/Logo"

type Booking = {
  id: string
  client_name: string
  client_email: string
  service_type: string
  pricing_model: "flat" | "per_minute"
  rate: number
  transcript_opted_in: boolean
  transcript_fee: number
  status: string
  scheduled_at: string
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
  const [host, setHost] = useState<Host | null>(null)
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming")
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

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

  const upcoming = bookings.filter((b) =>
    ["confirmed", "pending", "in_progress"].includes(b.status)
  )
  const past = bookings.filter((b) => b.status === "completed")
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
          <div className="space-y-3">
            {upcoming.length === 0 ? (
              <Empty message="No upcoming bookings. Share your booking link to get started." />
            ) : (
              upcoming.map((b) => <UpcomingCard key={b.id} booking={b} />)
            )}
          </div>
        )}

        {activeTab === "past" && (
          <div className="space-y-3">
            {past.length === 0 ? (
              <Empty message="No completed calls yet." />
            ) : (
              past.map((b) => <PastCard key={b.id} booking={b} />)
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

function UpcomingCard({ booking }: { booking: Booking }) {
  const isLive = booking.status === "in_progress"
  return (
    <div className={`bg-white/[0.03] border rounded-2xl p-5 flex items-center justify-between gap-4 ${isLive ? "border-red-500/30" : "border-white/[0.06]"}`}>
      <div className="flex items-center gap-4">
        {isLive && (
          <span className="flex items-center gap-1 bg-red-500/10 border border-red-500/20 rounded-full px-2 py-0.5 text-red-400 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            LIVE
          </span>
        )}
        <div>
          <p className="font-semibold">{booking.client_name}</p>
          <p className="text-gray-500 text-sm">{booking.service_type}</p>
        </div>
      </div>
      <div className="text-right hidden sm:block">
        <p className="text-sm font-medium">{format(new Date(booking.scheduled_at), "MMM d, h:mm a")}</p>
        <p className="text-gray-500 text-xs">
          {booking.pricing_model === "flat"
            ? formatCurrency(booking.rate) + " flat"
            : formatCurrency(booking.rate) + "/min"}
        </p>
      </div>
      <Link
        href={`/call/${booking.id}?host=true`}
        className={`flex-shrink-0 font-bold px-5 py-2.5 rounded-xl transition-all text-sm ${
          isLive ? "bg-red-600 hover:bg-red-500 text-white" : "bg-purple-600 hover:bg-purple-500 text-white"
        }`}
      >
        {isLive ? "Rejoin →" : "Join Call →"}
      </Link>
    </div>
  )
}

function PastCard({ booking }: { booking: Booking }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex items-center justify-between gap-4">
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
        <p className="text-gray-600 text-xs">{format(new Date(booking.scheduled_at), "MMM d, yyyy")}</p>
        {booking.transcript_opted_in && (
          <p className="text-xs text-green-500 mt-0.5">Transcript sent ✓</p>
        )}
      </div>
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
