import { createAdminClient } from "@/lib/supabase/server"
import { createDailyRoom } from "@/lib/daily"
import {
  sendBookingConfirmationToClient,
  sendBookingNotificationToHost,
} from "@/lib/resend"
import Stripe from "stripe"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params
  try {
    const body = await req.json()
    const { clientName, clientEmail, transcriptOptedIn, paymentMethodId } = body

    if (!clientName || !clientEmail) throw new Error("Name and email are required")
    if (!paymentMethodId) throw new Error("Missing payment method")

    const admin = await createAdminClient()

    const { data: booking, error: bookingErr } = await admin
      .from("bookings")
      .select("id, host_id, service_type, pricing_model, rate, transcript_fee, scheduled_at, status, daily_room_url, daily_room_name, is_group, max_seats")
      .eq("id", bookingId)
      .single()

    if (bookingErr || !booking) throw new Error("Booking not found")

    const { data: host, error: hostErr } = await admin
      .from("hosts")
      .select("id, username, stripe_secret_key, transcript_fee")
      .eq("id", booking.host_id)
      .single()

    if (hostErr || !host) throw new Error("Host not found")
    if (!host.stripe_secret_key) throw new Error("Host Stripe not connected")

    // ── GROUP SESSION ──────────────────────────────────────────────────
    if (booking.is_group) {
      if (booking.status === "cancelled") throw new Error("This session has been cancelled")

      // Check seats remaining
      const { count: taken } = await admin
        .from("booking_participants")
        .select("id", { count: "exact", head: true })
        .eq("booking_id", bookingId)

      if ((taken ?? 0) >= (booking.max_seats ?? 1)) {
        throw new Error("Sorry, this session is full")
      }

      const hostStripe = new Stripe(host.stripe_secret_key as string, {
        apiVersion: "2026-04-22.dahlia" as const,
      })

      const customer = await hostStripe.customers.create({
        name: clientName,
        email: clientEmail,
        metadata: { source: "chatrate_group", hostUsername: host.username, bookingId },
      })

      await hostStripe.paymentMethods.attach(paymentMethodId, { customer: customer.id })
      await hostStripe.customers.update(customer.id, {
        invoice_settings: { default_payment_method: paymentMethodId },
      })

      // Create room on first seat claim
      let roomUrl = booking.daily_room_url
      let roomName = booking.daily_room_name

      if (!roomUrl) {
        const room = await createDailyRoom(bookingId, booking.max_seats ?? 10)
        roomUrl = room.url
        roomName = room.name
        await admin.from("bookings").update({
          daily_room_url: roomUrl,
          daily_room_name: roomName,
          status: "confirmed",
        }).eq("id", bookingId)
      }

      // Add participant
      await admin.from("booking_participants").insert({
        booking_id: bookingId,
        client_name: clientName,
        client_email: clientEmail,
        stripe_customer_id: customer.id,
        stripe_payment_method_id: paymentMethodId,
      })

      // Send confirmation emails
      await Promise.allSettled([
        sendBookingConfirmationToClient({
          clientName,
          clientEmail,
          serviceType: booking.service_type,
          scheduledAt: booking.scheduled_at,
          pricingModel: booking.pricing_model as "flat" | "per_minute",
          rate: booking.rate,
          transcriptOptedIn: false,
          transcriptFee: 0,
          roomUrl,
        }),
        sendBookingNotificationToHost({
          clientName,
          clientEmail,
          serviceType: booking.service_type,
          scheduledAt: booking.scheduled_at,
          pricingModel: booking.pricing_model as "flat" | "per_minute",
          rate: booking.rate,
          transcriptOptedIn: false,
        }),
      ])

      return Response.json({ success: true, roomUrl })
    }

    // ── 1-ON-1 SESSION ─────────────────────────────────────────────────
    if (booking.status !== "invited") throw new Error("This invite has already been used")

    const hostStripe = new Stripe(host.stripe_secret_key as string, {
      apiVersion: "2026-04-22.dahlia" as const,
    })

    const customer = await hostStripe.customers.create({
      name: clientName,
      email: clientEmail,
      metadata: { source: "chatrate_invite", hostUsername: host.username, bookingId },
    })

    await hostStripe.paymentMethods.attach(paymentMethodId, { customer: customer.id })
    await hostStripe.customers.update(customer.id, {
      invoice_settings: { default_payment_method: paymentMethodId },
    })

    const { url: dailyRoomUrl, name: dailyRoomName } = await createDailyRoom(bookingId)

    await admin.from("bookings").update({
      client_name: clientName,
      client_email: clientEmail,
      transcript_opted_in: transcriptOptedIn,
      transcript_fee: transcriptOptedIn ? host.transcript_fee : 0,
      stripe_customer_id: customer.id,
      stripe_payment_method_id: paymentMethodId,
      daily_room_url: dailyRoomUrl,
      daily_room_name: dailyRoomName,
      status: "confirmed",
    }).eq("id", bookingId)

    await Promise.allSettled([
      sendBookingConfirmationToClient({
        clientName,
        clientEmail,
        serviceType: booking.service_type,
        scheduledAt: booking.scheduled_at,
        pricingModel: booking.pricing_model as "flat" | "per_minute",
        rate: booking.rate,
        transcriptOptedIn,
        transcriptFee: host.transcript_fee,
        roomUrl: dailyRoomUrl,
      }),
      sendBookingNotificationToHost({
        clientName,
        clientEmail,
        serviceType: booking.service_type,
        scheduledAt: booking.scheduled_at,
        pricingModel: booking.pricing_model as "flat" | "per_minute",
        rate: booking.rate,
        transcriptOptedIn,
      }),
    ])

    return Response.json({ success: true, roomUrl: dailyRoomUrl })
  } catch (e: unknown) {
    console.error(e)
    const msg = e instanceof Error ? e.message : "Confirmation failed"
    return Response.json({ error: msg }, { status: 500 })
  }
}
