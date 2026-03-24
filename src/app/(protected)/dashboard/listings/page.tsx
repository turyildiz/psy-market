import Link from "next/link";
import { getCurrentUserListings } from "@/lib/data/listings";
import { formatPrice } from "@/lib/utils";
import { MarkSoldButton } from "./_components/mark-sold-button";

const STATUS_STYLES: Record<string, string> = {
  active:   "bg-green-50 text-green-700 border-green-200",
  draft:    "bg-gray-100 text-gray-500 border-gray-200",
  pending:  "bg-amber-50 text-amber-600 border-amber-200",
  rejected: "bg-red-50 text-red-600 border-red-200",
  sold:     "bg-blue-50 text-blue-600 border-blue-200",
};

export default async function DashboardListingsPage() {
  const listings = await getCurrentUserListings();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2
          className="text-xl font-black text-[var(--text-dark)] tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          My Listings
        </h2>
        <Link
          href="/sell"
          className="text-xs font-bold px-4 py-2 rounded-full bg-gradient-to-r from-[var(--brand)] to-orange-400 text-white shadow-[0_4px_12px_rgba(255,107,53,0.3)] hover:opacity-90 transition"
        >
          + New Listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-[var(--shadow-card)] p-10 text-center">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 opacity-60 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-gradient-to-tr from-orange-100 to-yellow-100 opacity-50 blur-2xl pointer-events-none" />
          <div className="relative">
            <p className="text-4xl mb-3">🎪</p>
            <p className="font-bold text-[var(--text-dark)] text-lg mb-1" style={{ fontFamily: "var(--font-display)" }}>
              Nothing listed yet
            </p>
            <p className="text-sm text-[var(--text-grey)] mb-5 max-w-xs mx-auto">
              Share your festival fashion, gear, or art with the global psytrance community.
            </p>
            <Link
              href="/sell"
              className="inline-block px-6 py-2.5 rounded-full bg-gradient-to-r from-[var(--brand)] to-orange-400 text-white text-sm font-bold shadow-[0_6px_20px_rgba(255,107,53,0.35)] hover:opacity-90 transition"
            >
              Create your first listing
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-[var(--shadow-card)] overflow-hidden">
          {listings.map((listing, i) => (
            <div
              key={listing.id}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition ${
                i < listings.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={listing.images?.[0] || "/modem.jpg"}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-[var(--text-dark)] text-sm truncate" style={{ fontFamily: "var(--font-display)" }}>
                  {listing.title}
                </p>
                <p className="text-sm text-[var(--brand)] font-semibold">{formatPrice(listing.price)}</p>
              </div>

              <span className={`text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${STATUS_STYLES[listing.status] ?? STATUS_STYLES.draft}`}>
                {listing.status}
              </span>

              <div className="flex items-center gap-3 shrink-0">
                {listing.status === "active" && (
                  <MarkSoldButton listingId={listing.id} />
                )}
                {listing.status !== "sold" && (
                  <Link
                    href={`/sell/${listing.id}/edit`}
                    className="text-xs font-semibold text-[var(--text-grey)] hover:text-[var(--brand)] transition"
                  >
                    Edit
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
