import Link from "next/link"
import { Logo } from "@/components/Logo"

export const metadata = {
  title: "Terms of Service — ChatRate",
  description: "The terms and conditions governing your use of ChatRate.",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#050505]">
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between max-w-3xl mx-auto">
        <Logo />
        <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">← Home</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <p className="text-xs text-purple-400 font-semibold tracking-widest uppercase mb-3">Legal</p>
          <h1 className="text-4xl font-bold mb-3">Terms of Service</h1>
          <p className="text-gray-500 text-sm">Last updated: June 17, 2026</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-10 text-gray-300 leading-relaxed">

          <Section title="1. What ChatRate Is">
            <p>ChatRate is a self-serve booking platform that allows independent professionals (&ldquo;Experts&rdquo;) to create personal booking pages and charge clients for paid video or phone consultations. ChatRate is operated by Trevor Lawrence (<a href="mailto:drumpimp@gmail.com" className="text-purple-400 hover:text-purple-300">drumpimp@gmail.com</a>).</p>
            <p>ChatRate is not a financial institution, payment processor, or employer. We provide software infrastructure only. All payments are processed directly through each Expert&rsquo;s own Stripe account.</p>
          </Section>

          <Section title="2. Eligibility">
            <p>You must be at least 18 years old to use ChatRate. By creating an account you confirm that you are 18 or older and that the information you provide is accurate.</p>
          </Section>

          <Section title="3. Expert Accounts">
            <p>When you sign up as an Expert you agree to:</p>
            <ul>
              <li>Provide accurate profile information (name, bio, service type)</li>
              <li>Connect your own Stripe account by supplying your Stripe API keys. These keys remain yours — ChatRate stores them encrypted and uses them only to process payments from your clients to your Stripe account.</li>
              <li>Set rates and service terms that are honest and not misleading</li>
              <li>Deliver the consultations your clients book and pay for</li>
              <li>Comply with all applicable laws governing your profession or services</li>
            </ul>
            <p>You are an independent professional, not an employee or agent of ChatRate. You are solely responsible for the advice, information, or services you provide during calls.</p>
          </Section>

          <Section title="4. Client Bookings">
            <p>When a client books a call through your ChatRate page:</p>
            <ul>
              <li>Payment is collected via Stripe and held until the call concludes</li>
              <li>For per-minute calls, the client is charged based on actual call duration</li>
              <li>For flat-rate calls, the client is charged the Expert&rsquo;s stated fee</li>
              <li>ChatRate does not take a commission or percentage of any call payment</li>
            </ul>
          </Section>

          <Section title="5. Activation Fee">
            <p>Access to ChatRate requires a one-time activation fee of $4.99, payable to ChatRate via Stripe. This fee is non-refundable once your account is activated and your booking page is live.</p>
          </Section>

          <Section title="6. Prohibited Uses">
            <p>You may not use ChatRate to:</p>
            <ul>
              <li>Provide services that are illegal in your jurisdiction or the client&rsquo;s jurisdiction</li>
              <li>Impersonate any person or entity</li>
              <li>Engage in fraud, deception, or misleading conduct toward clients</li>
              <li>Collect or store client payment information outside of Stripe</li>
              <li>Violate any applicable professional licensing or regulatory requirements</li>
            </ul>
          </Section>

          <Section title="7. Stripe API Keys">
            <p>ChatRate requires Experts to provide their Stripe publishable and secret API keys to enable client payments. By providing these keys you confirm that:</p>
            <ul>
              <li>They are your own Stripe API keys for an account you own and control</li>
              <li>You authorize ChatRate to use them solely to process payments from your clients</li>
              <li>You will notify us immediately if your keys are compromised</li>
            </ul>
            <p>ChatRate stores your keys encrypted at rest and does not use them for any purpose other than processing payments on your behalf.</p>
          </Section>

          <Section title="8. Disclaimers">
            <p>ChatRate is provided &ldquo;as is&rdquo; without warranty of any kind. We do not guarantee uninterrupted availability of the platform, video call quality, or payment processing success in all circumstances.</p>
            <p>ChatRate is not responsible for the quality, legality, or outcome of any consultation conducted through the platform. Clients engage Experts at their own discretion.</p>
          </Section>

          <Section title="9. Limitation of Liability">
            <p>To the fullest extent permitted by law, ChatRate&rsquo;s total liability for any claim arising from your use of the platform is limited to the amount you paid to ChatRate in the 12 months preceding the claim ($4.99 for most users).</p>
            <p>ChatRate is not liable for indirect, incidental, special, consequential, or punitive damages of any kind.</p>
          </Section>

          <Section title="10. Termination">
            <p>You may close your account at any time by contacting <a href="mailto:drumpimp@gmail.com" className="text-purple-400 hover:text-purple-300">drumpimp@gmail.com</a>. We may suspend or terminate accounts that violate these Terms.</p>
          </Section>

          <Section title="11. Changes to These Terms">
            <p>We may update these Terms from time to time. Material changes will be communicated by updating the &ldquo;Last updated&rdquo; date above. Continued use of ChatRate after changes constitutes acceptance.</p>
          </Section>

          <Section title="12. Governing Law">
            <p>These Terms are governed by the laws of the State of California, without regard to conflict of law principles.</p>
          </Section>

          <Section title="13. Contact">
            <p>Questions about these Terms?</p>
            <p>
              <strong className="text-white">Trevor Lawrence</strong><br />
              <a href="mailto:drumpimp@gmail.com" className="text-purple-400 hover:text-purple-300">drumpimp@gmail.com</a><br />
              chatrate-app.com
            </p>
          </Section>

        </div>
      </div>

      <footer className="border-t border-white/5 py-8 text-center text-gray-600 text-sm space-y-2">
        <div>© {new Date().getFullYear()} ChatRate</div>
        <div className="flex items-center justify-center gap-4">
          <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
        </div>
      </footer>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-white/[0.06] pt-8">
      <h2 className="text-lg font-bold text-white mb-4">{title}</h2>
      <div className="space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_li]:text-gray-300">
        {children}
      </div>
    </div>
  )
}
