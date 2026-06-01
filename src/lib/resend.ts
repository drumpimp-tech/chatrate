import { Resend } from "resend"
import { formatCurrency } from "./utils"

const resend = new Resend(process.env.RESEND_API_KEY)
const HOST_EMAIL = process.env.HOST_EMAIL!
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

export async function sendBookingConfirmationToClient({
  clientName,
  clientEmail,
  serviceType,
  scheduledAt,
  pricingModel,
  rate,
  transcriptOptedIn,
  transcriptFee,
  roomUrl,
}: {
  clientName: string
  clientEmail: string
  serviceType: string
  scheduledAt: string
  pricingModel: "flat" | "per_minute"
  rate: number
  transcriptOptedIn: boolean
  transcriptFee: number
  roomUrl: string
}) {
  const priceText =
    pricingModel === "flat"
      ? `${formatCurrency(rate)} flat rate`
      : `${formatCurrency(rate)}/min`

  await resend.emails.send({
    from: "ChatRate <noreply@chatrate-app.com>",
    to: clientEmail,
    subject: "Your ChatRate call is confirmed ✓",
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 40px; border-radius: 12px;">
        <h1 style="color: #a855f7; margin-bottom: 4px;">ChatRate</h1>
        <p style="color: #888; margin-top: 0;">Expert consultations, on your schedule.</p>
        <hr style="border-color: #222; margin: 24px 0;" />
        <h2 style="margin-bottom: 8px;">Hi ${clientName}, your call is booked!</h2>
        <p style="color: #ccc;">Here are your booking details:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
          <tr><td style="color: #888; padding: 8px 0;">Service</td><td style="font-weight: bold;">${serviceType}</td></tr>
          <tr><td style="color: #888; padding: 8px 0;">Scheduled</td><td style="font-weight: bold;">${new Date(scheduledAt).toLocaleString()}</td></tr>
          <tr><td style="color: #888; padding: 8px 0;">Rate</td><td style="font-weight: bold;">${priceText}</td></tr>
          ${transcriptOptedIn ? `<tr><td style="color: #888; padding: 8px 0;">Transcript</td><td style="font-weight: bold;">${formatCurrency(transcriptFee)} (opted in)</td></tr>` : ""}
        </table>
        <a href="${roomUrl}" style="display: inline-block; background: #a855f7; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 8px 0;">
          Join Call Room →
        </a>
        <p style="color: #666; font-size: 13px; margin-top: 24px;">
          Your card has been saved and will only be charged after the call. No charge occurs until the session ends.
        </p>
      </div>
    `,
  })
}

export async function sendBookingNotificationToHost({
  clientName,
  clientEmail,
  serviceType,
  scheduledAt,
  originalScheduledAt,
  pricingModel,
  rate,
  transcriptOptedIn,
  hostEmail,
}: {
  clientName: string
  clientEmail: string
  serviceType: string
  scheduledAt: string
  originalScheduledAt?: string
  pricingModel: "flat" | "per_minute"
  rate: number
  transcriptOptedIn: boolean
  hostEmail?: string
}) {
  const priceText =
    pricingModel === "flat"
      ? `${formatCurrency(rate)} flat rate`
      : `${formatCurrency(rate)}/min`

  const timeChangeAlert = originalScheduledAt ? `
    <tr>
      <td colspan="2" style="padding: 10px 0;">
        <div style="background: #7c2d12; border: 1px solid #ea580c; border-radius: 8px; padding: 12px 16px;">
          <p style="color: #fdba74; font-weight: bold; margin: 0 0 6px;">⚠️ Client requested a different time</p>
          <p style="color: #888; margin: 0; font-size: 13px;">Originally scheduled: ${new Date(originalScheduledAt).toLocaleString()}</p>
        </div>
      </td>
    </tr>` : ""

  await resend.emails.send({
    from: "ChatRate <noreply@chatrate-app.com>",
    to: hostEmail || HOST_EMAIL,
    subject: `${originalScheduledAt ? "⚠️ Time change — " : ""}New booking: ${clientName} — ${serviceType}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 40px; border-radius: 12px;">
        <h1 style="color: #a855f7;">New ChatRate Booking</h1>
        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
          ${timeChangeAlert}
          <tr><td style="color: #888; padding: 8px 0;">Client</td><td style="font-weight: bold;">${clientName} (${clientEmail})</td></tr>
          <tr><td style="color: #888; padding: 8px 0;">Service</td><td style="font-weight: bold;">${serviceType}</td></tr>
          <tr><td style="color: #888; padding: 8px 0; color: ${originalScheduledAt ? "#fb923c" : "#888"};">
            ${originalScheduledAt ? "Requested time" : "Scheduled"}
          </td><td style="font-weight: bold; color: ${originalScheduledAt ? "#fb923c" : "#fff"};">${new Date(scheduledAt).toLocaleString()}</td></tr>
          <tr><td style="color: #888; padding: 8px 0;">Rate</td><td style="font-weight: bold;">${priceText}</td></tr>
          <tr><td style="color: #888; padding: 8px 0;">Transcript</td><td style="font-weight: bold;">${transcriptOptedIn ? "Yes (opted in)" : "No"}</td></tr>
        </table>
        <a href="${APP_URL}/dashboard" style="display: inline-block; background: #a855f7; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          View Dashboard →
        </a>
      </div>
    `,
  })
}

export async function sendPostCallReceipt({
  clientName,
  clientEmail,
  serviceType,
  durationSeconds,
  amountCharged,
  transcriptText,
}: {
  clientName: string
  clientEmail: string
  serviceType: string
  durationSeconds: number
  amountCharged: number
  transcriptText?: string | null
}) {
  const minutes = Math.ceil(durationSeconds / 60)

  await resend.emails.send({
    from: "ChatRate <noreply@chatrate-app.com>",
    to: clientEmail,
    subject: "ChatRate call receipt",
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 40px; border-radius: 12px;">
        <h1 style="color: #a855f7;">ChatRate</h1>
        <h2>Call Complete — Receipt</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
          <tr><td style="color: #888; padding: 8px 0;">Service</td><td style="font-weight: bold;">${serviceType}</td></tr>
          <tr><td style="color: #888; padding: 8px 0;">Duration</td><td style="font-weight: bold;">${minutes} min</td></tr>
          <tr><td style="color: #888; padding: 8px 0;">Charged</td><td style="font-weight: bold; color: #a855f7;">${formatCurrency(amountCharged)}</td></tr>
        </table>
        ${
          transcriptText
            ? `
          <div style="background: #111; border: 1px solid #222; border-radius: 8px; padding: 20px; margin-top: 24px;">
            <h3 style="margin-top: 0; color: #a855f7;">Call Transcript</h3>
            <p style="color: #ccc; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">${transcriptText}</p>
          </div>
        `
            : ""
        }
        <p style="color: #666; font-size: 13px; margin-top: 24px;">Thank you for using ChatRate.</p>
      </div>
    `,
  })
}
