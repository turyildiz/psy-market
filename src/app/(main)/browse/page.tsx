import Link from "next/link";
import Image from "next/image";
import { getActiveListings } from "@/lib/data/listings";
import { formatPrice } from "@/lib/utils";

type BrowsePageProps = {
  searchParams: Promise<{ q?: string; category?: string; type?: string }>;
};

type GearFilterId =
  | "all"
  | "synths"
  | "controllers"
  | "audio-interfaces"
  | "fx-pedals";

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
  {
    id: "fallback-1",
    title: "Nebula Synth X500",
    subtitle: "Advanced synthesizer for sound design",
    priceLabel: "EUR 1,299.00",
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    href: "/browse?category=gear&type=synths",
    gearType: "synths",
  },
  {
    id: "fallback-2",
    title: "Pulse DJ Controller Pro",
    subtitle: "Professional DJ controller with tactile feedback",
    priceLabel: "EUR 899.00",
    image:
      "https://images.unsplash.com/photo-1571266028243-6084d3f6f8f7?auto=format&fit=crop&w=1200&q=80",
    href: "/browse?category=gear&type=controllers",
    gearType: "controllers",
  },
  {
    id: "fallback-3",
    title: "Sonic Audio Interface 2000",
    subtitle: "High-fidelity audio interface for recording",
    priceLabel: "EUR 450.00",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80",
    href: "/browse?category=gear&type=audio-interfaces",
    gearType: "audio-interfaces",
  },
  {
    id: "fallback-4",
    title: "Cosmic Synth",
    subtitle: "Analog warmth with modern controls",
    priceLabel: "EUR 750.00",
    image:
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80",
    href: "/browse?category=gear&type=synths",
    gearType: "synths",
  },
  {
    id: "fallback-5",
    title: "Rhythmic Controller",
    subtitle: "Performance pad for hybrid live sets",
    priceLabel: "EUR 320.00",
    image:
      "https://images.unsplash.com/photo-1520170350707-b2da59970118?auto=format&fit=crop&w=1200&q=80",
    href: "/browse?category=gear&type=controllers",
    gearType: "controllers",
  },
  {
    id: "fallback-6",
    title: "Aural Interface",
    subtitle: "Compact recording companion",
    priceLabel: "EUR 250.00",
    image:
      "https://images.unsplash.com/photo-1514119412350-e174d90d280e?auto=format&fit=crop&w=1200&q=80",
    href: "/browse?category=gear&type=audio-interfaces",
    gearType: "audio-interfaces",
  },
  {
    id: "fallback-7",
    title: "Echo FX Pedal",
    subtitle: "Ambient textures in one stomp",
    priceLabel: "EUR 180.00",
    image:
      "https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=1200&q=80",
    href: "/browse?category=gear&type=fx-pedals",
    gearType: "fx-pedals",
  },
  {
    id: "fallback-8",
    title: "Harmonic Synth",
    subtitle: "Polyphonic synth with lush pads",
    priceLabel: "EUR 990.00",
    image:
      "https://images.unsplash.com/photo-1507835667282-7d4b6b47a7a5?auto=format&fit=crop&w=1200&q=80",
    href: "/browse?category=gear&type=synths",
    gearType: "synths",
  },
  {
    id: "fallback-9",
    title: "Tempo Controller",
    subtitle: "Precision control for performance timing",
    priceLabel: "EUR 410.00",
    image:
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=80",
    href: "/browse?category=gear&type=controllers",
    gearType: "controllers",
  },
  {
    id: "fallback-10",
    title: "Sonic Interface",
    subtitle: "Clean preamps and low-latency drivers",
    priceLabel: "EUR 199.00",
    image:
      "https://images.unsplash.com/photo-1585781911134-b96f4f9f8f9f?auto=format&fit=crop&w=1200&q=80",
    href: "/browse?category=gear&type=audio-interfaces",
    gearType: "audio-interfaces",
  },
];

function normalizeGearFilter(value?: string): GearFilterId {
  if (
    value === "synths" ||
    value === "controllers" ||
    value === "audio-interfaces" ||
    value === "fx-pedals"
  ) {
    return value;
  }
  return "all";
}

function inferGearType(title: string): GearCategory {
  const normalized = title.toLowerCase();
  if (
    normalized.includes("pedal") ||
    normalized.includes("fx") ||
    normalized.includes("effect")
  ) {
    return "fx-pedals";
  }
  if (
    normalized.includes("interface") ||
    normalized.includes("mixer") ||
    normalized.includes("audio")
  ) {
    return "audio-interfaces";
  }
  if (
    normalized.includes("controller") ||
    normalized.includes("dj") ||
    normalized.includes("deck")
  ) {
    return "controllers";
  }
  return "synths";
}

function createFilterHref(q: string | undefined, filterId: GearFilterId): string {
  const params = new URLSearchParams();
  params.set("category", "gear");
  if (q?.trim()) {
    params.set("q", q.trim());
  }
  if (filterId !== "all") {
    params.set("type", filterId);
  }
  return `/browse?${params.toString()}`;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;
  const isMusicGear = params.category === "gear";
  const activeGearFilter = normalizeGearFilter(params.type);
  const listings = await getActiveListings({
    q: params.q,
    category: params.category,
  });

  if (isMusicGear) {
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
    const filteredCards =
      activeGearFilter === "all"
        ? allCards
        : allCards.filter((card) => card.gearType === activeGearFilter);
    const featuredCards = filteredCards.slice(0, 3);
    const listingGridCards =
      filteredCards.length > 0 ? filteredCards : FALLBACK_MUSIC_GEAR;

    return (
      <div className="min-h-[60vh] bg-[#d7dbdf] py-8 md:py-10">
        <div className="mx-auto w-full max-w-[1220px] px-4 md:px-6">
          <section className="relative overflow-hidden rounded-[24px] md:rounded-[28px] shadow-[0_24px_50px_rgba(8,13,20,0.24)]">
            <div className="relative h-[220px] md:h-[320px]">
              <Image
                src={MUSIC_GEAR_HERO_IMAGE}
                alt="Music gear category banner"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-black/20" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_26%,rgba(23,169,184,0.24),transparent_58%)]" />
              <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10">
                <h1 className="font-[Sora] text-4xl font-bold text-white md:text-5xl">
                  Music Gear
                </h1>
                <p className="mt-2 max-w-2xl text-base text-white/85 md:text-2xl">
                  Explore synths, controllers, and everything you need to shape
                  your sound.
                </p>
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
                      href={createFilterHref(params.q, filter.id)}
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
            <h2 className="font-[Sora] text-3xl font-semibold text-[#1a1d23]">
              Featured Gear
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-3">
              {featuredCards.map((card) => (
                <Link key={card.id} href={card.href} className="group block">
                  <div className="relative aspect-[4/4] overflow-hidden rounded-[16px] bg-[#cad3db]">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="mt-3 space-y-1">
                    <h3 className="font-[Sora] text-xl font-semibold text-[#111317]">
                      {card.title}
                    </h3>
                    <p className="text-base text-[#6b7179]">{card.subtitle}</p>
                    <p className="font-[Sora] text-3xl font-bold text-[#d39f00]">
                      {card.priceLabel}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-14">
            <h2 className="font-[Sora] text-3xl font-semibold text-[#1a1d23]">
              All Music Gear
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-5">
              {listingGridCards.map((card) => (
                <Link key={`grid-${card.id}`} href={card.href} className="group block">
                  <div className="relative aspect-[4/4] overflow-hidden rounded-[14px] bg-[#c8d1da]">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.05]"
                    />
                  </div>
                  <div className="mt-2 space-y-0.5">
                    <h3 className="font-[Sora] text-base font-semibold text-[#15191f] line-clamp-1">
                      {card.title}
                    </h3>
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
