import Link from "next/link";
import { getCurrentUserListings } from "@/lib/data/listings";
import { formatPrice } from "@/lib/utils";

export default async function DashboardListingsPage() {
  const listings = await getCurrentUserListings();

  return (
    <div className="bg-[var(--dark-1)] text-white p-8 min-h-[60vh]">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Listings</h1>
          <Link
            href="/sell"
            className="h-9 px-3 rounded-md bg-[var(--brand)] text-white text-sm font-medium inline-flex items-center"
          >
            New Listing
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="rounded-lg border border-[var(--dark-3)] bg-[var(--dark-2)] p-6 text-[var(--text-muted)]">
            You have no listings yet.
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="rounded-lg border border-[var(--dark-3)] bg-[var(--dark-2)] p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-[var(--dark-3)] shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={listing.images?.[0] || "/modem.jpg"}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{listing.title}</p>
                    <p className="text-sm text-[var(--text-muted)]">{formatPrice(listing.price)}</p>
                    <p className="text-xs uppercase text-[var(--brand)]">{listing.status}</p>
                  </div>
                </div>
                <Link href={`/sell/${listing.id}/edit`} className="text-sm text-[var(--brand)]">
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

