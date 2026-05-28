import { createAdminClient } from "@/lib/supabase/server"
import { getDailyRoomTranscript } from "@/lib/daily"
import { sendPostCallReceipt } from "@/lib/resend"
import Stripe from "stripe"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const admin = await createAdminClient()
    const { data, error } = await admin
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    return Response.json(data)
  } catch (e) {
    console.error(e)
    return Response.json({ error: "Booking not found" }, { status: 404 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await req.json()
    const admin = await createAdminClient()

    // If ending the call, handle payment + transcript
    if (body.status === "completed" && body.ended_at) {
      const { data: booking } = await admin
        .from("bookings")
        .select("*, hosts(stripe_secret_key, display_name)")
        .eq("id", id)
        .single()

      if (!booking) throw new Error("Booking not found")

      const startedAt = new Date(booking.started_at || body.started_at)
      const endedAt = new Date(body.ended_at)
      const durationSeconds = Math.round(
        (endedAt.getTime() - startedAt.getTime()) / 1000
      )

      const hostStripeKey = booking.hosts?.stripe_secret_key
      let totalCharged = 0

      // ── GROUP SESSION: charge each participant ──────────────────────
      if (booking.is_group) {
        const { data: participants } = await admin
          .from("booking_participants")
          .select("*")
          .eq("booking_id", id)

        if (participants && participants.length > 0 && hostStripeKey) {
          const hostStripe = new Stripe(hostStripeKey, {
            apiVersion: "2026-04-22.dahlia" as const,
          })

          for (const p of participants) {
            let amount = 0
            if (booking.pricing_model === "flat") {
              amount = booking.rate
            } else {
              const minutes = Math.ceil(durationSeconds / 60)
              amount = booking.rate * minutes
            }

            if (amount > 0 && p.stripe_customer_id && p.stripe_payment_method_id) {
              try {
                await hostStripe.paymentIntents.create({
                  amount: Math.round(amount * 100),
                  currency: "usd",
                  customer: p.stripe_customer_id,
                  payment_method: p.stripe_payment_method_id,
                  off_session: true,
                  confirm: true,
                  description: `ChatRate group: ${booking.service_type} — ${Math.ceil(durationSeconds / 60)} min`,
                  metadata: { bookingId: id, participantId: p.id },
                })

                // Mark participant as charged
                await admin
                  .from("booking_participants")
                  .update({ amount_charged: amount, charged_at: new Date().toISOString() })
                  .eq("id", p.id)

                totalCharged += amount

                // Send individual receipt
                await sendPostCallReceipt({
                  clientName: p.client_name,
                  clientEmail: p.client_email,
                  serviceType: booking.service_type,
                  durationSeconds,
                  amountCharged: amount,
                  transcriptText: null,
                }).catch(console.error)
              } catch (chargeErr) {
                console.error(`Failed to charge participant ${p.id}:`, chargeErr)
              }
            }
          }
        }
      } else {
        // ── 1-ON-1: charge the single client ───────────────────────────
        let amountCharged = 0
        if (booking.pricing_model === "flat") {
          amountCharged = booking.rate
        } else {
          const minutes = Math.ceil(durationSeconds / 60)
          amountCharged = booking.rate * minutes
        }

        if (booking.transcript_opted_in) {
          amountCharged += booking.transcript_fee
        }

        if (amountCharged > 0 && booking.stripe_customer_id && hostStripeKey) {
          const hostStripe = new Stripe(hostStripeKey, {
            apiVersion: "2026-04-22.dahlia" as const,
          })
          await hostStripe.paymentIntents.create({
            amount: Math.round(amountCharged * 100),
            currency: "usd",
            customer: booking.stripe_customer_id,
            payment_method: booking.stripe_payment_method_id,
            off_session: true,
            confirm: true,
            description: `ChatRate: ${booking.service_type} — ${Math.ceil(durationSeconds / 60)} min`,
            metadata: { bookingId: id },
          })
        }

        totalCharged = amountCharged

        // Fetch transcript if opted in
        let transcriptText: string | null = null
        if (booking.transcript_opted_in && booking.daily_room_name) {
          transcriptText = await getDailyRoomTranscript(booking.daily_room_name)
        }

        await sendPostCallReceipt({
          clientName: booking.client_name,
          clientEmail: booking.client_email,
          serviceType: booking.service_type,
          durationSeconds,
          amountCharged: totalCharged,
          transcriptText,
        }).catch(console.error)
      }

      // Update booking record
      const { data: updated, error } = await admin
        .from("bookings")
        .update({
          status: "completed",
          ended_at: body.ended_at,
          started_at: booking.started_at || body.started_at,
          duration_seconds: durationSeconds,
          amount_charged: totalCharged,
        })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return Response.json(updated)
    }

    // General update (e.g., started_at, status)
    const { data, error } = await admin
      .from("bookings")
      .update(body)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return Response.json(data)
  } catch (e: unknown) {
    console.error(e)
    const msg = e instanceof Error ? e.message : "Update failed"
    return Response.json({ error: msg }, { status: 500 })
  }
}
