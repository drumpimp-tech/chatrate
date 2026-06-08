"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { SERVICE_TYPES, formatCurrency } from "@/lib/utils"
import { Logo } from "@/components/Logo"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

type DayAvail = { enabled: boolean; start: string; end: string }

const TIMEZONES = [
  { value: "America/New_York",    label: "Eastern (ET)" },
  { value: "America/Chicago",     label: "Central (CT)" },
  { value: "America/Denver",      label: "Mountain (MT)" },
  { value: "America/Phoenix",     label: "Arizona (no DST)" },
  { value: "America/Los_Angeles", label: "Pacific (PT)" },
  { value: "America/Anchorage",   label: "Alaska (AKT)" },
  { value: "Pacific/Honolulu",    label: "Hawaii (HT)" },
  { value: "America/Puerto_Rico", label: "Atlantic / Puerto Rico" },
  { value: "Europe/London",       label: "London (GMT/BST)" },
  { value: "Europe/Paris",        label: "Central Europe (CET)" },
  { value: "Europe/Amsterdam",    label: "Amsterdam (CET)" },
  { value: "Africa/Lagos",        label: "West Africa (WAT)" },
  { value: "Africa/Johannesburg", label: "South Africa (SAST)" },
  { value: "Asia/Dubai",          label: "Dubai (GST)" },
  { value: "Asia/Kolkata",        label: "India (IST)" },
  { value: "Asia/Tokyo",          label: "Japan (JST)" },
  { value: "Asia/Seoul",          label: "Korea (KST)" },
  { value: "Asia/Shanghai",       label: "China (CST)" },
  { value: "Australia/Sydney",    label: "Sydney (AEST)" },
]

type Host = {
  username: string
  display_name: string
  bio: string
  service_type: string
  rate_type: "flat" | "per_minute"
  rate: number
  transcript_fee: number
  is_available: boolean
  stripe_publishable_key: string | null
  avatar_url: string | null
  timezone: string
}

export default function SettingsPage() {
  const [host, setHost] = useState<Host | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState<Host | null>(null)

  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState("")
  const avatarInputRef = useRef<HTMLInputElement>(null)

  // Availability state
  const [avail, setAvail] = useState<DayAvail[]>(
    Array.from({ length: 7 }, () => ({ enabled: false, start: "09:00", end: "17:00" }))
  )
  const [blockedDates, setBlockedDates] = useState<string[]>([])
  const [addingBlockDate, setAddingBlockDate] = useState("")
  const [availSaving, setAvailSaving] = useState(false)
  const [availSaved, setAvailSaved] = useState(false)

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.username) {
          setHost(data)
          setForm(data)
        }
      })
      .catch(console.error)

    fetch("/api/me/availability")
      .then((r) => r.json())
      .then((data) => {
        if (data.availability) {
          setAvail(
            Array.from({ length: 7 }, (_, i) => {
              const day = data.availability.find((a: { day_of_week: number }) => a.day_of_week === i)
              return day
                ? { enabled: true, start: day.start_time.slice(0, 5), end: day.end_time.slice(0, 5) }
                : { enabled: false, start: "09:00", end: "17:00" }
            })
          )
        }
        if (data.blocked) {
          setBlockedDates(data.blocked.map((b: { blocked_date: string }) => b.blocked_date))
        }
      })
      .catch(console.error)
  }, [])

  const [availError, setAvailError] = useState("")

  const saveAvailability = async () => {
    setAvailSaving(true)
    setAvailError("")
    try {
      const res = await fetch("/api/me/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          availability: avail
            .map((d, i) => ({ ...d, day_of_week: i }))
            .filter((d) => d.enabled)
            .map((d) => ({ day_of_week: d.day_of_week, start_time: d.start, end_time: d.end })),
          blocked: blockedDates,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Save failed (${res.status})`)
      }
      setAvailSaved(true)
      setTimeout(() => setAvailSaved(false), 2000)
    } catch (e: unknown) {
      setAvailError(e instanceof Error ? e.message : "Save failed")
    } finally {
      setAvailSaving(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    setAvatarError("")
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile) return
    setAvatarUploading(true)
    setAvatarError("")
    try {
      const fd = new FormData()
      fd.append("avatar", avatarFile)
      const res = await fetch("/api/me/avatar", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")
      setForm((f) => f && { ...f, avatar_url: data.url })
      setHost((h) => h && { ...h, avatar_url: data.url })
      setAvatarFile(null)
    } catch (e: unknown) {
      setAvatarError(e instanceof Error ? e.message : "Upload failed")
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleSave = async () => {
    if (!form) return
    setSaving(true)
    const res = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        display_name: form.display_name,
        bio: form.bio,
        service_type: form.service_type,
        rate_type: form.rate_type,
        rate: form.rate,
        transcript_fee: form.transcript_fee,
        timezone: form.timezone,
      }),
    })
    const updated = await res.json()
    if (updated?.username) {
      setHost(updated)
      setForm(updated)
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!form || !host) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-gray-500 animate-pulse">Loading...</div>
      </div>
    )
  }

  const pricePreview =
    form.rate_type === "flat"
      ? `${formatCurrency(form.rate)} flat rate per call`
      : `${formatCurrency(form.rate)} per minute`

  const currentAvatar = avatarPreview || host.avatar_url

  return (
    <div className="min-h-screen bg-[#050505]">
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <Logo />
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
          ← Dashboard
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-gray-500 text-sm mb-8">
          Manage your profile, pricing, and booking page.
        </p>

        <div className="space-y-6">
          {/* Booking link */}
          <div className="bg-purple-900/10 border border-purple-500/20 rounded-2xl p-5">
            <p className="text-sm text-gray-500 mb-1">Your booking link</p>
            <p className="text-purple-400 font-mono text-sm break-all">
              chatrate-app.com/book/{host.username}
            </p>
          </div>

          {/* Profile Photo */}
          <Section title="Profile Photo">
            <div className="flex items-center gap-6">
              {/* Avatar display */}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="relative w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border-2 border-dashed border-white/20 hover:border-purple-500/60 transition-all group"
              >
                {currentAvatar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={currentAvatar} alt="Profile photo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-purple-600/20 flex flex-col items-center justify-center gap-1">
                    <span className="text-3xl font-bold text-purple-400">
                      {host.display_name[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-medium">📷 Change</span>
                </div>
              </button>

              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />

              <div className="flex-1 space-y-3">
                <div className="text-sm text-gray-400">
                  <p>Click your photo to change it.</p>
                  <p className="text-xs text-gray-600 mt-0.5">JPEG, PNG, or WebP · Max 5 MB</p>
                </div>

                {avatarFile && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleAvatarUpload}
                      disabled={avatarUploading}
                      className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
                    >
                      {avatarUploading ? "Uploading..." : "Save photo"}
                    </button>
                    <button
                      onClick={() => { setAvatarFile(null); setAvatarPreview(null) }}
                      className="text-sm text-gray-500 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {avatarError && (
                  <p className="text-xs text-red-400">{avatarError}</p>
                )}

                {!avatarFile && host.avatar_url && (
                  <button
                    onClick={async () => {
                      await fetch("/api/me", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ avatar_url: null }),
                      })
                      setHost((h) => h && { ...h, avatar_url: null })
                      setForm((f) => f && { ...f, avatar_url: null })
                      setAvatarPreview(null)
                    }}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Remove photo
                  </button>
                )}
              </div>
            </div>
          </Section>

          {/* Profile */}
          <Section title="Profile">
            <Field
              label="Display Name"
              value={form.display_name}
              onChange={(v) => setForm((f) => f && { ...f, display_name: v })}
            />
            <div>
              <label className="block text-sm text-gray-400 mb-2">Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm((f) => f && { ...f, bio: e.target.value })}
                rows={3}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 resize-none"
                placeholder="Tell clients what you offer..."
              />
            </div>
          </Section>

          {/* Service */}
          <Section title="Default Service">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Primary service type</label>
              <select
                value={form.service_type}
                onChange={(e) => setForm((f) => f && { ...f, service_type: e.target.value })}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white appearance-none"
              >
                {SERVICE_TYPES.map((s) => (
                  <option key={s} value={s} className="bg-[#111]">{s}</option>
                ))}
              </select>
            </div>
          </Section>

          {/* Pricing */}
          <Section title="Pricing">
            <div>
              <label className="block text-sm text-gray-400 mb-3">Pricing model</label>
              <div className="grid grid-cols-2 gap-3">
                {(["per_minute", "flat"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setForm((f) => f && { ...f, rate_type: type })}
                    className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                      form.rate_type === type
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
                {form.rate_type === "flat" ? "Price per call" : "Price per minute"} (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number" min="0.50" step="0.50"
                  value={form.rate}
                  onChange={(e) => setForm((f) => f && { ...f, rate: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white"
                />
              </div>
              <p className="text-xs text-gray-600 mt-1.5">{pricePreview}</p>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Transcript add-on fee (USD, 0 to disable)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number" min="0" step="1"
                  value={form.transcript_fee}
                  onChange={(e) => setForm((f) => f && { ...f, transcript_fee: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white"
                />
              </div>
            </div>
          </Section>

          {/* Availability */}
          <Section title="Availability">
            <p className="text-xs text-gray-500 -mt-1">
              Set which days and hours clients can book. Leave all unchecked to allow any time.
            </p>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Your timezone</label>
              <select
                value={form.timezone || "America/New_York"}
                onChange={(e) => setForm((f) => f && { ...f, timezone: e.target.value })}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white appearance-none"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value} className="bg-[#111]">{tz.label} — {tz.value}</option>
                ))}
              </select>
              <p className="text-xs text-gray-600 mt-1.5">Times you set below are in this timezone. Clients see this timezone on the booking page.</p>
            </div>
            <div className="space-y-2.5">
              {DAYS.map((day, i) => (
                <div key={day} className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() =>
                      setAvail((a) =>
                        a.map((d, idx) => (idx === i ? { ...d, enabled: !d.enabled } : d))
                      )
                    }
                    className={`w-12 text-xs font-bold py-1.5 rounded-lg border transition-all flex-shrink-0 ${
                      avail[i].enabled
                        ? "bg-purple-600/20 border-purple-500/50 text-purple-400"
                        : "bg-white/[0.03] border-white/10 text-gray-500"
                    }`}
                  >
                    {day}
                  </button>
                  {avail[i].enabled && (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={avail[i].start}
                        onChange={(e) =>
                          setAvail((a) =>
                            a.map((d, idx) => (idx === i ? { ...d, start: e.target.value } : d))
                          )
                        }
                        className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm [color-scheme:dark]"
                      />
                      <span className="text-gray-600 text-sm">–</span>
                      <input
                        type="time"
                        value={avail[i].end}
                        onChange={(e) =>
                          setAvail((a) =>
                            a.map((d, idx) => (idx === i ? { ...d, end: e.target.value } : d))
                          )
                        }
                        className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm [color-scheme:dark]"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/[0.05] space-y-2">
              <p className="text-sm text-gray-400">Block specific dates</p>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={addingBlockDate}
                  onChange={(e) => setAddingBlockDate(e.target.value)}
                  className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white text-sm [color-scheme:dark]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (addingBlockDate && !blockedDates.includes(addingBlockDate)) {
                      setBlockedDates((d) => [...d, addingBlockDate].sort())
                      setAddingBlockDate("")
                    }
                  }}
                  className="bg-white/[0.06] hover:bg-white/[0.1] text-white text-sm font-medium px-4 py-2 rounded-xl transition-all"
                >
                  Block
                </button>
              </div>
              {blockedDates.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {blockedDates.map((d) => (
                    <span
                      key={d}
                      className="flex items-center gap-1.5 bg-red-900/20 border border-red-500/20 text-red-400 text-xs px-3 py-1.5 rounded-lg"
                    >
                      {d}
                      <button
                        onClick={() => setBlockedDates((prev) => prev.filter((x) => x !== d))}
                        className="hover:text-red-200"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={saveAvailability}
              disabled={availSaving}
              className="w-full bg-purple-600/80 hover:bg-purple-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all"
            >
              {availSaving ? "Saving..." : availSaved ? "Saved ✓" : "Save Availability"}
            </button>
            {availError && (
              <p className="text-xs text-red-400 text-center">{availError}</p>
            )}
          </Section>

          {/* Stripe info */}
          <Section title="Stripe Connection">
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${
              host.stripe_publishable_key
                ? "bg-green-900/10 border-green-500/20"
                : "bg-red-900/10 border-red-500/20"
            }`}>
              <span className="text-xl">
                {host.stripe_publishable_key ? "✅" : "⚠️"}
              </span>
              <div>
                <p className={`text-sm font-medium ${host.stripe_publishable_key ? "text-green-400" : "text-red-400"}`}>
                  {host.stripe_publishable_key ? "Stripe connected" : "Stripe not connected"}
                </p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {host.stripe_publishable_key
                    ? "Call payments go directly to your Stripe account"
                    : "Add your Stripe keys to accept call payments"}
                </p>
              </div>
            </div>
            {!host.stripe_publishable_key && (
              <p className="text-xs text-gray-600">
                To update your Stripe keys, contact support or complete the onboarding flow again.
              </p>
            )}
          </Section>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all"
          >
            {saving ? "Saving..." : saved ? "Saved ✓" : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-2">{label}</label>
      <input
        type="text" value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white"
      />
    </div>
  )
}
