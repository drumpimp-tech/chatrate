import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "ChatRate — Expert Consultations, On Your Terms",
  description:
    "Book a one-on-one call with an expert. Pay per minute or flat rate. Transcripts available.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#050505] text-white antialiased">
        {children}
      </body>
    </html>
  )
}
