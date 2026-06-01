import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "The Best Clarity.fm Alternative in 2026",
  description:
    "ChatRate is the Clarity.fm alternative that keeps 100% of your earnings. No 15% platform cut. No monthly fees. Direct Stripe payouts. $4.99 one-time to activate.",
  openGraph: {
    title: "The Best Clarity.fm Alternative in 2026 — ChatRate",
    description:
      "No platform cut. No monthly fees. Direct Stripe payouts. Your booking page, live in 10 minutes.",
    url: "https://chatrate-app.com/clarity-alternative",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Best Clarity.fm Alternative — ChatRate",
    description: "Keep 100% of your earnings. No 15% Clarity cut. $4.99 one-time.",
  },
  alternates: {
    canonical: "https://chatrate-app.com/clarity-alternative",
  },
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the best alternative to Clarity.fm?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ChatRate is the top Clarity.fm alternative for experts who want to keep 100% of their earnings. Unlike Clarity, which takes 15% of every call, ChatRate charges a one-time $4.99 activation fee and takes zero cut. Payments go directly to your Stripe account.",
      },
    },
    {
      "@type": "Question",
      name: "Does ChatRate take a percentage of my calls like Clarity.fm?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. ChatRate takes 0% of your call revenue. You pay $4.99 once to activate your booking page, and every dollar your clients pay goes directly to your Stripe account. Clarity.fm takes 15% of every call.",
      },
    },
    {
      "@type": "Question",
      name: "How is ChatRate different from Clarity.fm?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ChatRate differs from Clarity.fm in three key ways: (1) Zero platform cut vs. Clarity's 15%, (2) One-time $4.99 fee with no ongoing revenue share, (3) Direct Stripe integration so you control your own payments instantly.",
      },
    },
    {
      "@type": "Question",
      name: "Can I charge per minute like Clarity.fm?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. ChatRate supports per-minute billing with a live cost ticker visible to both you and your client during the call. You set the rate; ChatRate auto-charges via Stripe when the call ends. You can also offer flat-rate sessions.",
      },
    },
    {
      "@type": "Question",
      name: "Is ChatRate free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ChatRate charges a one-time $4.99 activation fee to make your booking page public. There are no monthly fees, no subscriptions, and no revenue share. The only ongoing cost is Stripe's standard 2.9% + 30¢ per transaction.",
      },
    },
  ],
}

const rows = [
  { label: "Platform cut per call", chatrate: "0% — you keep everything", clarity: "15% of every call", win: "chatrate" },
  { label: "Monthly fee", chatrate: "$0 forever", clarity: "$0", win: "tie" },
  { label: "Activation cost", chatrate: "$4.99 one-time", clarity: "Free", win: "tie" },
  { label: "Payment destination", chatrate: "Direct to your Stripe (instant)", clarity: "Clarity holds funds, pays out later", win: "chatrate" },
  { label: "Billing models", chatrate: "Per-minute + flat rate", clarity: "Per-minute only", win: "chatrate" },
  { label: "Video calls", chatrate: "HD video via Daily.co", clarity: "Audio + video", win: "tie" },
  { label: "Transcript add-on", chatrate: "Yes — optional, client pays", clarity: "No", win: "chatrate" },
  { label: "Marketplace discovery", chatrate: "No — direct link sharing", clarity: "Yes — expert marketplace", win: "clarity" },
]

const features = [
  { icon: "⚡", title: "Your own booking page", desc: "A public page at chatrate-app.com/book/yourname. Share it anywhere — bio, email, website." },
  { icon: "⏱", title: "Per-minute or flat rate", desc: "Set a per-minute rate with a live cost ticker, or charge a flat fee per session. Your call." },
  { icon: "💳", title: "Direct Stripe payouts", desc: "Money hits your Stripe account the moment the call ends. We never touch it." },
  { icon: "📹", title: "HD video calls", desc: "Powered by Daily.co. No downloads, no plugins — works in any browser." },
  { icon: "📝", title: "Transcript add-on", desc: "Offer clients a written transcript for an extra fee. Automatically captured and delivered." },
  { icon: "🚫", title: "Zero subscriptions", desc: "$4.99 one-time to activate. No monthly bill. No lock-in." },
]

const faqs = [
  {
    q: "Does ChatRate take a percentage like Clarity.fm?",
    a: "No. ChatRate takes 0% of your call revenue. You pay $4.99 once to activate your booking page, and every dollar your clients pay goes directly to your Stripe. Clarity.fm takes 15% of every call.",
  },
  {
    q: "How is ChatRate different from Clarity.fm?",
    a: "Three key differences: (1) Zero platform cut vs. Clarity's 15%. (2) Direct Stripe integration — you control your own money. (3) Both per-minute and flat-rate billing.",
  },
  {
    q: "Does Clarity have a marketplace? Does ChatRate?",
    a: "Clarity.fm has a searchable expert marketplace. ChatRate does not — you share your link directly. For most experts, the 15% Clarity takes is far more than any discovery benefit is worth.",
  },
  {
    q: "Can I charge per minute like Clarity.fm?",
    a: "Yes. ChatRate supports per-minute billing with a live cost ticker visible during the call. You set the rate; ChatRate auto-charges via Stripe when the call ends.",
  },
  {
    q: "Is ChatRate free?",
    a: "One-time $4.99 to activate your public page. No monthly fees, no subscriptions, no revenue share. The only ongoing cost is Stripe's standard 2.9% + 30¢ per transaction.",
  },
]

export default function ClarityAlternativePage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <Link href="/" className="font-bold text-lg">⚡ ChatRate</Link>
        <Link
          href="/signup"
          className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all"
        >
          Get your page →
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 text-green-400 text-sm mb-8">
          Clarity.fm Alternative
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
          The expert call platform that keeps{" "}
          <span className="text-purple-500">all your money.</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          ChatRate is the Clarity.fm alternative where you keep 100% of your call earnings.
          No 15% platform cut. No monthly fees. Just your Stripe account and your clients.
        </p>
        <Link
          href="/signup"
          className="inline-block bg-purple-600 hover:bg-purple-500 text-white font-bold px-10 py-4 rounded-xl transition-all hover:scale-[1.02] text-lg"
        >
          Get your booking page — $4.99 one-time →
        </Link>
        <p className="text-gray-600 text-sm mt-4">No subscriptions · No revenue share · Your Stripe, your money</p>
      </section>

      {/* Comparison table */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <p className="text-center text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">Head-to-head comparison</p>
        <h2 className="text-3xl font-bold text-center mb-3">ChatRate vs. Clarity.fm</h2>
        <p className="text-center text-gray-400 mb-10">See exactly where the money goes on each platform.</p>

        <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left p-4 text-gray-400 font-medium">Feature</th>
                <th className="p-4 text-left bg-purple-600/10 border-x border-purple-500/20 text-purple-300 font-bold">ChatRate ⚡</th>
                <th className="p-4 text-left text-gray-400 font-medium">Clarity.fm</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-white/[0.04] last:border-0">
                  <td className="p-4 text-gray-400">{row.label}</td>
                  <td className={`p-4 bg-purple-600/5 border-x border-purple-500/10 font-medium ${row.win === "chatrate" ? "text-green-400" : "text-gray-300"}`}>
                    {row.chatrate}
                  </td>
                  <td className={`p-4 ${row.win === "clarity" ? "text-green-400" : row.win === "chatrate" ? "text-red-400" : "text-gray-400"}`}>
                    {row.clarity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Math block */}
        <div className="mt-10 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8">
          <h3 className="text-lg font-bold mb-6">💰 What 10 calls at $100/hr actually earns you</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-3 font-bold">Clarity.fm</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Gross (10 × $100)</span><span>$1,000</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Clarity takes (15%)</span><span className="text-red-400">−$150</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Stripe (~3%)</span><span className="text-red-400">−$30</span></div>
                <div className="flex justify-between border-t border-white/10 pt-2 font-bold"><span>You keep</span><span>$820</span></div>
              </div>
            </div>
            <div>
              <p className="text-purple-400 text-xs uppercase tracking-wider mb-3 font-bold">ChatRate</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Gross (10 × $100)</span><span>$1,000</span></div>
                <div className="flex justify-between"><span className="text-gray-400">ChatRate takes (0%)</span><span className="text-green-400">−$0</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Stripe (~3%)</span><span className="text-red-400">−$30</span></div>
                <div className="flex justify-between border-t border-white/10 pt-2 font-bold"><span>You keep</span><span className="text-green-400">$970</span></div>
              </div>
            </div>
          </div>
          <p className="text-center text-green-400 font-bold mt-6 text-sm">
            You earn $150 more with ChatRate — break-even vs. $4.99 fee after just 1 call.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 py-8">
        <p className="text-center text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">What you get</p>
        <h2 className="text-3xl font-bold text-center mb-3">Everything you need. Nothing you don't.</h2>
        <p className="text-center text-gray-400 mb-10">Built for experts who value their time — and their income.</p>
        <div className="grid md:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-purple-500/30 transition-colors">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-bold mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <p className="text-center text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">FAQ</p>
        <h2 className="text-3xl font-bold text-center mb-10">Common questions</h2>
        <div className="space-y-0 divide-y divide-white/[0.06]">
          {faqs.map((faq) => (
            <div key={faq.q} className="py-6">
              <h3 className="font-bold mb-2">{faq.q}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="inline-block bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-bold px-4 py-2 rounded-xl mb-6">
          $4.99 one-time · No monthly fees · No platform cut
        </div>
        <h2 className="text-4xl font-bold mb-4">Ready to stop sharing your income with Clarity?</h2>
        <p className="text-gray-400 mb-10 text-lg">Get your ChatRate booking page live in under 10 minutes. Keep every dollar you earn.</p>
        <Link
          href="/signup"
          className="inline-block bg-purple-600 hover:bg-purple-500 text-white font-bold px-10 py-4 rounded-xl transition-all hover:scale-[1.02] text-lg"
        >
          Get your page →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-gray-600 text-sm">
        © {new Date().getFullYear()} ChatRate ·{" "}
        <Link href="/" className="hover:text-gray-400 transition-colors">Home</Link>{" · "}
        <Link href="/guide" className="hover:text-gray-400 transition-colors">Setup Guide</Link>
      </footer>
    </div>
  )
}
