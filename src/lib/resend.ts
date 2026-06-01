import { Resend } from "resend"
import { formatCurrency } from "./utils"
import { generateTranscriptPdf } from "./pdf"

const resend = new Resend(process.env.RESEND_API_KEY)
const HOST_EMAIL = process.env.HOST_EMAIL!
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

const FROM = "ChatRate <noreply@chatrate-app.com>"

// ── Shared, email-client-safe building blocks ────────────────────────────────
const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"

function row(label: string, value: string, opts: { highlight?: boolean; accent?: string } = {}) {
  const valColor = opts.accent || (opts.highlight ? "#7c3aed" : "#111827")
  const valSize = opts.highlight ? "18px" : "15px"
  return `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f3;color:#6b7280;font-size:14px;">${label}</td>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f3;color:${valColor};font-size:${valSize};font-weight:700;text-align:right;">${value}</td>
    </tr>`
}

function shell(opts: {
  preheader: string
  eyebrow: string
  heading: string
  rowsHtml: string
  ctaLabel?: string
  ctaUrl?: string
  footnote?: string
  extraHtml?: string
}) {
  return `
  <div style="background:#f4f4f7;margin:0;padding:24px 0;font-family:${FONT};">
    <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${opts.preheader}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;">
      <tr><td style="padding:0 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
          <tr><td style="background:#0a0a0a;padding:22px 32px;">
            <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Chat<span style="color:#a855f7;">Rate</span></span>
          </td></tr>
          <tr><td style="padding:32px;">
            <p style="margin:0 0 6px;color:#a855f7;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">${opts.eyebrow}</p>
            <h1 style="margin:0 0 24px;color:#111827;font-size:24px;line-height:1.25;font-weight:800;">${opts.heading}</h1>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${opts.rowsHtml}</table>
            ${opts.extraHtml || ""}
            ${
              opts.ctaLabel && opts.ctaUrl
                ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 0;"><tr><td style="border-radius:10px;background:#7c3aed;">
                     <a href="${opts.ctaUrl}" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:10px;">${opts.ctaLabel}</a>
                   </td></tr></table>`
                : ""
            }
            ${
              opts.footnote
                ? `<p style="margin:28px 0 0;color:#9ca3af;font-size:13px;line-height:1.6;">${opts.footnote}</p>`
                : ""
            }
          </td></tr>
        </table>
        <p style="text-align:center;color:#9ca3af;font-size:12px;margin:18px 0 0;">ChatRate · Expert consultations, paid by the call</p>
      </td></tr>
    </table>
  </div>`
}

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
  consultantName,
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
  consultantName?: string
}) {
  const priceText =
    pricingModel === "flat" ? `${formatCurrency(rate)} flat rate` : `${formatCurrency(rate)}/min`
  const consultant = consultantName || "your consultant"

  const rowsHtml =
    row("Consultant", consultant) +
    row("Service", serviceType) +
    (scheduledAt ? row("Date &amp; time", new Date(scheduledAt).toLocaleString()) : "") +
    row("Rate", priceText) +
    (transcriptOptedIn ? row("Transcript", `${formatCurrency(transcriptFee)} (opted in)`) : "")

  await resend.emails.send({
    from: FROM,
    to: clientEmail,
    subject: `Your call with ${consultant} is confirmed ✓`,
    html: shell({
      preheader: `Your ${serviceType} session with ${consultant} is booked.`,
      eyebrow: "Booking confirmed",
      heading: `You're booked, ${clientName}!`,
      rowsHtml,
      ctaLabel: "Join Call Room →",
      ctaUrl: roomUrl,
      footnote:
        "Your card is securely saved and will only be charged after the call ends. No charge happens before your session.",
    }),
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
    pricingModel === "flat" ? `${formatCurrency(rate)} flat rate` : `${formatCurrency(rate)}/min`

  const timeChangeAlert = originalScheduledAt
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;"><tr><td style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:14px 16px;">
         <p style="margin:0 0 4px;color:#c2410c;font-weight:700;font-size:14px;">⚠️ Client requested a different time</p>
         <p style="margin:0;color:#9a3412;font-size:13px;">Originally scheduled: ${new Date(originalScheduledAt).toLocaleString()}</p>
       </td></tr></table>`
    : ""

  const rowsHtml =
    row("Client", clientName) +
    row("Email", clientEmail) +
    row(
      originalScheduledAt ? "Requested time" : "Scheduled",
      new Date(scheduledAt).toLocaleString(),
      originalScheduledAt ? { accent: "#ea580c" } : {}
    ) +
    row("Service", serviceType) +
    row("Rate", priceText) +
    row("Transcript", transcriptOptedIn ? "Yes (opted in)" : "No")

  await resend.emails.send({
    from: FROM,
    to: hostEmail || HOST_EMAIL,
    subject: `${originalScheduledAt ? "⚠️ Time change — " : ""}New booking: ${clientName} — ${serviceType}`,
    html: shell({
      preheader: `${clientName} booked ${serviceType}.`,
      eyebrow: "New booking",
      heading: `${clientName} just booked you`,
      extraHtml: timeChangeAlert,
      rowsHtml,
      ctaLabel: "View Dashboard →",
      ctaUrl: `${APP_URL}/dashboard`,
    }),
  })
}

export async function sendPostCallReceipt({
  clientName,
  clientEmail,
  serviceType,
  durationSeconds,
  amountCharged,
  transcriptText,
  consultantName,
}: {
  clientName: string
  clientEmail: string
  serviceType: string
  durationSeconds: number
  amountCharged: number
  transcriptText?: string | null
  consultantName?: string
}) {
  const minutes = Math.ceil(durationSeconds / 60)
  const consultant = consultantName || "your consultant"
  const dateStr = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const rowsHtml =
    row("Consultant", consultant) +
    row("Service", serviceType) +
    row("Date", dateStr) +
    row("Duration", `${minutes} min`) +
    row("Total charged", formatCurrency(amountCharged), { highlight: true })

  // If a transcript exists, attach it as a clean PDF rather than inlining it.
  const attachments: { filename: string; content: string }[] = []
  let transcriptNote = ""
  if (transcriptText) {
    try {
      const pdfBase64 = await generateTranscriptPdf({
        transcriptText,
        consultantName: consultant,
        clientName,
        serviceType,
        durationMinutes: minutes,
        dateStr,
      })
      const safeName = consultant.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")
      attachments.push({ filename: `ChatRate-Transcript-${safeName}.pdf`, content: pdfBase64 })
      transcriptNote = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;"><tr><td style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:10px;padding:16px 20px;">
        <p style="margin:0;color:#7c3aed;font-weight:700;font-size:14px;">📄 Your full call transcript is attached as a PDF.</p>
      </td></tr></table>`
    } catch (err) {
      // PDF generation must never block the receipt — fall back to inline text.
      console.error("Transcript PDF generation failed:", err)
      transcriptNote = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;"><tr><td style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:10px;padding:20px;">
        <p style="margin:0 0 10px;color:#7c3aed;font-weight:700;font-size:14px;">Call transcript</p>
        <p style="margin:0;color:#374151;white-space:pre-wrap;font-size:14px;line-height:1.6;">${transcriptText}</p>
      </td></tr></table>`
    }
  }

  await resend.emails.send({
    from: FROM,
    to: clientEmail,
    subject: `Receipt — your call with ${consultant}`,
    html: shell({
      preheader: `Receipt for your ${serviceType} session: ${formatCurrency(amountCharged)}.`,
      eyebrow: "Payment receipt",
      heading: `Thanks, ${clientName} — call complete`,
      rowsHtml,
      extraHtml: transcriptNote,
      footnote: `This charge appears on your statement under ${consultant}. Questions? Just reply to this email.`,
    }),
    ...(attachments.length ? { attachments } : {}),
  })
}
