import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DashboardNav } from "./_components/dashboard-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("handle, display_name, avatar_url, location, created_at, bio, is_creator")
        .eq("user_id", user.id)
        .single()
    : { data: null };

  const { count: listingCount } = user && profile
    ? await supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", (await supabase.from("profiles").select("id").eq("user_id", user.id).single()).data?.id ?? "")
        .eq("status", "active")
    : { count: 0 };

  const joinedYear = profile?.created_at
    ? new Date(profile.created_at).getFullYear()
    : null;

  return (
    <div className="min-h-[70vh]">
      {/* ── BANNER ───────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-4 pt-6">
        <div className="relative w-full h-52 md:h-64 rounded-3xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1400&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
          {/* dark top vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
          {/* bottom fade to page bg */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F3F4F6] to-transparent" />

          {/* Creator badge top-right */}
          {profile?.is_creator && (
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-[var(--brand)] text-white shadow-lg">
              ✦ Creator
            </div>
          )}
        </div>
      </div>

      {/* ── PROFILE INFO ─────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 pb-5">
          {/* Avatar with gradient ring */}
          <div className="shrink-0 p-[3px] rounded-full bg-gradient-to-br from-[var(--brand)] via-orange-300 to-pink-500 shadow-xl w-fit">
            <div className="p-[3px] rounded-full bg-[#F3F4F6]">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profile?.avatar_url || "/reference/profile_picture.jpeg"}
                  alt={profile?.display_name ?? "Profile"}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="sm:pb-1 flex-1">
            <h1
              className="text-2xl md:text-3xl font-black tracking-tight text-[var(--text-dark)] leading-none"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {profile?.display_name ?? "My Profile"}
            </h1>
            <p className="text-sm text-[var(--text-grey)] mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
              {profile?.handle && <span className="text-[var(--brand)] font-semibold">@{profile.handle}</span>}
              {profile?.location && <span>· {profile.location}</span>}
              {joinedYear && <span>· Member since {joinedYear}</span>}
            </p>
          </div>
        </div>

        {/* ── STATS STRIP ────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 mb-7">
          <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-gray-200 shadow-[var(--shadow-card)]">
            <span className="text-xl font-black text-[var(--brand)]" style={{ fontFamily: "var(--font-display)" }}>
              {listingCount ?? 0}
            </span>
            <span className="text-xs font-semibold text-[var(--text-grey)] uppercase tracking-wide">Active Listings</span>
          </div>
          {profile?.location && (
            <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-gray-200 shadow-[var(--shadow-card)]">
              <span className="text-base">📍</span>
              <span className="text-sm font-semibold text-[var(--text-dark)]">{profile.location}</span>
            </div>
          )}
          {joinedYear && (
            <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-gray-200 shadow-[var(--shadow-card)]">
              <span className="text-base">🎪</span>
              <span className="text-sm font-semibold text-[var(--text-dark)]">Since {joinedYear}</span>
            </div>
          )}
        </div>

        {/* ── SIDEBAR + CONTENT ──────────────────────────────── */}
        <div className="flex flex-col md:flex-row gap-6 items-start pb-12">
          <DashboardNav />
          <div className="flex-1 min-w-0 w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
