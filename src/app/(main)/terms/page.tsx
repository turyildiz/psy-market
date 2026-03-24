import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The rules and conditions for using psy.market.",
};

export default function TermsPage() {
  return (
    <div className="min-h-[60vh] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-dark)]" style={{ fontFamily: "var(--font-display)" }}>
            Terms of Service
          </h1>
          <p className="text-sm text-[var(--text-grey)] mt-2">Last updated: February 2026</p>
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            This is a placeholder policy for initial launch. It will be reviewed by a lawyer before any public marketing campaign.
          </div>
        </div>

        <div className="space-y-8 text-[var(--text-dark)]">
          <section>
            <h2 className="text-xl font-bold mb-3">1. Acceptance of Terms</h2>
            <p className="text-[var(--text-grey)] leading-relaxed">
              By creating an account or using psy.market, you agree to these Terms of Service. If you do not agree, please do not use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. User Responsibilities</h2>
            <ul className="list-disc pl-6 text-[var(--text-grey)] space-y-2">
              <li>You must be at least 18 years old to use psy.market.</li>
              <li>You are responsible for maintaining the security of your account.</li>
              <li>You must provide accurate and truthful information in your listings.</li>
              <li>You are solely responsible for all transactions arranged through the platform.</li>
              <li>Transactions between buyers and sellers are conducted off-platform. psy.market is not a party to any sale.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. Prohibited Items & Content</h2>
            <p className="text-[var(--text-grey)] leading-relaxed mb-3">You may not list or sell:</p>
            <ul className="list-disc pl-6 text-[var(--text-grey)] space-y-2">
              <li>Counterfeit, stolen, or illegal goods</li>
              <li>Weapons, drugs, or controlled substances</li>
              <li>Explicit sexual content</li>
              <li>Items unrelated to psytrance culture, festival fashion, or the platform&apos;s categories</li>
              <li>Spam or deliberately misleading listings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Content Ownership</h2>
            <p className="text-[var(--text-grey)] leading-relaxed">
              You retain ownership of all content you post (listings, photos, messages). By posting on psy.market, you grant us a non-exclusive licence to display your content on the platform. We will not sell or license your content to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. No Liability for Off-Platform Transactions</h2>
            <p className="text-[var(--text-grey)] leading-relaxed">
              psy.market is a discovery and communication platform. We do not process payments, hold funds, or guarantee the completion of any transaction. All payments and deliveries are arranged directly between buyers and sellers. We are not liable for fraud, disputes, or losses arising from off-platform transactions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Listing Approval</h2>
            <p className="text-[var(--text-grey)] leading-relaxed">
              All listings are subject to review. We reserve the right to reject or remove any listing that violates these terms or our content guidelines. Listings are automatically approved after 24 hours if not reviewed by our team.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. Account Termination</h2>
            <p className="text-[var(--text-grey)] leading-relaxed">
              We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or harm other users. You may delete your own account at any time from your settings page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. Disclaimer</h2>
            <p className="text-[var(--text-grey)] leading-relaxed">
              psy.market is provided &quot;as is&quot; without warranties of any kind. We do not guarantee uninterrupted service, the accuracy of listings, or the behavior of other users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">9. Contact</h2>
            <p className="text-[var(--text-grey)] leading-relaxed">
              For legal questions or disputes, contact: <strong>legal@psy.market</strong>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
