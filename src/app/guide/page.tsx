import type { Metadata } from "next"
import { Logo } from "@/components/Logo"
import Link from "next/link"

export const metadata: Metadata = {
  title: "How to Set Up Your Expert Booking Page",
  description:
    "Step-by-step guide to getting your ChatRate expert consultation page live in under 10 minutes. Connect Stripe, set your rates, and start charging for calls.",
  openGraph: {
    title: "How to Set Up Your Expert Booking Page — ChatRate Guide",
    description:
      "Connect Stripe, set your rates, go live in 10 minutes. ChatRate setup guide.",
    url: "https://chatrate-app.com/guide",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Set Up Your Expert Booking Page — ChatRate Guide",
    description: "Connect Stripe, set your rates, go live in 10 minutes.",
  },
  alternates: {
    canonical: "https://chatrate-app.com/guide",
  },
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "When do I get paid?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Stripe charges the client the moment the call ends. Funds appear in your Stripe balance instantly and are paid out on your normal Stripe payout schedule (usually 2 business days for US accounts).",
      },
    },
    {
      "@type": "Question",
      name: "What happens if a client doesn't show up?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "If you join and the client doesn't, you can end the call after a few minutes. For per-minute pricing, the client is charged for those minutes. For flat rate, the full amount is charged.",
      },
    },
    {
      "@type": "Question",
      name: "Can I change my rate after going live?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — update your rate any time from the Settings page in your dashboard. New bookings will use the updated rate. Existing confirmed bookings keep the rate that was set at booking time.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use test Stripe keys first?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Use pk_test_ and sk_test_ keys from your Stripe dashboard to run the full booking flow with no real money. Switch to live keys from your dashboard Settings when ready.",
      },
    },
    {
      "@type": "Question",
      name: "Is my Stripe secret key safe?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Your secret key is encrypted at rest in our database, is never included in API responses, and is only used server-side to initiate charges on your behalf. It never leaves our server.",
      },
    },
    {
      "@type": "Question",
      name: "What if I want to refund a client?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Log in to your Stripe dashboard and issue a refund from the Payments section. Stripe will return the funds to the client's card.",
      },
    },
    {
      "@type": "Question",
      name: "Do calls require any browser plugins?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Daily.co runs entirely in the browser using WebRTC. Chrome, Firefox, Safari, and Edge all work. Mobile browsers work too.",
      },
    },
  ],
}

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Set Up a Paid Expert Booking Page with ChatRate",
  description:
    "Get your ChatRate expert booking page live in under 10 minutes. Connect Stripe, set your rates, and start charging clients for calls.",
  totalTime: "PT10M",
  estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "4.99" },
  step: [
    { "@type": "HowToStep", position: 1, name: "Sign up free", text: "Create your ChatRate account in 60 seconds." },
    { "@type": "HowToStep", position: 2, name: "Set your rates", text: "Choose flat rate or per-minute billing and set your price." },
    { "@type": "HowToStep", position: 3, name: "Paste your Stripe keys", text: "Connect your Stripe account by entering your API keys. Payments go straight to your Stripe." },
    { "@type": "HowToStep", position: 4, name: "Pay once and go live", text: "Pay the one-time $4.99 activation fee to make your booking page public." },
  ],
}

const Section = ({ id, children }: { id: string; children: React.ReactNode }) => (
  <section id={id} className="scroll-mt-20">{children}</section>
)

const Step = ({ n, title, children }: { n: number; title: string; children: React.ReactNode }) => (
  <div className="flex gap-4">
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 text-sm font-bold mt-0.5">
      {n}
    </div>
    <div className="flex-1 pb-6 border-b border-white/[0.05] last:border-0">
      <h4 className="text-white font-semibold mb-2">{title}</h4>
      <div className="text-gray-400 text-sm space-y-2">{children}</div>
    </div>
  </div>
)

const LiveLink = ({ href, label, note }: { href: string; label: string; note?: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1.5 bg-white/[0.04] border border-white/10 hover:border-purple-500/40 hover:bg-purple-600/10 text-purple-400 hover:text-purple-300 text-xs font-mono px-3 py-1.5 rounded-lg transition-all group"
  >
    <span className="text-gray-500 group-hover:text-purple-400 transition-colors">↗</span>
    {label}
    {note && <span className="text-gray-600 font-sans">{note}</span>}
  </a>
)

const KeyBox = ({ label, example, desc }: { label: string; example: string; desc: string }) => (
  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 flex flex-col gap-1">
    <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
    <span className="font-mono text-purple-400 text-sm">{example}</span>
    <span className="text-xs text-gray-600">{desc}</span>
  </div>
)

const Callout = ({ icon, color, children }: { icon: string; color: string; children: React.ReactNode }) => (
  <div className={`rounded-xl p-4 text-sm flex gap-3 ${color}`}>
    <span className="flex-shrink-0 text-base">{icon}</span>
    <div>{children}</div>
  </div>
)

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4 sticky top-0 z-50 bg-[#050505]/90 backdrop-blur">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Logo size={52} />
          <Link
            href="/onboarding"
            className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
          >
            Start Onboarding →
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12 flex gap-12">
        {/* Sidebar TOC */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-28 space-y-1">
            <p className="text-xs uppercase tracking-widest text-gray-600 mb-4">On this page</p>
            {[
              { id: "overview", label: "Overview" },
              { id: "stripe", label: "1 · Stripe" },
              { id: "pricing", label: "2 · Set Your Rates" },
              { id: "daily", label: "3 · Video Calls" },
              { id: "go-live", label: "4 · Go Live" },
              { id: "pricing-strategy", label: "Pricing Strategy" },
              { id: "managing-bookings", label: "Managing Bookings" },
              { id: "faq", label: "FAQ" },
            ].map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className="block text-sm text-gray-500 hover:text-white py-1 transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 max-w-3xl space-y-16">

          {/* Hero */}
          <Section id="overview">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-purple-600/10 border border-purple-500/20 text-purple-400 text-xs font-medium px-3 py-1.5 rounded-full">
                ⚡ Expert Setup Guide
              </div>
              <h1 className="text-4xl font-bold leading-tight">
                Get your ChatRate page<br />
                <span className="text-purple-400">live in under 10 minutes</span>
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed">
                ChatRate connects your expertise to paying clients through video calls. You bring the knowledge — we handle booking, payments, and calls. Here&apos;s everything you need to set up.
              </p>
            </div>

            {/* What you need checklist */}
            <div className="mt-8 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">What you&apos;ll need</h3>
              <div className="space-y-3">
                {[
                  { icon: "💳", label: "A Stripe account", sub: "Free — processes your call payments directly", done: false },
                  { icon: "📧", label: "Your email address", sub: "For your ChatRate login and client notifications", done: false },
                  { icon: "📝", label: "A short bio", sub: "What you do + why clients should book you", done: false },
                  { icon: "💰", label: "Your rate", sub: "Flat fee or per-minute pricing", done: false },
                  { icon: "💵", label: "$4.99 one-time fee", sub: "Unlocks your public booking page", done: false },
                ].map(({ icon, label, sub }) => (
                  <div key={label} className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0">{icon}</span>
                    <div>
                      <p className="text-white text-sm font-medium">{label}</p>
                      <p className="text-gray-600 text-xs">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* STRIPE */}
          <Section id="stripe">
            <div className="space-y-2 mb-8">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-blue-600/20 border border-blue-500/30 rounded-lg flex items-center justify-center text-base">💳</span>
                <h2 className="text-2xl font-bold">1 · Connect Stripe</h2>
              </div>
              <p className="text-gray-400">
                Stripe processes all call payments directly into your account. ChatRate never touches your money — every charge goes straight to you.
              </p>
            </div>

            <Callout icon="🔒" color="bg-blue-900/10 border border-blue-500/20 text-blue-300">
              <p>Your Stripe keys are <strong>encrypted at rest</strong> in our database and never exposed in API responses. Only your server-side requests to Stripe use them.</p>
            </Callout>

            <div className="mt-6 space-y-0">
              <Step n={1} title="Create or log in to your Stripe account">
                <p>If you don&apos;t have a Stripe account, create one for free. No monthly fees — Stripe only charges when you get paid.</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <LiveLink href="https://stripe.com/register" label="stripe.com/register" note=" — Create account" />
                  <LiveLink href="https://dashboard.stripe.com" label="dashboard.stripe.com" note=" — Log in" />
                </div>
              </Step>

              <Step n={2} title="Activate your Stripe account">
                <p>Before you can accept live payments, Stripe requires identity and business verification. This takes about 5 minutes.</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <LiveLink href="https://dashboard.stripe.com/account/onboarding" label="Complete Stripe verification" />
                </div>
                <Callout icon="💡" color="bg-amber-900/10 border border-amber-500/20 text-amber-300 mt-3">
                  <p>You can use <strong>test keys</strong> (pk_test_ / sk_test_) to try ChatRate first — no real money moves. Switch to live keys when ready to charge clients.</p>
                </Callout>
              </Step>

              <Step n={3} title="Open your Stripe API Keys page">
                <p>This is where you&apos;ll find both keys needed for ChatRate onboarding.</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <LiveLink href="https://dashboard.stripe.com/apikeys" label="dashboard.stripe.com/apikeys" note=" — Your keys are here" />
                </div>
              </Step>

              <Step n={4} title="Copy your Publishable Key">
                <p>This is safe to share — it&apos;s used on the client side to tokenize cards. It starts with <code className="bg-white/[0.06] px-1.5 py-0.5 rounded text-purple-400 text-xs">pk_live_</code> or <code className="bg-white/[0.06] px-1.5 py-0.5 rounded text-purple-400 text-xs">pk_test_</code>.</p>
              </Step>

              <Step n={5} title="Copy your Secret Key">
                <p>This is used server-side to charge cards after calls. <strong>Never share this publicly.</strong> It starts with <code className="bg-white/[0.06] px-1.5 py-0.5 rounded text-purple-400 text-xs">sk_live_</code> or <code className="bg-white/[0.06] px-1.5 py-0.5 rounded text-purple-400 text-xs">sk_test_</code>.</p>
                <p className="mt-1">Click <strong>Reveal live key</strong> in the Stripe dashboard to see the full key, then copy it.</p>
              </Step>
            </div>

            {/* Key reference */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <KeyBox
                label="Publishable Key"
                example="pk_live_51..."
                desc="Safe to use on client side. Enter this in ChatRate Step 4."
              />
              <KeyBox
                label="Secret Key"
                example="sk_live_51..."
                desc="Server-side only. Keep private. Enter this in ChatRate Step 4."
              />
            </div>

            <Callout icon="⚠️" color="bg-red-900/10 border border-red-500/20 text-red-300 mt-4">
              <p>Never paste your secret key anywhere public — not in chat, not in emails, not in GitHub. Only enter it into the ChatRate onboarding form.</p>
            </Callout>

            {/* Stripe fee breakdown */}
            <div className="mt-6 bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
              <h4 className="text-sm font-semibold text-gray-400 mb-3">Stripe fee structure</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Standard card processing</span>
                  <span className="text-white font-medium">2.9% + 30¢ per charge</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">International cards</span>
                  <span className="text-white font-medium">+1.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Monthly fee</span>
                  <span className="text-green-400 font-medium">$0 — none</span>
                </div>
                <div className="border-t border-white/[0.06] pt-2 text-xs text-gray-600">
                  Example: a $60 call → Stripe takes ~$2.04 → you keep ~$57.96
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <LiveLink href="https://stripe.com/pricing" label="Stripe pricing details" />
              <LiveLink href="https://stripe.com/docs/keys" label="Stripe API key docs" />
              <LiveLink href="https://dashboard.stripe.com/balance" label="Your Stripe balance" />
              <LiveLink href="https://dashboard.stripe.com/payouts" label="Stripe payout settings" />
            </div>
          </Section>

          {/* PRICING */}
          <Section id="pricing">
            <div className="space-y-2 mb-8">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-green-600/20 border border-green-500/30 rounded-lg flex items-center justify-center text-base">💰</span>
                <h2 className="text-2xl font-bold">2 · Set Your Rates</h2>
              </div>
              <p className="text-gray-400">
                ChatRate supports two pricing models. You can change your rates any time from your dashboard.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-3">
                <div className="text-2xl">⏱</div>
                <h3 className="font-bold text-white">Per Minute</h3>
                <p className="text-gray-400 text-sm">Client is charged based on actual call duration. The meter starts when both parties join and stops when the call ends.</p>
                <div className="bg-white/[0.03] rounded-xl p-3 text-sm space-y-1">
                  <div className="flex justify-between text-gray-400">
                    <span>Your rate</span><span className="text-white font-mono">$2.00/min</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>30-min call</span><span className="text-white">$60.00</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>60-min call</span><span className="text-white">$120.00</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600">Best for open-ended advice, coaching, and support calls where duration varies.</p>
              </div>

              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-3">
                <div className="text-2xl">📋</div>
                <h3 className="font-bold text-white">Flat Rate</h3>
                <p className="text-gray-400 text-sm">Client pays a fixed price for the call regardless of how long it runs. Charge happens at the end of the call.</p>
                <div className="bg-white/[0.03] rounded-xl p-3 text-sm space-y-1">
                  <div className="flex justify-between text-gray-400">
                    <span>Your rate</span><span className="text-white font-mono">$75 flat</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>15-min call</span><span className="text-white">$75.00</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>60-min call</span><span className="text-white">$75.00</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600">Best for structured sessions like strategy calls, reviews, or fixed-scope consultations.</p>
              </div>
            </div>

            <div className="mt-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <h4 className="text-sm font-semibold text-gray-400 mb-3">Transcript add-on</h4>
              <p className="text-sm text-gray-400">You can offer clients a written transcript of the call for an additional fee. They opt in during booking. Set it to $0 to disable entirely.</p>
              <div className="mt-3 flex items-center gap-4 text-sm">
                <span className="text-gray-500">Suggested range:</span>
                <span className="text-white font-medium">$5 – $25</span>
              </div>
            </div>
          </Section>

          {/* VIDEO CALLS */}
          <Section id="daily">
            <div className="space-y-2 mb-8">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-purple-600/20 border border-purple-500/30 rounded-lg flex items-center justify-center text-base">📹</span>
                <h2 className="text-2xl font-bold">3 · Video Calls</h2>
              </div>
              <p className="text-gray-400">
                ChatRate uses Daily.co for high-quality video and audio. No setup required on your end — rooms are created automatically when a booking is confirmed.
              </p>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <div className="text-3xl font-bold text-green-400">Free</div>
                  <div className="text-xs text-gray-500 mt-1">Monthly platform fee</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl font-bold text-green-400">10K</div>
                  <div className="text-xs text-gray-500 mt-1">Free participant-minutes/month</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl font-bold text-green-400">~83hrs</div>
                  <div className="text-xs text-gray-500 mt-1">Of 1-on-1 calls per month free</div>
                </div>
              </div>
              <div className="border-t border-white/[0.06] pt-4 text-sm text-gray-500">
                After the free tier: $0.00045/participant-minute. A 60-min call with 2 participants = 120 minutes = $0.054. Effectively free unless you&apos;re running hundreds of hours monthly.
              </div>
            </div>

            <div className="mt-6 space-y-0">
              <Step n={1} title="Booking triggers room creation">
                <p>When a client confirms a booking, ChatRate automatically creates a private Daily.co room and emails both of you the join link.</p>
              </Step>
              <Step n={2} title="Join from your dashboard">
                <p>Go to your dashboard, find the upcoming booking, and click <strong>Join Call</strong>. Your client gets the same link by email.</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <LiveLink href="/dashboard" label="Your Dashboard" />
                </div>
              </Step>
              <Step n={3} title="Live cost ticker runs during the call">
                <p>For per-minute pricing, you&apos;ll see a live timer and running dollar total on screen. Stripe charges the client the moment you end the call.</p>
              </Step>
              <Step n={4} title="Transcripts (optional)">
                <p>If the client opted in at booking, Daily.co captures a transcript automatically. It&apos;s emailed to them after the call and stored in your dashboard.</p>
              </Step>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <LiveLink href="https://daily.co" label="daily.co" note=" — Video platform" />
              <LiveLink href="https://docs.daily.co/guides/products/video-calling" label="Daily.co call quality guide" />
              <LiveLink href="https://dashboard.daily.co" label="Daily.co dashboard" />
            </div>
          </Section>

          {/* GO LIVE */}
          <Section id="go-live">
            <div className="space-y-2 mb-8">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-emerald-600/20 border border-emerald-500/30 rounded-lg flex items-center justify-center text-base">🚀</span>
                <h2 className="text-2xl font-bold">4 · Go Live</h2>
              </div>
              <p className="text-gray-400">
                Once onboarding is complete, your public booking page is live at <code className="text-purple-400">chatrate-app.com/book/your-username</code>.
              </p>
            </div>

            <div className="space-y-0">
              <Step n={1} title="Complete the 4-step onboarding">
                <p>Choose your username → fill in your profile → set your rates → add Stripe keys → pay $4.99 activation.</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <LiveLink href="/onboarding" label="Start Onboarding" />
                </div>
              </Step>
              <Step n={2} title="Toggle availability on">
                <p>From your dashboard, flip the availability toggle to <strong>Open</strong>. While toggled off, your booking page shows a &ldquo;not accepting bookings&rdquo; message.</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <LiveLink href="/dashboard" label="Go to Dashboard" />
                </div>
              </Step>
              <Step n={3} title="Share your booking link">
                <p>Copy your link and add it to your social bio, email signature, website, or anywhere you promote your services.</p>
                <div className="mt-3 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 font-mono text-purple-400 text-sm">
                  chatrate-app.com/book/<span className="text-white">your-username</span>
                </div>
              </Step>
              <Step n={4} title="Get notified of bookings">
                <p>When a client books, you get an email immediately with their details, the scheduled time, and the call room link.</p>
              </Step>
            </div>

            {/* Cost summary */}
            <div className="mt-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <h4 className="text-sm font-semibold text-gray-400 mb-4">Complete cost summary</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">ChatRate activation</span>
                  <span className="text-white font-bold">$4.99 one-time</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">ChatRate monthly fee</span>
                  <span className="text-green-400 font-bold">$0 forever</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Stripe processing</span>
                  <span className="text-white font-medium">2.9% + 30¢ per charge</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Daily.co video</span>
                  <span className="text-green-400 font-medium">Free up to ~83 hrs/month</span>
                </div>
                <div className="border-t border-white/[0.06] pt-3 text-xs text-gray-600">
                  After free video tier: $0.00045/participant-minute (~$0.054 per 60-min call)
                </div>
              </div>
            </div>
          </Section>

          {/* PRICING STRATEGY */}
          <Section id="pricing-strategy">
            <div className="space-y-2 mb-8">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-amber-600/20 border border-amber-500/30 rounded-lg flex items-center justify-center text-base">🧠</span>
                <h2 className="text-2xl font-bold">How to Price Your Consulting Sessions</h2>
              </div>
              <p className="text-gray-400">
                Setting the right rate is one of the most important decisions you&apos;ll make. Too low and clients undervalue your time. Too high and they bounce before booking. Here&apos;s how to find your number.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-3">
                <h3 className="font-bold text-white">The anchor principle: what is your hourly worth?</h3>
                <p className="text-gray-400 text-sm">Start with what you charge for a full hour of work. Set your per-minute rate as <strong className="text-white">hourly ÷ 60</strong>. If you bill $120/hr, that&apos;s $2/min — a rate clients understand because short calls stay affordable and long calls feel fair.</p>
                <div className="bg-white/[0.03] rounded-xl p-4 grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <div className="text-white font-bold text-lg">$1/min</div>
                    <div className="text-gray-500 text-xs">$60/hr equivalent</div>
                    <div className="text-gray-600 text-xs mt-1">Early-career / niche skills</div>
                  </div>
                  <div>
                    <div className="text-purple-400 font-bold text-lg">$2–3/min</div>
                    <div className="text-gray-500 text-xs">$120–180/hr equivalent</div>
                    <div className="text-gray-600 text-xs mt-1">Most experts start here</div>
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg">$5+/min</div>
                    <div className="text-gray-500 text-xs">$300+/hr equivalent</div>
                    <div className="text-gray-600 text-xs mt-1">C-suite / specialized domain</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-3">
                <h3 className="font-bold text-white">Flat rate vs. per-minute: which is right for you?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-purple-400 font-semibold mb-2">Choose flat rate if:</p>
                    <ul className="space-y-1 text-gray-400">
                      <li>• You run structured sessions (strategy, audits, reviews)</li>
                      <li>• You want predictable income per session</li>
                      <li>• Clients ask &ldquo;how much for 30 minutes?&rdquo;</li>
                      <li>• You&apos;re newer and want simplicity</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-purple-400 font-semibold mb-2">Choose per-minute if:</p>
                    <ul className="space-y-1 text-gray-400">
                      <li>• You do open-ended advice or support calls</li>
                      <li>• Call durations vary widely</li>
                      <li>• Clients are familiar with metered billing</li>
                      <li>• You want to maximize revenue on long calls</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-3">
                <h3 className="font-bold text-white">Raise your rate before you think you&apos;re ready</h3>
                <p className="text-gray-400 text-sm">If 80%+ of people who view your page are booking, you&apos;re priced too low. The right rate has some drop-off — it filters for clients who take your time seriously. If you haven&apos;t raised your rate in 6 months and you&apos;re fully booked, raise it by 25%.</p>
              </div>
            </div>
          </Section>

          {/* MANAGING BOOKINGS */}
          <Section id="managing-bookings">
            <div className="space-y-2 mb-8">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-blue-600/20 border border-blue-500/30 rounded-lg flex items-center justify-center text-base">📅</span>
                <h2 className="text-2xl font-bold">Managing Client Bookings Online</h2>
              </div>
              <p className="text-gray-400">
                Once you&apos;re live, your dashboard is your command center. Here&apos;s how to run a smooth client operation without juggling multiple tools.
              </p>
            </div>

            <div className="space-y-0">
              <Step n={1} title="Set your availability before sharing your link">
                <p>Toggle availability to <strong>Open</strong> only when you&apos;re ready to accept new bookings. Toggle off when you&apos;re traveling or fully booked. Clients see a &ldquo;not accepting bookings&rdquo; message — no awkward emails needed.</p>
              </Step>
              <Step n={2} title="Confirm the booking details in your email notification">
                <p>Every new booking triggers an email with the client&apos;s name, scheduled time, and call room link. Add the time to your calendar immediately.</p>
              </Step>
              <Step n={3} title="Join from the dashboard on call day">
                <p>Go to your ChatRate dashboard and click <strong>Join Call</strong> from the upcoming booking card. The room is already created — no setup required on the day.</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <LiveLink href="/dashboard" label="Go to Dashboard" />
                </div>
              </Step>
              <Step n={4} title="Reschedule when needed">
                <p>Use the reschedule button on any upcoming booking card to set a new time. The booking updates in place — no need to cancel and re-book.</p>
              </Step>
              <Step n={5} title="Toggle availability off between busy weeks">
                <p>If you don&apos;t want surprise bookings during a project sprint, toggle off at the start of the week and back on when your calendar has room.</p>
              </Step>
            </div>

            <div className="mt-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <h4 className="text-sm font-semibold text-gray-400 mb-3">Pro workflow tips</h4>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex gap-3">
                  <span className="text-purple-400 flex-shrink-0">→</span>
                  <p><strong className="text-white">Put your booking link in your email signature.</strong> Every outbound email becomes a soft offer to book time with you.</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-purple-400 flex-shrink-0">→</span>
                  <p><strong className="text-white">Mention your rate in your bio.</strong> Transparent pricing filters out tire-kickers. Clients who book are pre-qualified.</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-purple-400 flex-shrink-0">→</span>
                  <p><strong className="text-white">Use flat-rate for first calls.</strong> New clients hesitate at open-ended billing. A fixed intro call removes friction. Switch to per-minute for returning clients who know your value.</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-purple-400 flex-shrink-0">→</span>
                  <p><strong className="text-white">Enable transcripts.</strong> Clients who pay for a transcript are more engaged — they&apos;re investing in the outcome. It also cuts follow-up emails asking you to repeat advice.</p>
                </div>
              </div>
            </div>
          </Section>

          {/* FAQ */}
          <Section id="faq">
            <div className="space-y-2 mb-8">
              <h2 className="text-2xl font-bold">FAQ</h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "When do I get paid?",
                  a: "Stripe charges the client the moment the call ends (or when you click End Call). Funds appear in your Stripe balance instantly and are paid out on your normal Stripe payout schedule (usually 2 business days for US accounts)."
                },
                {
                  q: "What happens if a client doesn't show up?",
                  a: "If you join and the client doesn't, you can end the call after a few minutes. For per-minute pricing, the client is charged for those minutes. For flat rate, the full amount is charged. We recommend setting clear no-show policies in your bio."
                },
                {
                  q: "Can I change my rate after going live?",
                  a: "Yes — update your rate any time from the Settings page in your dashboard. New bookings will use the updated rate. Existing confirmed bookings keep the rate that was set at booking time."
                },
                {
                  q: "Can I use test Stripe keys first?",
                  a: "Yes. Use pk_test_ and sk_test_ keys from your Stripe dashboard to run the full booking flow with no real money. Switch to live keys from your dashboard Settings when you're ready to go live."
                },
                {
                  q: "Is my Stripe secret key safe?",
                  a: "Your secret key is encrypted at rest in our database, is never included in API responses, and is only used server-side to initiate charges on your behalf. It never leaves our server."
                },
                {
                  q: "Can I offer calls in a currency other than USD?",
                  a: "Currently ChatRate prices in USD. If your Stripe account is set to a different default currency, Stripe handles the conversion automatically."
                },
                {
                  q: "What if I want to refund a client?",
                  a: "Log in to your Stripe dashboard and issue a refund from the Payments section. Stripe will return the funds to the client's card. ChatRate doesn't currently have a built-in refund UI."
                },
                {
                  q: "Do calls require any browser plugins?",
                  a: "No. Daily.co runs entirely in the browser using WebRTC. Chrome, Firefox, Safari, and Edge all work. Mobile browsers work too, though a desktop or laptop gives the best experience."
                },
              ].map(({ q, a }) => (
                <details key={q} className="group bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none text-white font-medium text-sm hover:text-purple-300 transition-colors">
                    {q}
                    <span className="text-gray-600 group-open:rotate-180 transition-transform">▾</span>
                  </summary>
                  <div className="px-5 pb-4 text-sm text-gray-400 leading-relaxed">
                    {a}
                  </div>
                </details>
              ))}
            </div>
          </Section>

          {/* CTA */}
          <div className="bg-gradient-to-br from-purple-900/20 to-purple-600/10 border border-purple-500/20 rounded-2xl p-8 text-center space-y-4">
            <h2 className="text-2xl font-bold">Ready to start earning?</h2>
            <p className="text-gray-400">Your booking page can be live in under 10 minutes.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/onboarding"
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-xl transition-all"
              >
                Activate for $4.99 →
              </Link>
              <a
                href="https://dashboard.stripe.com/apikeys"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-white/10 hover:border-white/20 text-gray-300 hover:text-white font-medium px-6 py-3 rounded-xl transition-all"
              >
                Get Stripe Keys First ↗
              </a>
            </div>
            <p className="text-gray-600 text-xs">One-time payment · No monthly fees · Cancel availability any time</p>
          </div>

          {/* Quick links footer */}
          <div className="border-t border-white/[0.05] pt-8 pb-4">
            <p className="text-xs text-gray-600 mb-4 uppercase tracking-wider">All links in one place</p>
            <div className="flex flex-wrap gap-2">
              <LiveLink href="https://stripe.com/register" label="Create Stripe account" />
              <LiveLink href="https://dashboard.stripe.com/apikeys" label="Stripe API keys" />
              <LiveLink href="https://dashboard.stripe.com/account/onboarding" label="Stripe verification" />
              <LiveLink href="https://stripe.com/pricing" label="Stripe pricing" />
              <LiveLink href="https://dashboard.stripe.com/balance" label="Stripe balance" />
              <LiveLink href="https://dashboard.stripe.com/payouts" label="Stripe payouts" />
              <LiveLink href="https://daily.co" label="Daily.co" />
              <LiveLink href="https://dashboard.daily.co" label="Daily.co dashboard" />
              <LiveLink href="/onboarding" label="Start onboarding" />
              <LiveLink href="/dashboard" label="Your dashboard" />
              <LiveLink href="/privacy" label="Privacy policy" />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
