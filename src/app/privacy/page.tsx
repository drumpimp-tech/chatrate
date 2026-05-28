import Link from "next/link"
import { Logo } from "@/components/Logo"

export const metadata = {
  title: "Privacy Policy — ChatRate",
  description: "How ChatRate collects, uses, and protects your personal information.",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#050505]">
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between max-w-3xl mx-auto">
        <Logo />
        <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">← Home</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <p className="text-xs text-purple-400 font-semibold tracking-widest uppercase mb-3">Legal</p>
          <h1 className="text-4xl font-bold mb-3">Privacy Policy</h1>
          <p className="text-gray-500 text-sm">Last updated: May 27, 2026</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-10 text-gray-300 leading-relaxed">

          <Section title="1. Who We Are">
            <p>ChatRate (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is operated by Trevor Lawrence
            (<a href="mailto:drumpimp@gmail.com" className="text-purple-400 hover:text-purple-300">drumpimp@gmail.com</a>).
            We provide a platform at <strong>chatrate-app.com</strong> that enables independent experts to receive paid
            video and phone consultations from clients.</p>
            <p>This policy explains what personal information we collect, why we collect it, how we use it, and your rights
            regarding that information.</p>
          </Section>

          <Section title="2. Information We Collect">
            <h3 className="text-white font-semibold mt-4 mb-2">From Experts (hosts who create a ChatRate page)</h3>
            <ul>
              <li><strong>Account info:</strong> email address and password (via Supabase Auth)</li>
              <li><strong>Profile info:</strong> display name, bio, username, and service type</li>
              <li><strong>Pricing settings:</strong> rate type, rate amount, and transcript fee</li>
              <li><strong>Stripe API keys:</strong> publishable and secret keys you provide to connect your Stripe account.
              These are stored encrypted and used only to process payments from your clients.</li>
            </ul>

            <h3 className="text-white font-semibold mt-6 mb-2">From Clients (people who book calls)</h3>
            <ul>
              <li><strong>Booking info:</strong> name, email address, service requested, and preferred call time</li>
              <li><strong>Payment info:</strong> card details entered on the booking page are sent directly to the
              expert&rsquo;s Stripe account via Stripe&rsquo;s API. We do not store card numbers, CVCs, or full card
              data on our servers.</li>
              <li><strong>Call transcripts:</strong> if you opt in to the transcript add-on, the text of your call
              is captured and emailed to you after the session ends. Transcripts are stored in our database until
              you request deletion.</li>
            </ul>

            <h3 className="text-white font-semibold mt-6 mb-2">Automatically collected</h3>
            <ul>
              <li><strong>Session data:</strong> authentication cookies set by Supabase to keep you logged in</li>
              <li><strong>Usage data:</strong> basic server logs (page requests, API calls) retained for up to 30 days
              for debugging purposes</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <ul>
              <li>To create and manage expert accounts and booking pages</li>
              <li>To process call bookings and facilitate payments between clients and experts</li>
              <li>To send booking confirmation and receipt emails</li>
              <li>To deliver call transcripts when opted into</li>
              <li>To operate and improve the ChatRate platform</li>
              <li>To respond to support requests</li>
            </ul>
            <p>We do not sell your personal information. We do not use your data for advertising.</p>
          </Section>

          <Section title="4. Third-Party Services">
            <p>ChatRate integrates with the following third-party services. Each has its own privacy policy.</p>
            <table className="w-full text-sm mt-4 border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 pr-6 text-gray-400 font-semibold">Service</th>
                  <th className="text-left py-2 pr-6 text-gray-400 font-semibold">Purpose</th>
                  <th className="text-left py-2 text-gray-400 font-semibold">Data shared</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-white/5">
                  <td className="py-3 pr-6 font-medium text-white">Stripe</td>
                  <td className="py-3 pr-6">Payment processing</td>
                  <td className="py-3">Card details, booking amount</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 pr-6 font-medium text-white">Daily.co</td>
                  <td className="py-3 pr-6">Video call infrastructure</td>
                  <td className="py-3">Room names, audio/video streams (not recorded unless transcript opted in)</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 pr-6 font-medium text-white">Supabase</td>
                  <td className="py-3 pr-6">Database &amp; authentication</td>
                  <td className="py-3">Account info, bookings, transcripts</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 pr-6 font-medium text-white">Resend</td>
                  <td className="py-3 pr-6">Transactional email</td>
                  <td className="py-3">Name, email address, booking details</td>
                </tr>
                <tr>
                  <td className="py-3 pr-6 font-medium text-white">Anthropic</td>
                  <td className="py-3 pr-6">AI onboarding assistant</td>
                  <td className="py-3">Chat messages typed into the onboarding assistant only. No account data.</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Section title="5. Data Retention">
            <ul>
              <li><strong>Expert accounts:</strong> retained for as long as your account is active. Deleted within
              30 days of an account deletion request.</li>
              <li><strong>Booking records:</strong> retained for 2 years for dispute and accounting purposes, then deleted.</li>
              <li><strong>Transcripts:</strong> retained until you request deletion or delete your account.</li>
              <li><strong>Server logs:</strong> deleted after 30 days.</li>
            </ul>
          </Section>

          <Section title="6. Your Rights">
            <p>Depending on your location, you may have the following rights:</p>
            <ul>
              <li><strong>Access:</strong> request a copy of the personal data we hold about you</li>
              <li><strong>Correction:</strong> request correction of inaccurate data</li>
              <li><strong>Deletion:</strong> request deletion of your personal data</li>
              <li><strong>Portability:</strong> request your data in a machine-readable format</li>
              <li><strong>Objection:</strong> object to certain processing activities</li>
            </ul>
            <p>To exercise any of these rights, email us at{" "}
              <a href="mailto:drumpimp@gmail.com" className="text-purple-400 hover:text-purple-300">drumpimp@gmail.com</a>.
              We will respond within 30 days.
            </p>
          </Section>

          <Section title="7. Cookies">
            <p>We use a single session cookie set by Supabase to keep you logged in as an expert. No advertising,
            analytics, or tracking cookies are used. The session cookie is deleted when you sign out.</p>
          </Section>

          <Section title="8. Security">
            <p>Expert Stripe API keys are stored encrypted at rest. All data is transmitted over HTTPS. Our database
            (Supabase) is hosted in a SOC 2 compliant environment. We do not store raw payment card data.</p>
            <p>No method of transmission over the internet is 100% secure. If you believe your account has been
            compromised, contact us immediately at{" "}
              <a href="mailto:drumpimp@gmail.com" className="text-purple-400 hover:text-purple-300">drumpimp@gmail.com</a>.
            </p>
          </Section>

          <Section title="9. Children">
            <p>ChatRate is not directed at children under 13. We do not knowingly collect personal information from
            anyone under 13. If you believe a child has provided us with personal information, please contact us
            and we will delete it.</p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>We may update this Privacy Policy from time to time. Material changes will be communicated by updating
            the &ldquo;Last updated&rdquo; date at the top of this page. Continued use of ChatRate after changes
            constitutes acceptance of the updated policy.</p>
          </Section>

          <Section title="11. Contact">
            <p>Questions or concerns about this Privacy Policy?</p>
            <p>
              <strong className="text-white">Trevor Lawrence</strong><br />
              <a href="mailto:drumpimp@gmail.com" className="text-purple-400 hover:text-purple-300">drumpimp@gmail.com</a><br />
              chatrate-app.com
            </p>
          </Section>

        </div>
      </div>
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
