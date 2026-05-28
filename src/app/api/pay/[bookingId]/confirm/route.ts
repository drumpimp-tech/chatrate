import { createAdminClient } from "@/lib/supabase/server"
import { createDailyRoom } from "@/lib/daily"
import {
  sendBookingConfirmationToClient,
  sendBookingNotificationToHost,
} from "@/lib/resend"
import Stripe from "stripe"

// POST /api/pay/[bookingId]/confirm — client submits payment for a host-created invite
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

    // Get booking + host
    const { data: booking, error: bookingErr } = await admin
      .from("bookings")
      .select("*, hosts(*)")
      .eq("id", bookingId)
      .single()

    if (bookingErr || !booking) throw new Error("Booking not found")
    if (booking.status !== "invited") throw new Error("This invite has already been used")

    const host = booking.hosts
    if (!host?.stripe_secret_key) throw new Error("Host Stripe not connected")

    const hostStripe = new Stripe(host.stripe_secret_key, {
      apiVersion: "2026-04-22.dahlia" as const,
    })

    // Create Stripe customer and attach payment method
    const customer = await hostStripe.customers.create({
      name: clientName,
      email: clientEmail,
      metadata: { source: "chatrate_invite", hostUsername: host.username, bookingId },
    })

    await hostStripe.paymentMethods.attach(paymentMethodId, { customer: customer.id })
    await hostStripe.customers.update(customer.id, {
      invoice_settings: { default_payment_method: paymentMethodId },
    })

    // Create Daily.co room
    const { url: dailyRoomUrl, name: dailyRoomName } = await createDailyRoom(bookingId)

    // Update booking with client info, payment method, room, and status
    await admin
      .from("bookings")
      .update({
        client_name: clientName,
        client_email: clientEmail,
        transcript_opted_in: transcriptOptedIn,
        transcript_fee: transcriptOptedIn ? host.transcript_fee : 0,
        stripe_customer_id: customer.id,
        stripe_payment_method_id: paymentMethodId,
        daily_room_url: dailyRoomUrl,
        daily_room_name: dailyRoomName,
        status: "confirmed",
      })
      .eq("id", bookingId)

    // Send confirmation emails
    await Promise.allSettled([
      sendBookingConfirmationToClient({
        clientName,
        clientEmail,
        serviceType: booking.service_type,
        scheduledAt: booking.scheduled_at,
        pricingModel: booking.pricing_model,
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
        pricingModel: booking.pricing_model,
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
