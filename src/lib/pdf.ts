import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

// Build a clean, branded transcript PDF and return it as a base64 string
// (ready to attach to a Resend email). Pure JS — safe on serverless.
export async function generateTranscriptPdf(opts: {
  transcriptText: string
  consultantName: string
  clientName: string
  serviceType: string
  durationMinutes: number
  dateStr: string
}): Promise<string> {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)

  const PAGE_W = 612
  const PAGE_H = 792
  const MARGIN = 56
  const MAX_W = PAGE_W - MARGIN * 2
  const purple = rgb(0.486, 0.227, 0.929) // #7c3aed
  const dark = rgb(0.067, 0.067, 0.067)
  const gray = rgb(0.42, 0.45, 0.5)

  let page = doc.addPage([PAGE_W, PAGE_H])
  let y = PAGE_H - MARGIN

  const wrap = (text: string, size: number, f = font): string[] => {
    const out: string[] = []
    for (const rawLine of text.split("\n")) {
      const words = rawLine.split(/\s+/)
      let line = ""
      for (const w of words) {
        const test = line ? `${line} ${w}` : w
        if (f.widthOfTextAtSize(test, size) > MAX_W && line) {
          out.push(line)
          line = w
        } else {
          line = test
        }
      }
      out.push(line)
    }
    return out
  }

  const draw = (text: string, size: number, color = dark, f = font, gap = 4) => {
    for (const line of wrap(text, size, f)) {
      if (y < MARGIN + 24) {
        page = doc.addPage([PAGE_W, PAGE_H])
        y = PAGE_H - MARGIN
      }
      page.drawText(line, { x: MARGIN, y, size, font: f, color })
      y -= size + gap
    }
  }

  // Header
  page.drawText("ChatRate", { x: MARGIN, y, size: 24, font: bold, color: purple })
  y -= 30
  draw("Call Transcript", 16, dark, bold, 10)
  y -= 6

  // Meta
  const meta = [
    ["Consultant", opts.consultantName],
    ["Client", opts.clientName],
    ["Service", opts.serviceType],
    ["Date", opts.dateStr],
    ["Duration", `${opts.durationMinutes} min`],
  ]
  for (const [label, value] of meta) {
    if (y < MARGIN + 24) { page = doc.addPage([PAGE_W, PAGE_H]); y = PAGE_H - MARGIN }
    page.drawText(`${label}:`, { x: MARGIN, y, size: 11, font: bold, color: gray })
    page.drawText(value, { x: MARGIN + 90, y, size: 11, font, color: dark })
    y -= 18
  }

  // Divider
  y -= 6
  page.drawRectangle({ x: MARGIN, y, width: MAX_W, height: 1, color: rgb(0.9, 0.9, 0.92) })
  y -= 22

  // Transcript body
  draw(opts.transcriptText || "(No transcript was captured for this call.)", 11, dark, font, 5)

  const bytes = await doc.save()
  return Buffer.from(bytes).toString("base64")
}
