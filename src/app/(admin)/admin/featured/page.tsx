import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { FeatureToggle } from "./_components/feature-toggle";
import { addFeaturedSeller, removeFeaturedSeller } from "@/lib/actions/admin";
import { RemoveFeaturedSellerButton } from "./_components/remove-featured-seller-button";

const CATEGORIES = [
  { value: "clothing", label: "Fashion & Clothing" },
  { value: "accessories", label: "Accessories" },
  { value: "gear", label: "Music Gear" },
  { value: "art", label: "Art & Decor" },
  { value: "other", label: "Other" },
];

export default async function AdminFeaturedPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = tab === "sellers" ? "sellers" : "listings";

  const supabase = await createServerSupabaseClient();
  const serviceSupabase = createServiceRoleClient();

  const [{ data: featured }, { data: recent }, { data: featuredSellers }] = await Promise.all([
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
    serviceSupabase
      .from("featured_sellers")
      .select("id, category, image_url, position, profile:profiles(handle, display_name, avatar_url)")
      .order("category")
      .order("position"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Featured</h1>
        <p className="text-sm text-gray-500 mt-1">Manage what appears on the homepage.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        <Link
          href="/admin/featured?tab=listings"
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${activeTab === "listings" ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          Listings
        </Link>
        <Link
          href="/admin/featured?tab=sellers"
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${activeTab === "sellers" ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          Sellers
        </Link>
      </div>

      {activeTab === "listings" ? (
        <div className="space-y-8">
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
      ) : (
        <div className="space-y-8">
          {/* Add featured seller form */}
          <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Add Featured Seller</h2>
              <p className="text-xs text-gray-500 mt-0.5">Sellers appear in the homepage carousel for their category section.</p>
            </div>
            <form action={async (fd) => { await addFeaturedSeller(fd); }} className="px-6 py-4 flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Handle</label>
                <div className="flex items-center rounded border border-gray-300 bg-white overflow-hidden">
                  <span className="px-2 text-gray-400 text-sm">@</span>
                  <input name="handle" required placeholder="yacxilan" className="py-2 pr-3 text-sm outline-none w-32" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                <select name="category" required className="px-3 py-2 text-sm border border-gray-300 rounded bg-white outline-none">
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Card Image URL</label>
                <input name="image_url" placeholder="https://..." className="px-3 py-2 text-sm border border-gray-300 rounded bg-white outline-none w-64" />
              </div>
              <button type="submit" className="px-4 py-2 text-sm font-medium bg-orange-500 text-white rounded hover:bg-orange-600 transition">
                Add
              </button>
            </form>
          </section>

          {/* Current featured sellers grouped by category */}
          {CATEGORIES.map((cat) => {
            const sellers = featuredSellers?.filter((s) => s.category === cat.value) ?? [];
            return (
              <section key={cat.value} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900">{cat.label}</h2>
                  <span className="text-xs text-gray-400">{sellers.length} seller{sellers.length !== 1 ? "s" : ""}</span>
                </div>
                {sellers.length === 0 ? (
                  <p className="px-6 py-4 text-sm text-gray-400 italic">No featured sellers in this category.</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {sellers.map((s) => {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const profile = Array.isArray(s.profile) ? s.profile[0] : s.profile as any;
                      return (
                        <div key={s.id} className="px-6 py-3 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0">
                            {profile?.avatar_url
                              ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                              : <div className="w-full h-full bg-gray-200" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{profile?.display_name}</p>
                            <p className="text-xs text-gray-500">@{profile?.handle}</p>
                          </div>
                          {s.image_url && (
                            <div className="w-16 h-10 rounded overflow-hidden bg-gray-100 shrink-0">
                              <img src={s.image_url} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <RemoveFeaturedSellerButton id={s.id} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
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
        <Link href={`/listing/${listing.id}`} className="text-sm font-semibold text-gray-900 hover:text-[var(--brand)] transition truncate block">
          {listing.title}
        </Link>
        <p className="text-xs text-gray-500">
          {formatPrice(listing.price)} · {listing.category}
          {listing.profile?.handle ? ` · @${listing.profile.handle}` : ""}
        </p>
      </div>
      <FeatureToggle listingId={listing.id} isFeatured={isFeatured} />
    </div>
  );
}
