import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How psy.market collects, stores, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-[60vh] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-dark)]" style={{ fontFamily: "var(--font-display)" }}>
            Privacy Policy
          </h1>
          <p className="text-sm text-[var(--text-grey)] mt-2">Last updated: February 2026</p>
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            This is a placeholder policy for initial launch. It will be reviewed by a lawyer before any public marketing campaign.
          </div>
        </div>

        <div className="prose prose-sm max-w-none space-y-8 text-[var(--text-dark)]">
          <section>
            <h2 className="text-xl font-bold mb-3">1. Who We Are</h2>
            <p className="text-[var(--text-grey)] leading-relaxed">
              psy.market is a marketplace for the global psytrance community, operated by Nettmedia. We provide a platform for buying and selling festival fashion, music gear, art, and accessories.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. What Data We Collect</h2>
            <p className="text-[var(--text-grey)] leading-relaxed mb-3">When you use psy.market, we may collect:</p>
            <ul className="list-disc pl-6 text-[var(--text-grey)] space-y-2">
              <li><strong>Account data:</strong> Email address, password (hashed), and profile information you provide (display name, handle, location, bio, avatar).</li>
              <li><strong>Listing data:</strong> Product listings, images, descriptions, and prices you publish.</li>
              <li><strong>Messages:</strong> Conversations between buyers and sellers on the platform.</li>
              <li><strong>Usage data:</strong> Page views, listing view counts, and basic analytics.</li>
              <li><strong>Cookies:</strong> Session cookies managed by Supabase Auth for keeping you logged in.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. How We Use Your Data</h2>
            <ul className="list-disc pl-6 text-[var(--text-grey)] space-y-2">
              <li>To provide and operate the marketplace.</li>
              <li>To send transactional emails (e.g., new messages, listing status updates) if you opt in.</li>
              <li>To prevent fraud and enforce our Terms of Service.</li>
              <li>To improve the platform based on usage patterns.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Data Storage</h2>
            <p className="text-[var(--text-grey)] leading-relaxed">
              Your data is stored in the EU (eu-west-1) on Supabase (Postgres). Images are stored in Supabase Storage. Transactional emails are sent via Resend. We do not sell your data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Your GDPR Rights</h2>
            <p className="text-[var(--text-grey)] leading-relaxed mb-3">If you are in the EU/EEA, you have the right to:</p>
            <ul className="list-disc pl-6 text-[var(--text-grey)] space-y-2">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Deletion:</strong> Delete your account and all associated data from your settings page at any time.</li>
              <li><strong>Portability:</strong> Request your data in a machine-readable format.</li>
              <li><strong>Correction:</strong> Update your profile information at any time.</li>
              <li><strong>Objection:</strong> Object to the processing of your data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Data Retention</h2>
            <p className="text-[var(--text-grey)] leading-relaxed">
              We retain your data for as long as your account is active. When you delete your account, all your data — including your profile, listings, and messages — is permanently deleted immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. Cookies</h2>
            <p className="text-[var(--text-grey)] leading-relaxed">
              We use essential cookies only — specifically, session cookies set by Supabase Auth to keep you logged in. We do not use advertising or tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. Contact</h2>
            <p className="text-[var(--text-grey)] leading-relaxed">
              For data-related requests or questions, contact us at: <strong>privacy@psy.market</strong>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
