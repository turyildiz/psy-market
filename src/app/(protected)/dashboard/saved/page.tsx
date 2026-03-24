import Link from "next/link";
import Image from "next/image";
import { getSavedListings } from "@/lib/actions/favorites";
import { formatPrice } from "@/lib/utils";

export default async function SavedItemsPage() {
  const listings = await getSavedListings();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-[var(--shadow-card)] p-8">
      <h1 className="text-2xl font-bold text-[var(--text-dark)] mb-1" style={{ fontFamily: "var(--font-display)" }}>
        Saved Items
      </h1>
      <p className="text-sm text-[var(--text-grey)] mb-6">{listings.length} saved listing{listings.length !== 1 ? "s" : ""}</p>

      {listings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[var(--text-grey)] mb-4">You haven&apos;t saved any listings yet.</p>
          <Link
            href="/browse"
            className="px-5 py-2.5 bg-[var(--brand)] text-white rounded-full text-sm font-semibold hover:opacity-90 transition"
          >
            Browse listings
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <Link
              key={listing.id}
              href={`/listing/${listing.id}`}
              className="group block rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition"
            >
              <div className="relative aspect-square bg-gray-100">
                <Image
                  src={listing.images?.[0] || "/modem.jpg"}
                  alt={listing.title}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-[var(--text-dark)] line-clamp-1 text-sm">{listing.title}</h3>
                <div className="text-xs text-[var(--text-grey)] mt-0.5 capitalize">
                  {listing.category} · {listing.condition.replace("_", " ")}
                </div>
                <div className="text-[var(--brand)] font-bold mt-1">{formatPrice(listing.price)}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
