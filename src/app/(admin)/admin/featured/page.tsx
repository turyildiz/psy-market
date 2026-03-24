import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { FeatureToggle } from "./_components/feature-toggle";

export default async function AdminFeaturedPage() {
  const supabase = await createServerSupabaseClient();

  const [{ data: featured }, { data: recent }] = await Promise.all([
    supabase
      .from("listings")
      .select("id, title, price, category, images, profile:profiles(handle)")
      .eq("status", "active")
      .eq("is_featured", true)
      .order("updated_at", { ascending: false }),
    supabase
      .from("listings")
      .select("id, title, price, category, images, profile:profiles(handle)")
      .eq("status", "active")
      .eq("is_featured", false)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Featured Listings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Featured listings appear in the homepage carousel and browse page highlights.
        </p>
      </div>

      {/* Currently featured */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Currently Featured ({featured?.length ?? 0})
        </h2>
        {(!featured || featured.length === 0) ? (
          <p className="text-sm text-gray-400 italic">No featured listings yet.</p>
        ) : (
          <div className="space-y-2">
            {featured.map((listing) => (
              <FeaturedRow key={listing.id} listing={listing} isFeatured={true} />
            ))}
          </div>
        )}
      </section>

      {/* Add to featured */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Active Listings (most recent)
        </h2>
        {(!recent || recent.length === 0) ? (
          <p className="text-sm text-gray-400 italic">No active listings.</p>
        ) : (
          <div className="space-y-2">
            {recent.map((listing) => (
              <FeaturedRow key={listing.id} listing={listing} isFeatured={false} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

type Listing = {
  id: string;
  title: string;
  price: number;
  category: string;
  images: string[] | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile: any;
};

function FeaturedRow({ listing, isFeatured }: { listing: Listing; isFeatured: boolean }) {
  const image = listing.images?.[0];
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-3">
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={listing.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <Link
          href={`/listing/${listing.id}`}
          className="text-sm font-semibold text-gray-900 hover:text-[var(--brand)] transition truncate block"
        >
          {listing.title}
        </Link>
        <p className="text-xs text-gray-500">
          {formatPrice(listing.price)} · {listing.category}
          {listing.profile?.handle ? ` · @${listing.profile.handle}` : (Array.isArray(listing.profile) && listing.profile[0]?.handle ? ` · @${listing.profile[0].handle}` : "")}
        </p>
      </div>
      <FeatureToggle listingId={listing.id} isFeatured={isFeatured} />
    </div>
  );
}
