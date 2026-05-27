import { createAdminClient, createClient } from "@/lib/supabase/server"
import { createDailyRoom } from "@/lib/daily"
import {
  sendBookingConfirmationToClient,
  sendBookingNotificationToHost,
} from "@/lib/resend"
import Stripe from "stripe"

// GET /api/bookings — return bookings for the current authenticated host
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const admin = await createAdminClient()

    // Find this user's host record
    const { data: host } = await admin
      .from("hosts")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (!host) return Response.json([])

    const { data, error } = await admin
      .from("bookings")
      .select("*")
      .eq("host_id", host.id)
      .order("scheduled_at", { ascending: true })

    if (error) throw error
    return Response.json(data)
  } catch (e) {
    console.error(e)
    return Response.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}

// POST /api/bookings — create a new booking (called from public booking page)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      hostId,
      hostUsername,
      clientName,
      clientEmail,
      serviceType,
      scheduledAt,
      transcriptOptedIn,
      cardNumber,
      cardExpiry,
      cardCvc,
      cardName,
    } = body

    const admin = await createAdminClient()

    // Get host record (with their Stripe keys)
    const query = hostId
      ? admin.from("hosts").select("*").eq("id", hostId)
      : admin.from("hosts").select("*").eq("username", hostUsername)
    const { data: host } = await query.single()

    if (!host) throw new Error("Host not found")
    if (!host.is_available) throw new Error("Host is not accepting bookings")
    if (!host.is_activated) throw new Error("Host account is not active")
    if (!host.stripe_secret_key) throw new Error("Host has not connected Stripe")

    // Use the host's own Stripe keys for call payments
    const hostStripe = new Stripe(host.stripe_secret_key, {
      apiVersion: "2026-04-22.dahlia" as const,
    })

    // 1. Create Stripe customer + save card on file (using host's Stripe)
    const customer = await hostStripe.customers.create({
      name: clientName,
      email: clientEmail,
      metadata: { source: "chatrate", hostUsername: host.username },
    })

    const [expMonth, expYear] = cardExpiry.split("/")
    const paymentMethod = await hostStripe.paymentMethods.create({
      type: "card",
      card: {
        number: cardNumber.replace(/\s/g, ""),
        exp_month: parseInt(expMonth),
        exp_year: parseInt("20" + expYear),
        cvc: cardCvc,
      },
      billing_details: { name: cardName, email: clientEmail },
    })

    await hostStripe.paymentMethods.attach(paymentMethod.id, {
      customer: customer.id,
    })

    await hostStripe.customers.update(customer.id, {
      invoice_settings: { default_payment_method: paymentMethod.id },
    })

    // 2. Create booking record
    const { data: booking, error: bookingError } = await admin
      .from("bookings")
      .insert({
        host_id: host.id,
        client_name: clientName,
        client_email: clientEmail,
        service_type: serviceType,
        pricing_model: host.rate_type,
        rate: host.rate,
        transcript_opted_in: transcriptOptedIn,
        transcript_fee: transcriptOptedIn ? host.transcript_fee : 0,
        stripe_customer_id: customer.id,
        stripe_payment_method_id: paymentMethod.id,
        scheduled_at: scheduledAt,
        status: "confirmed",
      })
      .select()
      .single()

    if (bookingError) throw bookingError

    // 3. Create Daily.co room
    const { url: dailyRoomUrl, name: dailyRoomName } = await createDailyRoom(
      booking.id
    )

    // 4. Update booking with room info
    await admin
      .from("bookings")
      .update({ daily_room_url: dailyRoomUrl, daily_room_name: dailyRoomName })
      .eq("id", booking.id)

    // 5. Send emails (non-blocking)
    await Promise.allSettled([
      sendBookingConfirmationToClient({
        clientName,
        clientEmail,
        serviceType,
        scheduledAt,
        pricingModel: host.rate_type,
        rate: host.rate,
        transcriptOptedIn,
        transcriptFee: host.transcript_fee,
        roomUrl: dailyRoomUrl,
      }),
      sendBookingNotificationToHost({
        clientName,
        clientEmail,
        serviceType,
        scheduledAt,
        pricingModel: host.rate_type,
        rate: host.rate,
        transcriptOptedIn,
      }),
    ])

    return Response.json({ id: booking.id, roomUrl: dailyRoomUrl })
  } catch (e: unknown) {
    console.error(e)
    const msg = e instanceof Error ? e.message : "Booking failed"
    return Response.json({ error: msg }, { status: 500 })
  }
}
