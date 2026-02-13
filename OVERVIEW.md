# Project Context: Psy.market

## 1. Core Concept
* **Product:** A vertical marketplace for the Psytrance community (fashion, jewelry, deco, festival gear).
* **Comparison:** "Etsy meets Vinted" but for a specific subculture (similar to Bandcamp/Discogs).
* **Unique Selling Point:** Bridging online commerce with offline festivals (Click & Collect).

## 2. Technical Stack (Final Decision)
* **Framework:** Next.js.
* **Backend/Database:** **Supabase** (Postgres) - Switched from Convex to save costs and utilize SQL.
* **Auth:** Supabase Auth (replacing Clerk).
* **Storage:** Supabase Storage (replacing UploadThing).
* **Payments:** Stripe Connect (for future P2P) + Stripe Checkout (for V1 features).
* **Dev Environment:** Google Project IDX / Antigravity.

## 3. User & Profile Architecture (The "Umbrella" Model)
* **One User, Multiple Profiles:** A single login (User ID) can manage multiple public personas (Profile IDs).
* **Use Cases:**
    * *John Doe* (User) -> *John's Buying Profile* (Personal) + *DJ JD* (Artist Profile).
    * *Vendor* -> *Festival Shop A* + *Festival Shop B*.
* **Database Structure:**
    * `users` table: Private, linked to Auth & Stripe Identity.
    * `profiles` table: Public, handles products/reviews.

## 4. Monetization Strategy
* **V1 (No P2P Payments):**
    * **Promoted Listings:** "Bump" (€2) and "Spotlight" (€5-10).
    * **B2B Sponsorships:** Flat fees for Festival/Label banners (based on "Ticket Price" value anchor).
    * **Donations:** "Buy us a Chai" button.
* **V2 (Future):**
    * **Commission:** 10% on sales (Seller pays).
    * **Transaction Fees:** ~3% + €0.25 (Seller/Buyer pays).

## 5. Key Features for V1 (MVP)
* **Categories:** Fashion & Wear, Jewelry & Accessories, Deco & Art, Festival Gear, Flow & Fire, Music & Audio, Services.
* **Waitlist Strategy:**
    * **"Reserve Your Handle":** Users sign up to claim unique URLs (e.g., `psy.market/shop/astrix`).
    * **Gamification:** Referral queue to gain early access or badges.
* **Festival Integration ("The Tour Connector"):**
    * **Tour Dates:** Vendors list which festivals they are attending.
    * **Event Pages:** Aggregated pages (e.g., "Ozora 2026") showing all attending vendors.
    * **Click & Collect:** Buyers purchase online, pick up physically at the festival stall (Inventory risk reduction).

## 6. Payment & Verification Details
* **Stripe Connect Express:** Will handle KYC and split payments (Revenue vs. Payout) in V2.
* **Verification:** Vendors must verify identity via Stripe once they hit sales thresholds (DAC7/INFORM Act compliance).
* **Crypto (Idea):** Potential use of **x402** (Base Network) or Stripe Crypto for "Bump" micropayments.

## 7. Future Roadmap Ideas (Post-V1)
* **Agentic Marketplace:** AI Agents (via Telegram) allowing vendors to upload products via chat photos and handle "Spotlight" boosts automatically.
* **Ticket Resale:** Secure swapping for festival tickets (High volume/profit potential).