import Link from "next/link";
import { notFound } from "next/navigation";
import { getListingById } from "@/lib/data/listings";
import { formatPrice } from "@/lib/utils";

type ListingDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { id } = await params;
  const data = await getListingById(id);

  if (!data) {
    notFound();
  }

  const { listing, profile } = data;

  return (
    <div className="bg-[var(--dark-1)] text-white min-h-[60vh] p-8">
      <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="rounded-lg overflow-hidden border border-[var(--dark-3)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={listing.images?.[0] || "/modem.jpg"}
              alt={listing.title}
              className="w-full aspect-[4/3] object-cover"
            />
          </div>
          {listing.images?.length > 1 ? (
            <div className="grid grid-cols-4 gap-2">
              {listing.images.slice(1).map((image: string) => (
                <div
                  key={image}
                  className="rounded-md overflow-hidden border border-[var(--dark-3)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt={listing.title} className="w-full aspect-square object-cover" />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-5">
          <h1 className="text-3xl font-bold">{listing.title}</h1>
          <p className="text-2xl text-[var(--brand)] font-semibold">{formatPrice(listing.price)}</p>
          <p className="text-[var(--text-muted)] capitalize">
            {listing.category} - {listing.condition.replace("_", " ")} - Size {listing.size}
          </p>
          <p className="text-sm leading-6">{listing.description}</p>

          <div className="space-y-2">
            <p className="text-sm text-[var(--text-muted)]">Ships to</p>
            <div className="flex flex-wrap gap-2">
              {(listing.ships_to ?? []).map((country: string) => (
                <span
                  key={country}
                  className="px-2 py-1 rounded-md bg-[var(--dark-3)] text-xs text-[var(--text-muted)]"
                >
                  {country}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[var(--dark-3)] bg-[var(--dark-2)] p-4">
            <p className="text-sm text-[var(--text-muted)]">Seller</p>
            <p className="font-semibold">{profile?.display_name ?? "Unknown"}</p>
            {profile?.handle ? (
              <Link href={`/seller/${profile.handle}`} className="text-sm text-[var(--brand)]">
                @{profile.handle}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

