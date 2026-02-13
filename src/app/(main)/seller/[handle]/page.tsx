import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type SellerPageProps = {
  params: Promise<{ handle: string }>;
};

export default async function SellerPage({ params }: SellerPageProps) {
  const { handle } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, handle, display_name, bio, location, avatar_url, created_at")
    .eq("handle", handle)
    .single();

  if (!profile) {
    notFound();
  }

  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, price, images")
    .eq("profile_id", profile.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return (
    <div className="bg-[var(--dark-1)] text-white min-h-[60vh] p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="rounded-lg border border-[var(--dark-3)] bg-[var(--dark-2)] p-6">
          <h1 className="text-3xl font-bold">{profile.display_name}</h1>
          <p className="text-[var(--text-muted)]">@{profile.handle}</p>
          {profile.location ? <p className="text-sm mt-2">{profile.location}</p> : null}
          {profile.bio ? <p className="text-sm mt-3 text-[var(--text-muted)]">{profile.bio}</p> : null}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Active Listings</h2>
          {listings?.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <a
                  key={listing.id}
                  href={`/listing/${listing.id}`}
                  className="rounded-lg border border-[var(--dark-3)] bg-[var(--dark-2)] p-3 block"
                >
                  <p className="font-medium line-clamp-1">{listing.title}</p>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-[var(--text-muted)]">No active listings yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

