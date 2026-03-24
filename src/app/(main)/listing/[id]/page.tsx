import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getListingById } from "@/lib/data/listings";
import { formatPrice } from "@/lib/utils";
import { ContactSellerButton } from "@/components/listings/contact-seller-button";
import { SaveButton } from "@/components/listings/save-button";
import { ViewTracker } from "@/components/listings/view-tracker";
import { getIsFavorited } from "@/lib/actions/favorites";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: ListingDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getListingById(id);
  if (!data) return { title: "Listing not found" };
  const { listing } = data;
  const title = `${listing.title} — ${formatPrice(listing.price)}`;
  const image = listing.images?.[0];
  return {
    title,
    description: listing.description.slice(0, 160),
    openGraph: {
      title,
      description: listing.description.slice(0, 160),
      images: image ? [{ url: image, alt: listing.title }] : [],
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description: listing.description.slice(0, 160) },
  };
}

type ListingDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { id } = await params;
  const data = await getListingById(id);
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!data) {
    notFound();
  }

  const { listing, profile } = data;
  const isFavorited = user ? await getIsFavorited(id) : false;

  return (
    <div className="min-h-[60vh] py-10 px-4">
      <ViewTracker listingId={listing.id} />
      <div className="max-w-[1200px] mx-auto grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="rounded-2xl overflow-hidden bg-gray-100">
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
                  className="rounded-xl overflow-hidden bg-gray-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt={listing.title} className="w-full aspect-square object-cover" />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold text-[var(--text-dark)]" style={{ fontFamily: 'var(--font-display)' }}>{listing.title}</h1>
            {listing.status === "sold" && (
              <span className="shrink-0 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-bold rounded-full">Sold</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <p className="text-3xl text-[var(--brand)] font-bold" style={{ fontFamily: 'var(--font-display)' }}>{formatPrice(listing.price)}</p>
            <span className="text-xs text-[var(--text-grey)]">{listing.view_count ?? 0} view{listing.view_count !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-gray-100 text-[var(--text-grey)] text-sm capitalize">{listing.category}</span>
            <span className="px-3 py-1 rounded-full bg-gray-100 text-[var(--text-grey)] text-sm capitalize">{listing.condition.replace("_", " ")}</span>
            <span className="px-3 py-1 rounded-full bg-gray-100 text-[var(--text-grey)] text-sm">Size: {listing.size}</span>
          </div>
          <p className="text-sm text-[var(--text-grey)] leading-6">{listing.description}</p>

          {listing.tags && listing.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {listing.tags.map((tag: string) => (
                <Link
                  key={tag}
                  href={`/browse?q=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 rounded-full bg-[var(--brand)]/10 text-[var(--brand)] text-xs font-medium hover:bg-[var(--brand)]/20 transition"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-semibold text-[var(--text-dark)]">Ships to</p>
            <div className="flex flex-wrap gap-2">
              {(listing.ships_to ?? []).map((country: string) => (
                <span
                  key={country}
                  className="px-2 py-1 rounded-md bg-gray-100 text-xs text-[var(--text-grey)]"
                >
                  {country}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-[var(--shadow-card)]">
            <p className="text-xs font-semibold text-[var(--text-grey)] uppercase tracking-wide mb-2">Seller</p>
            <p className="font-semibold text-[var(--text-dark)]">{profile?.display_name ?? "Unknown"}</p>
            {profile?.handle ? (
              <Link href={`/seller/${profile.handle}`} className="text-sm text-[var(--brand)] font-medium hover:opacity-75 transition">
                @{profile.handle}
              </Link>
            ) : null}
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <ContactSellerButton listingId={listing.id} sellerProfileId={listing.profile_id} />
            </div>
            <SaveButton listingId={listing.id} initialSaved={isFavorited} isLoggedIn={!!user} />
          </div>
        </div>
      </div>
    </div>
  );
}

