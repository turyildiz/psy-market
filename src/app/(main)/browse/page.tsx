import Link from "next/link";
import Image from "next/image";
import { getActiveListings } from "@/lib/data/listings";
import { formatPrice } from "@/lib/utils";

type BrowsePageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    condition?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  }>;
};

const CATEGORIES = [
  { id: "", label: "All" },
  { id: "clothing", label: "Apparel" },
  { id: "accessories", label: "Accessories" },
  { id: "gear", label: "Music Gear" },
  { id: "art", label: "Art & Decor" },
  { id: "other", label: "Other" },
];

const CONDITIONS = [
  { id: "", label: "Any Condition" },
  { id: "new", label: "New" },
  { id: "like_new", label: "Like New" },
  { id: "good", label: "Good" },
  { id: "worn", label: "Worn" },
  { id: "vintage", label: "Vintage" },
];

const SORT_OPTIONS = [
  { id: "", label: "Newest First" },
  { id: "price_asc", label: "Price: Low to High" },
  { id: "price_desc", label: "Price: High to Low" },
];

function buildHref(base: Record<string, string | undefined>, overrides: Record<string, string | undefined>) {
  const merged = { ...base, ...overrides };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v) params.set(k, v);
  }
  const qs = params.toString();
  return `/browse${qs ? `?${qs}` : ""}`;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;
  const listings = await getActiveListings({
    q: params.q,
    category: params.category,
    condition: params.condition,
    sort: params.sort,
    min_price: params.min_price,
    max_price: params.max_price,
  });

  const base = {
    q: params.q,
    category: params.category,
    condition: params.condition,
    sort: params.sort,
    min_price: params.min_price,
    max_price: params.max_price,
  };

  const activeCategory = params.category ?? "";
  const activeCondition = params.condition ?? "";
  const activeSort = params.sort ?? "";

  const activeCount = [params.category, params.condition, params.sort, params.min_price, params.max_price, params.q].filter(Boolean).length;

  return (
    <div className="min-h-[60vh] py-10 px-4 bg-[var(--bg)]">
      <div className="max-w-[1200px] mx-auto space-y-6">

        {/* Header + Search */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-dark)]" style={{ fontFamily: "var(--font-display)" }}>
              Browse Listings
            </h1>
            <p className="text-sm text-[var(--text-grey)] mt-1">
              {listings.length} {listings.length === 1 ? "listing" : "listings"} found
              {activeCount > 0 && " · filters active"}
            </p>
          </div>
          <form className="flex gap-2">
            {/* Preserve other filters when searching */}
            {params.category && <input type="hidden" name="category" value={params.category} />}
            {params.condition && <input type="hidden" name="condition" value={params.condition} />}
            {params.sort && <input type="hidden" name="sort" value={params.sort} />}
            {params.min_price && <input type="hidden" name="min_price" value={params.min_price} />}
            {params.max_price && <input type="hidden" name="max_price" value={params.max_price} />}
            <input
              type="text"
              name="q"
              defaultValue={params.q}
              placeholder="Search listings..."
              className="h-10 rounded-full border border-gray-300 bg-white px-4 text-sm text-[var(--text-dark)] focus:outline-none focus:border-[var(--brand)] w-56"
            />
            <button
              type="submit"
              className="h-10 px-5 rounded-full bg-[var(--brand)] text-white text-sm font-semibold hover:opacity-90 transition"
            >
              Search
            </button>
          </form>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <Link
                key={cat.id}
                href={buildHref(base, { category: cat.id || undefined })}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  isActive
                    ? "bg-[var(--brand)] text-white shadow-sm"
                    : "bg-white border border-gray-200 text-[var(--text-dark)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
                }`}
              >
                {cat.label}
              </Link>
            );
          })}
        </div>

        {/* Condition + Sort filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-[var(--text-grey)]">Condition:</label>
            <div className="flex flex-wrap gap-1.5">
              {CONDITIONS.map((cond) => {
                const isActive = activeCondition === cond.id;
                return (
                  <Link
                    key={cond.id}
                    href={buildHref(base, { condition: cond.id || undefined })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isActive
                        ? "bg-[var(--brand)] text-white"
                        : "bg-white border border-gray-200 text-[var(--text-dark)] hover:border-[var(--brand)]"
                    }`}
                  >
                    {cond.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <label className="text-sm font-medium text-[var(--text-grey)]">Sort:</label>
            <div className="flex gap-1.5">
              {SORT_OPTIONS.map((opt) => {
                const isActive = activeSort === opt.id;
                return (
                  <Link
                    key={opt.id}
                    href={buildHref(base, { sort: opt.id || undefined })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isActive
                        ? "bg-[var(--brand)] text-white"
                        : "bg-white border border-gray-200 text-[var(--text-dark)] hover:border-[var(--brand)]"
                    }`}
                  >
                    {opt.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Clear filters */}
        {activeCount > 0 && (
          <div>
            <Link
              href="/browse"
              className="text-sm text-[var(--brand)] hover:underline font-medium"
            >
              ✕ Clear all filters
            </Link>
          </div>
        )}

        {/* Listings grid */}
        {listings.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-[var(--shadow-card)]">
            <p className="text-xl font-semibold text-[var(--text-dark)] mb-2">No listings found</p>
            <p className="text-[var(--text-grey)] text-sm">Try adjusting your filters or search terms.</p>
            <Link href="/browse" className="mt-4 inline-block text-sm text-[var(--brand)] hover:underline font-medium">
              Clear filters
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/listing/${listing.id}`}
                className="product-card"
              >
                <div className="product-card-img h-52">
                  <Image
                    src={listing.images?.[0] || "/modem.jpg"}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="product-card-info">
                  <h4>{listing.title}</h4>
                  <div className="category capitalize">
                    {listing.category} · {listing.condition.replace("_", " ")}
                  </div>
                  <div className="price">{formatPrice(listing.price)}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
