import Link from "next/link";
import Image from "next/image";
import { getActiveListings, getFeaturedListings } from "@/lib/data/listings";
import { formatPrice } from "@/lib/utils";

type BrowsePageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    type?: string;
    condition?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  }>;
};

// ─── Music Gear types ────────────────────────────────────────────────────────

type GearFilterId = "all" | "synths" | "controllers" | "audio-interfaces" | "fx-pedals";
type GearCategory = Exclude<GearFilterId, "all">;

type GearCard = {
  id: string;
  title: string;
  subtitle: string;
  priceLabel: string;
  image: string;
  href: string;
  gearType: GearCategory;
};

const GEAR_FILTERS: Array<{ id: GearFilterId; label: string }> = [
  { id: "all", label: "All Gear" },
  { id: "synths", label: "Synths" },
  { id: "controllers", label: "Controllers" },
  { id: "audio-interfaces", label: "Audio Interfaces" },
  { id: "fx-pedals", label: "FX Pedals" },
];

const MUSIC_GEAR_HERO_IMAGE =
  "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=2200&q=80";

const FALLBACK_MUSIC_GEAR: GearCard[] = [
  { id: "fallback-1", title: "Nebula Synth X500", subtitle: "Advanced synthesizer for sound design", priceLabel: "EUR 1,299.00", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80", href: "/browse?category=gear&type=synths", gearType: "synths" },
  { id: "fallback-2", title: "Pulse DJ Controller Pro", subtitle: "Professional DJ controller with tactile feedback", priceLabel: "EUR 899.00", image: "https://images.unsplash.com/photo-1571266028243-6084d3f6f8f7?auto=format&fit=crop&w=1200&q=80", href: "/browse?category=gear&type=controllers", gearType: "controllers" },
  { id: "fallback-3", title: "Sonic Audio Interface 2000", subtitle: "High-fidelity audio interface for recording", priceLabel: "EUR 450.00", image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80", href: "/browse?category=gear&type=audio-interfaces", gearType: "audio-interfaces" },
  { id: "fallback-4", title: "Cosmic Synth", subtitle: "Analog warmth with modern controls", priceLabel: "EUR 750.00", image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80", href: "/browse?category=gear&type=synths", gearType: "synths" },
  { id: "fallback-5", title: "Rhythmic Controller", subtitle: "Performance pad for hybrid live sets", priceLabel: "EUR 320.00", image: "https://images.unsplash.com/photo-1520170350707-b2da59970118?auto=format&fit=crop&w=1200&q=80", href: "/browse?category=gear&type=controllers", gearType: "controllers" },
  { id: "fallback-6", title: "Aural Interface", subtitle: "Compact recording companion", priceLabel: "EUR 250.00", image: "https://images.unsplash.com/photo-1514119412350-e174d90d280e?auto=format&fit=crop&w=1200&q=80", href: "/browse?category=gear&type=audio-interfaces", gearType: "audio-interfaces" },
  { id: "fallback-7", title: "Echo FX Pedal", subtitle: "Ambient textures in one stomp", priceLabel: "EUR 180.00", image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=1200&q=80", href: "/browse?category=gear&type=fx-pedals", gearType: "fx-pedals" },
  { id: "fallback-8", title: "Harmonic Synth", subtitle: "Polyphonic synth with lush pads", priceLabel: "EUR 990.00", image: "https://images.unsplash.com/photo-1507835667282-7d4b6b47a7a5?auto=format&fit=crop&w=1200&q=80", href: "/browse?category=gear&type=synths", gearType: "synths" },
  { id: "fallback-9", title: "Tempo Controller", subtitle: "Precision control for performance timing", priceLabel: "EUR 410.00", image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=80", href: "/browse?category=gear&type=controllers", gearType: "controllers" },
  { id: "fallback-10", title: "Sonic Interface", subtitle: "Clean preamps and low-latency drivers", priceLabel: "EUR 199.00", image: "https://images.unsplash.com/photo-1585781911134-b96f4f9f8f9f?auto=format&fit=crop&w=1200&q=80", href: "/browse?category=gear&type=audio-interfaces", gearType: "audio-interfaces" },
];

function normalizeGearFilter(value?: string): GearFilterId {
  if (value === "synths" || value === "controllers" || value === "audio-interfaces" || value === "fx-pedals") return value;
  return "all";
}

function inferGearType(title: string): GearCategory {
  const n = title.toLowerCase();
  if (n.includes("pedal") || n.includes("fx") || n.includes("effect")) return "fx-pedals";
  if (n.includes("interface") || n.includes("mixer") || n.includes("audio")) return "audio-interfaces";
  if (n.includes("controller") || n.includes("dj") || n.includes("deck")) return "controllers";
  return "synths";
}

function createGearFilterHref(q: string | undefined, filterId: GearFilterId): string {
  const params = new URLSearchParams();
  params.set("category", "gear");
  if (q?.trim()) params.set("q", q.trim());
  if (filterId !== "all") params.set("type", filterId);
  return `/browse?${params.toString()}`;
}

// ─── General browse types ─────────────────────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;
  const isMusicGear = params.category === "gear";
  const activeGearFilter = normalizeGearFilter(params.type);

  // Music gear page
  if (isMusicGear) {
    const listings = await getActiveListings({ q: params.q, category: "gear" });

    const listingCards: GearCard[] = listings.map((listing) => ({
      id: `listing-${listing.id}`,
      title: listing.title,
      subtitle: `Condition: ${listing.condition.replace("_", " ")}`,
      priceLabel: formatPrice(listing.price),
      image: listing.images?.[0] || "/modem.jpg",
      href: `/listing/${listing.id}`,
      gearType: inferGearType(listing.title),
    }));

    const allCards = listingCards.length > 0 ? listingCards : FALLBACK_MUSIC_GEAR;
    const filteredCards = activeGearFilter === "all" ? allCards : allCards.filter((c) => c.gearType === activeGearFilter);
    const featuredCards = filteredCards.slice(0, 3);
    const listingGridCards = filteredCards.length > 0 ? filteredCards : FALLBACK_MUSIC_GEAR;

    return (
      <div className="min-h-[60vh] bg-[#d7dbdf] py-8 md:py-10">
        <div className="mx-auto w-full max-w-[1220px] px-4 md:px-6">
          <section className="relative overflow-hidden rounded-[24px] md:rounded-[28px] shadow-[0_24px_50px_rgba(8,13,20,0.24)]">
            <div className="relative h-[220px] md:h-[320px]">
              <Image src={MUSIC_GEAR_HERO_IMAGE} alt="Music gear category banner" fill className="object-cover" priority />
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-black/20" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_26%,rgba(23,169,184,0.24),transparent_58%)]" />
              <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10">
                <h1 className="font-[Sora] text-4xl font-bold text-white md:text-5xl">Music Gear</h1>
                <p className="mt-2 max-w-2xl text-base text-white/85 md:text-2xl">Explore synths, controllers, and everything you need to shape your sound.</p>
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-2xl border border-white/65 bg-[#edf0f2] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] md:px-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <p className="text-sm font-semibold text-[#3d434b]">Filter by:</p>
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                {GEAR_FILTERS.map((filter) => {
                  const isActive = activeGearFilter === filter.id;
                  return (
                    <Link
                      key={filter.id}
                      href={createGearFilterHref(params.q, filter.id)}
                      className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition ${
                        isActive
                          ? "bg-[#f0c418] text-[#171717] shadow-[0_6px_18px_rgba(240,196,24,0.32)]"
                          : "bg-[#dfe3e8] text-[#383e46] hover:bg-[#d4d9df]"
                      }`}
                    >
                      {filter.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="mt-11">
            <h2 className="font-[Sora] text-3xl font-semibold text-[#1a1d23]">Featured Gear</h2>
            <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-3">
              {featuredCards.map((card) => (
                <Link key={card.id} href={card.href} className="group block">
                  <div className="relative aspect-[4/4] overflow-hidden rounded-[16px] bg-[#cad3db]">
                    <Image src={card.image} alt={card.title} fill className="object-cover transition duration-500 group-hover:scale-[1.04]" />
                  </div>
                  <div className="mt-3 space-y-1">
                    <h3 className="font-[Sora] text-xl font-semibold text-[#111317]">{card.title}</h3>
                    <p className="text-base text-[#6b7179]">{card.subtitle}</p>
                    <p className="font-[Sora] text-3xl font-bold text-[#d39f00]">{card.priceLabel}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-14">
            <h2 className="font-[Sora] text-3xl font-semibold text-[#1a1d23]">All Music Gear</h2>
            <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-5">
              {listingGridCards.map((card) => (
                <Link key={`grid-${card.id}`} href={card.href} className="group block">
                  <div className="relative aspect-[4/4] overflow-hidden rounded-[14px] bg-[#c8d1da]">
                    <Image src={card.image} alt={card.title} fill className="object-cover transition duration-500 group-hover:scale-[1.05]" />
                  </div>
                  <div className="mt-2 space-y-0.5">
                    <h3 className="font-[Sora] text-base font-semibold text-[#15191f] line-clamp-1">{card.title}</h3>
                    <p className="text-base text-[#6f7680]">{card.priceLabel}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  // General browse page
  const [listings, featuredListings] = await Promise.all([
    getActiveListings({
      q: params.q,
      category: params.category,
      condition: params.condition,
      sort: params.sort,
      min_price: params.min_price,
      max_price: params.max_price,
    }),
    getFeaturedListings(),
  ]);

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
            <h1 className="text-3xl font-bold text-[var(--text-dark)]" style={{ fontFamily: "var(--font-display)" }}>Browse Listings</h1>
            <p className="text-sm text-[var(--text-grey)] mt-1">
              {listings.length} {listings.length === 1 ? "listing" : "listings"} found
              {activeCount > 0 && " · filters active"}
            </p>
          </div>
          <form className="flex gap-2">
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
            <button type="submit" className="h-10 px-5 rounded-full bg-[var(--brand)] text-white text-sm font-semibold hover:opacity-90 transition">
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

        {/* Condition + Sort */}
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

        {/* Featured carousel */}
        {featuredListings.length > 0 && activeCount === 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 bg-[var(--brand)] text-white text-xs font-bold rounded-full uppercase tracking-wide">Featured</span>
              <h2 className="text-base font-semibold text-[var(--text-dark)]">Handpicked listings</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
              {featuredListings.map((listing) => (
                <Link key={listing.id} href={`/listing/${listing.id}`} className="group shrink-0 w-44 block">
                  <div className="relative w-44 h-44 rounded-xl overflow-hidden bg-gray-100 ring-2 ring-[var(--brand)]/30 group-hover:ring-[var(--brand)] transition">
                    <Image src={listing.images?.[0] || "/modem.jpg"} alt={listing.title} fill className="object-cover group-hover:scale-105 transition duration-300" sizes="176px" />
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 bg-[var(--brand)] text-white text-[10px] font-bold rounded-full">Featured</span>
                    </div>
                  </div>
                  <div className="mt-2 space-y-0.5">
                    <p className="text-sm font-semibold text-[var(--text-dark)] line-clamp-1">{listing.title}</p>
                    <p className="text-sm font-bold text-[var(--brand)]">{formatPrice(listing.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-4 border-t border-gray-100" />
          </div>
        )}

        {/* Clear filters */}
        {activeCount > 0 && (
          <div>
            <Link href="/browse" className="text-sm text-[var(--brand)] hover:underline font-medium">
              ✕ Clear all filters
            </Link>
          </div>
        )}

        {/* Grid */}
        {listings.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-[var(--shadow-card)]">
            <p className="text-xl font-semibold text-[var(--text-dark)] mb-2">No listings found</p>
            <p className="text-[var(--text-grey)] text-sm">Try adjusting your filters or search terms.</p>
            <Link href="/browse" className="mt-4 inline-block text-sm text-[var(--brand)] hover:underline font-medium">Clear filters</Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
              <Link key={listing.id} href={`/listing/${listing.id}`} className="product-card">
                <div className="product-card-img h-52">
                  <Image src={listing.images?.[0] || "/modem.jpg"} alt={listing.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
                </div>
                <div className="product-card-info">
                  <h4>{listing.title}</h4>
                  <div className="category capitalize">{listing.category} · {listing.condition.replace("_", " ")}</div>
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
