import type { Metadata } from "next"
import { createAdminClient } from "@/lib/supabase/server"
import { format } from "date-fns"

export async function generateMetadata(
  { params }: { params: Promise<{ bookingId: string }> }
): Promise<Metadata> {
  const { bookingId } = await params

  try {
    const admin = await createAdminClient()

    const { data: booking } = await admin
      .from("bookings")
      .select("service_type, rate, pricing_model, scheduled_at, host_id")
      .eq("id", bookingId)
      .single()

    if (!booking) return defaultMeta()

    const { data: host } = await admin
      .from("hosts")
      .select("display_name, avatar_url")
      .eq("id", booking.host_id)
      .single()

    const hostName = host?.display_name || "Your consultant"
    const service = booking.service_type
    const rate = booking.pricing_model === "flat"
      ? `$${booking.rate} flat`
      : `$${booking.rate}/min`
    const dateStr = booking.scheduled_at
      ? format(new Date(booking.scheduled_at), "EEEE, MMMM d · h:mm a")
      : "Time TBD"

    const title = `${hostName} invited you — ${service}`
    const description = `${dateStr} · ${rate} · Confirm your session on ChatRate`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        siteName: "ChatRate",
        images: host?.avatar_url
          ? [{ url: host.avatar_url, width: 400, height: 400, alt: hostName }]
          : [{ url: "https://chatrate-app.com/og-image.png", width: 1200, height: 630 }],
      },
      twitter: {
        card: "summary",
        title,
        description,
        images: host?.avatar_url ? [host.avatar_url] : [],
      },
    }
  } catch {
    return defaultMeta()
  }
}

function defaultMeta(): Metadata {
  return {
    title: "You're invited — ChatRate",
    description: "Confirm your session and save your card. You'll only be charged after the call.",
  }
}

export default function PayLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
