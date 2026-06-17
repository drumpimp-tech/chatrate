import Link from "next/link"
import { Logo } from "@/components/Logo"

const steps = [
  { n: "1", title: "Sign up free", desc: "Create your account in 60 seconds." },
  { n: "2", title: "Set your rates", desc: "Choose flat rate or per-minute. Set a transcript add-on if you want." },
  { n: "3", title: "Connect your Stripe account", desc: "Enter your own Stripe API keys. Payments go straight to your Stripe — we never access your funds or take a cut." },
  { n: "4", title: "Pay once — own it forever", desc: "One-time $4.99 to activate. No subscriptions, no monthly fees." },
]

const useCases = [
  { icon: "🎵", label: "Music critique" },
  { icon: "💼", label: "Business consulting" },
  { icon: "⚖️", label: "Legal advice" },
  { icon: "🎙️", label: "Podcast coaching" },
  { icon: "💻", label: "Tech support" },
  { icon: "📈", label: "Career coaching" },
  { icon: "🏋️", label: "Fitness coaching" },
  { icon: "✍️", label: "Writing feedback" },
  { icon: "🎨", label: "Art critique" },
  { icon: "🧠", label: "Life coaching" },
  { icon: "🏠", label: "Real estate advice" },
  { icon: "📱", label: "Social media strategy" },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <Logo size={52} />
        <div className="flex items-center gap-3">
          <Link href="/guide" className="text-sm text-gray-400 hover:text-white transition-colors">
            Guide
          </Link>
          <Link href="/signup" className="text-sm text-gray-400 hover:text-white transition-colors">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all"
          >
            Get your page →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 text-purple-400 text-sm mb-8">
          ⚡ One-time $4.99 — own it forever
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
          Charge for your time.<br />
          <span className="text-purple-500">On every call.</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          ChatRate gives you a personal booking page where clients pay to talk to you.
          Set your rate, share your link, get paid. That's it.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/signup"
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-10 py-4 rounded-xl transition-all hover:scale-[1.02] text-lg"
          >
            Get your ChatRate page →
          </Link>
        </div>
        <p className="text-gray-600 text-sm mt-4">
          $4.99 one-time · No monthly fees
        </p>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-10">Up and running in 5 minutes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s) => (
            <div key={s.n} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold mb-4">
                {s.n}
              </div>
              <h3 className="font-semibold mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-center mb-8">Works for any expert</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {useCases.map((u) => (
            <div
              key={u.label}
              className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center hover:border-purple-500/30 transition-colors"
            >
              <div className="text-2xl mb-1">{u.icon}</div>
              <div className="text-xs text-gray-400">{u.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-br from-purple-900/30 to-purple-600/10 border border-purple-500/20 rounded-3xl p-10 text-center max-w-lg mx-auto">
          <div className="text-5xl font-bold mb-2">
            $4.99
          </div>
          <div className="text-gray-400 mb-8">one-time · no subscriptions · ever</div>
          <ul className="text-left space-y-3 mb-10 max-w-xs mx-auto">
            {[
              "Your own /book/username page",
              "Per-minute or flat rate calls",
              "Live video/audio via Daily.co",
              "Auto-charge via your Stripe",
              "Transcript add-on for clients",
              "Earnings dashboard",
              "Unlimited bookings",
            ].map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm">
                <span className="text-green-400 font-bold">✓</span>
                <span className="text-gray-300">{f}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/signup"
            className="block w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.02] text-lg"
          >
            Get your page for $4.99 →
          </Link>
          <p className="text-gray-600 text-xs mt-4">
            Payments go directly to your Stripe. We never take a cut of your calls.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-gray-600 text-sm space-y-2">
        <div>© {new Date().getFullYear()} ChatRate · Built for experts who value their time.</div>
        <div className="flex items-center justify-center gap-4">
          <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
        </div>
      </footer>
    </div>
  )
}
