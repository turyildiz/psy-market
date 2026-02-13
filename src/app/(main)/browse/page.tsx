import Link from "next/link";
import { getActiveListings } from "@/lib/data/listings";
import { formatPrice } from "@/lib/utils";

type BrowsePageProps = {
  searchParams: Promise<{ q?: string; category?: string }>;
};

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;
  const listings = await getActiveListings({
    q: params.q,
    category: params.category,
  });

  return (
    <div className="bg-[var(--dark-1)] text-white min-h-[60vh] p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Browse Listings</h1>
          <form className="flex gap-2">
            <input
              type="text"
              name="q"
              defaultValue={params.q}
              placeholder="Search title or description"
              className="h-9 rounded-md border border-[var(--dark-4)] bg-[var(--dark-2)] px-3 text-sm"
            />
            <button
              type="submit"
              className="h-9 px-3 rounded-md bg-[var(--brand)] text-white text-sm font-medium"
            >
              Search
            </button>
          </form>
        </div>

        {listings.length === 0 ? (
          <div className="rounded-lg border border-[var(--dark-3)] bg-[var(--dark-2)] p-6 text-[var(--text-muted)]">
            No listings found.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/listing/${listing.id}`}
                className="rounded-lg border border-[var(--dark-3)] bg-[var(--dark-2)] overflow-hidden hover:border-[var(--brand)] transition"
              >
                <div className="aspect-[4/3] bg-[var(--dark-3)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={listing.images?.[0] || "/modem.jpg"}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 space-y-1">
                  <h2 className="font-semibold line-clamp-1">{listing.title}</h2>
                  <p className="text-sm text-[var(--text-muted)] capitalize">
                    {listing.category} - {listing.condition.replace("_", " ")}
                  </p>
                  <p className="text-[var(--brand)] font-semibold">
                    {formatPrice(listing.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

