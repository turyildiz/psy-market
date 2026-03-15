import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DashboardNav } from "./_components/dashboard-nav";

function getInitials(name: string | undefined) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("handle, display_name, avatar_url, location, created_at")
        .eq("user_id", user.id)
        .single()
    : { data: null };

  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  return (
    <div className="min-h-[70vh]">
      {/* Profile Hero */}
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

        {/* Avatar + Name row */}
        <div className="relative z-10 flex items-end gap-5 -mt-10 px-2 pb-4">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#1a1a1a] border-4 border-white shadow-lg shrink-0 overflow-hidden flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile?.avatar_url || "/reference/profile_picture.jpeg"}
              alt={profile?.display_name ?? "Profile"}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="pb-1">
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text-dark)]" style={{ fontFamily: "var(--font-display)" }}>
              {profile?.display_name ?? "My Profile"}
            </h1>
            <p className="text-sm text-[var(--text-grey)] mt-0.5">
              {[profile?.location, joinedDate ? `Joined ${joinedDate}` : null].filter(Boolean).join(" • ")}
            </p>
          </div>
        </div>
      </div>

      {/* Sidebar + Content */}
      <div className="max-w-[1200px] mx-auto px-4 pb-10">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <DashboardNav />
          <div className="flex-1 min-w-0 w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
