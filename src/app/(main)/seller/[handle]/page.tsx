import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

type SellerPageProps = {
  params: Promise<{ handle: string }>;
};

function getInitials(name: string | undefined) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default async function SellerPage({ params }: SellerPageProps) {
  const { handle } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, handle, display_name, bio, location, avatar_url, created_at")
    .eq("handle", handle)
    .single();

  if (!profile) notFound();

  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, price, images, category, condition, size")
    .eq("profile_id", profile.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const joinedDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  return (
    <div className="min-h-[70vh]">
      <div className="max-w-[1200px] mx-auto px-4 pt-6">
        {/* Banner */}
        <div className="relative w-full h-40 md:h-52 rounded-2xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1400&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Avatar + Name */}
        <div className="relative z-10 flex items-end gap-5 -mt-10 px-2 pb-6">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#1a1a1a] border-4 border-white shadow-lg shrink-0 overflow-hidden flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.avatar_url || "/reference/profile_picture.jpeg"}
              alt={profile.display_name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="pb-1">
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text-dark)]" style={{ fontFamily: "var(--font-display)" }}>
              {profile.display_name}
            </h1>
            <p className="text-sm text-[var(--text-grey)] mt-0.5">
              {[profile.location, joinedDate ? `Joined ${joinedDate}` : null].filter(Boolean).join(" • ")}
            </p>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm text-[var(--text-grey)] mb-6 max-w-2xl">{profile.bio}</p>
        )}

        {/* Active Listings */}
        <h2 className="text-xl font-bold text-[var(--text-dark)] mb-5" style={{ fontFamily: "var(--font-display)" }}>
          Active Listings
        </h2>

        {listings?.length ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pb-12">
            {listings.map((listing) => (
              <Link key={listing.id} href={`/listing/${listing.id}`} className="product-card">
                <div className="product-card-img h-52">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={listing.images?.[0] || "/modem.jpg"} alt={listing.title} />
                </div>
                <div className="product-card-info">
                  <div className="category uppercase text-xs tracking-wide">{listing.category}</div>
                  <h4>{listing.title}</h4>
                  <div className="text-xs text-[var(--text-grey)] mb-1">
                    {listing.size ? `Size: ${listing.size} • ` : ""}Condition: {listing.condition.replace("_", " ")}
                  </div>
                  <div className="price">{formatPrice(listing.price)}</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-[var(--text-grey)] pb-12">No active listings yet.</p>
        )}
      </div>
    </div>
  );
}
