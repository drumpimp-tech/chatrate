import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://chatrate-app.netlify.app"),
  title: "ChatRate — Expert Consultations, On Your Terms",
  description:
    "Book a one-on-one call with an expert. Pay per minute or flat rate. Transcripts available.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "ChatRate — Expert Consultations, On Your Terms",
    description:
      "Book a one-on-one call with an expert. Pay per minute or flat rate.",
    url: "https://chatrate-app.netlify.app",
    siteName: "ChatRate",
    images: [{ url: "/icon.png", width: 1254, height: 1254, alt: "ChatRate" }],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "ChatRate",
    description: "Book & pay for expert calls. Per-minute or flat rate.",
    images: ["/icon.png"],
  },
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
