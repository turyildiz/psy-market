import Link from "next/link";
import { getCurrentUserListings } from "@/lib/data/listings";
import { formatPrice } from "@/lib/utils";

export default async function DashboardListingsPage() {
  const listings = await getCurrentUserListings();

  return (
    <div>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[var(--text-dark)]" style={{ fontFamily: 'var(--font-display)' }}>My Listings</h1>
          <Link
            href="/sell"
            className="h-9 px-4 rounded-full bg-[var(--brand)] text-white text-sm font-semibold inline-flex items-center shadow-[var(--shadow-card)] hover:opacity-90 transition"
          >
            + New Listing
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-[var(--text-grey)] shadow-[var(--shadow-card)]">
            You have no listings yet.
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="rounded-xl border border-gray-200 bg-white p-4 flex items-center justify-between gap-4 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={listing.images?.[0] || "/modem.jpg"}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--text-dark)] truncate">{listing.title}</p>
                    <p className="text-sm text-[var(--text-grey)]">{formatPrice(listing.price)}</p>
                    <p className="text-xs uppercase font-semibold text-[var(--brand)]">{listing.status}</p>
                  </div>
                </div>
                <Link href={`/sell/${listing.id}/edit`} className="text-sm font-semibold text-[var(--brand)] hover:opacity-75 transition">
                  Edit
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

