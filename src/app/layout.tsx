import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://chatrate-app.com"),
  title: {
    default: "ChatRate — Get Paid for Every Call. No Platform Cut.",
    template: "%s — ChatRate",
  },
  description:
    "ChatRate gives you a personal booking page where clients pay to talk to you. Per-minute or flat rate. $4.99 one-time, no monthly fees, no platform cut. Direct to your Stripe.",
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
    title: "ChatRate — Get Paid for Every Call. No Platform Cut.",
    description:
      "Your expert booking page, live in 10 minutes. Per-minute or flat rate. $4.99 one-time, no platform cut.",
    url: "https://chatrate-app.com",
    siteName: "ChatRate",
    images: [{ url: "/icon.png", width: 1254, height: 1254, alt: "ChatRate — Get paid for every call" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChatRate — Get Paid for Every Call. No Platform Cut.",
    description: "Your expert booking page, live in 10 minutes. $4.99 one-time, no platform cut.",
    images: ["/icon.png"],
  },
  verification: {
    google: "w-AaLzIMx32tGV-aOy9lseAANo9mCeQyudqe0mYaKzI",
  },
}

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ChatRate",
  url: "https://chatrate-app.com",
  logo: "https://chatrate-app.com/icon.png",
  description:
    "ChatRate gives experts a personal booking page where clients pay to talk to you. Set your rate, share your link, get paid via Stripe. Per-minute or flat rate. One-time $4.99, no monthly fees.",
}

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ChatRate",
  url: "https://chatrate-app.com",
}

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ChatRate",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://chatrate-app.com",
  description:
    "Expert booking platform for paid video calls. Pay-per-minute or flat rate. No platform cut. Direct Stripe payouts. $4.99 one-time activation.",
  offers: {
    "@type": "Offer",
    price: "4.99",
    priceCurrency: "USD",
    description: "One-time activation fee. No monthly fees. No revenue share.",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
      </head>
      <body className="min-h-screen bg-[#050505] text-white antialiased">
        {children}
      </body>
    </html>
  )
}
