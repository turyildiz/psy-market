import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { FollowButton } from "@/components/seller/follow-button";

type SellerPageProps = {
  params: Promise<{ handle: string }>;
};

export default async function SellerPage({ params }: SellerPageProps) {
  const { handle } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, handle, display_name, bio, location, avatar_url, created_at")
    .eq("handle", handle)
    .single();

  if (!profile) notFound();

  const [{ data: listings }, { count: followerCount }, currentUserProfile] = await Promise.all([
    supabase
      .from("listings")
      .select("id, title, price, images, category, condition, size")
      .eq("profile_id", profile.id)
      .eq("status", "active")
      .order("created_at", { ascending: false }),
    supabase
      .from("follows")
      .select("id", { count: "exact", head: true })
      .eq("following_profile_id", profile.id),
    user
      ? supabase.from("profiles").select("id").eq("user_id", user.id).single()
      : Promise.resolve({ data: null }),
  ]);

  const myProfileId = currentUserProfile?.data?.id ?? null;
  const isOwnProfile = myProfileId === profile.id;

  let isFollowing = false;
  if (myProfileId && !isOwnProfile) {
    const { data: follow } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_profile_id", myProfileId)
      .eq("following_profile_id", profile.id)
      .single();
    isFollowing = !!follow;
  }

  const joinedDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  return (
    <div className="min-h-[70vh]">
      <div className="max-w-[1200px] mx-auto px-4 pt-6">
        {/* Banner */}
        <div className="relative w-full h-40 md:h-52 rounded-3xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1400&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F3F4F6] to-transparent" />
        </div>

        {/* Avatar + Name + Follow */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 pb-5">
          <div className="shrink-0 p-[3px] rounded-full bg-gradient-to-br from-[var(--brand)] via-orange-300 to-pink-500 shadow-xl w-fit">
            <div className="p-[3px] rounded-full bg-[#F3F4F6]">
              <div className="w-24 h-24 rounded-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profile.avatar_url || "/reference/profile_picture.jpeg"}
                  alt={profile.display_name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 sm:pb-1 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[var(--text-dark)]" style={{ fontFamily: "var(--font-display)" }}>
                {profile.display_name}
              </h1>
              <p className="text-sm text-[var(--text-grey)] mt-0.5 flex flex-wrap gap-x-2">
                <span className="text-[var(--brand)] font-semibold">@{profile.handle}</span>
                {profile.location && <span>· {profile.location}</span>}
                {joinedDate && <span>· Joined {joinedDate}</span>}
              </p>
            </div>

            <FollowButton
              profileId={profile.id}
              initialFollowing={isFollowing}
              followerCount={followerCount ?? 0}
              isOwnProfile={isOwnProfile}
            />
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm text-[var(--text-grey)] mb-6 max-w-2xl">{profile.bio}</p>
        )}

        {/* Listings */}
        <h2 className="text-xl font-black text-[var(--text-dark)] mb-5 tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          Active Listings
          {listings?.length ? <span className="ml-2 text-base font-semibold text-[var(--text-grey)]">({listings.length})</span> : null}
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
                  {(listing.size || listing.condition) && (
                    <div className="text-xs text-[var(--text-grey)] mb-1">
                      {listing.size ? `Size: ${listing.size}` : ""}{listing.size && listing.condition ? " · " : ""}
                      {listing.condition ? `Condition: ${listing.condition.replace("_", " ")}` : ""}
                    </div>
                  )}
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
