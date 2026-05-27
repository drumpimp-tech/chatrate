"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { SERVICE_TYPES, formatCurrency } from "@/lib/utils"

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
}

export default function SettingsPage() {
  const [host, setHost] = useState<Host | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState<Host | null>(null)

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
  }, [])

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

  return (
    <div className="min-h-screen bg-[#050505]">
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold">
          Chat<span className="text-purple-500">Rate</span>
        </span>
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
              chatrate-app.netlify.app/book/{host.username}
            </p>
          </div>

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
