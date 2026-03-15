import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user!.id)
    .single();

  // Get profiles this user follows
  const { data: following } = await supabase
    .from("follows")
    .select("following_profile_id")
    .eq("follower_profile_id", myProfile?.id ?? "");

  const followingIds = (following ?? []).map((f) => f.following_profile_id);

  // Get latest listings from followed sellers
  const { data: feedListings } = followingIds.length > 0
    ? await supabase
        .from("listings")
        .select("id, title, price, images, category, condition, profile_id, created_at")
        .in("profile_id", followingIds)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(24)
    : { data: [] };

  // Get profile info for feed listings
  const feedProfileIds = [...new Set((feedListings ?? []).map((l) => l.profile_id))];
  const { data: feedProfiles } = feedProfileIds.length > 0
    ? await supabase
        .from("profiles")
        .select("id, handle, display_name, avatar_url")
        .in("id", feedProfileIds)
    : { data: [] };

  const profileMap = Object.fromEntries((feedProfiles ?? []).map((p) => [p.id, p]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2
            className="text-xl font-black text-[var(--text-dark)] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Following Feed
          </h2>
          {followingIds.length > 0 && (
            <p className="text-xs text-[var(--text-grey)] mt-0.5">
              Latest from {followingIds.length} seller{followingIds.length !== 1 ? "s" : ""} you follow
            </p>
          )}
        </div>
      </div>

      {followingIds.length === 0 ? (
        <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-[var(--shadow-card)] p-10 text-center">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 opacity-60 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-gradient-to-tr from-orange-100 to-yellow-100 opacity-50 blur-2xl pointer-events-none" />
          <div className="relative">
            <p className="text-4xl mb-3">🌍</p>
            <p className="font-bold text-[var(--text-dark)] text-lg mb-1" style={{ fontFamily: "var(--font-display)" }}>
              Your feed is empty
            </p>
            <p className="text-sm text-[var(--text-grey)] mb-5 max-w-xs mx-auto">
              Follow sellers to see their latest listings here.
            </p>
            <Link
              href="/browse"
              className="inline-block px-6 py-2.5 rounded-full bg-gradient-to-r from-[var(--brand)] to-orange-400 text-white text-sm font-bold shadow-[0_6px_20px_rgba(255,107,53,0.35)] hover:opacity-90 transition"
            >
              Discover sellers
            </Link>
          </div>
        </div>
      ) : feedListings?.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-[var(--shadow-card)] p-8 text-center">
          <p className="text-[var(--text-grey)]">No new listings from people you follow.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {(feedListings ?? []).map((listing) => {
            const seller = profileMap[listing.profile_id];
            return (
              <Link
                key={listing.id}
                href={`/listing/${listing.id}`}
                className="group relative bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-square overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={listing.images?.[0] || "/modem.jpg"}
                    alt={listing.title}
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  {seller && (
                    <Link
                      href={`/seller/${seller.handle}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 mb-1.5 group/seller"
                    >
                      <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-200 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={seller.avatar_url || "/reference/profile_picture.jpeg"} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs text-[var(--text-grey)] font-medium group-hover/seller:text-[var(--brand)] transition truncate">
                        @{seller.handle}
                      </span>
                    </Link>
                  )}
                  <p className="font-bold text-[var(--text-dark)] text-sm line-clamp-1" style={{ fontFamily: "var(--font-display)" }}>
                    {listing.title}
                  </p>
                  <p className="text-[var(--brand)] font-black text-base mt-0.5" style={{ fontFamily: "var(--font-display)" }}>
                    {formatPrice(listing.price)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
