import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUserListings } from "@/lib/data/listings";
import { formatPrice } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, handle")
    .eq("user_id", user!.id)
    .single();

  const listings = await getCurrentUserListings();
  const activeListings = listings.filter((l) => l.status === "active");

  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--text-dark)] mb-5" style={{ fontFamily: "var(--font-display)" }}>
        Active Listings
      </h2>

      {activeListings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-[var(--shadow-card)] p-8 text-center">
          <p className="text-[var(--text-grey)] mb-4">You have no active listings yet.</p>
          <Link
            href="/sell"
            className="inline-block h-10 px-6 rounded-full bg-[var(--brand)] text-white text-sm font-semibold hover:opacity-90 transition"
          >
            Create your first listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {activeListings.map((listing) => (
            <Link key={listing.id} href={`/listing/${listing.id}`} className="product-card">
              <div className="product-card-img h-44">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={listing.images?.[0] || "/modem.jpg"} alt={listing.title} />
              </div>
              <div className="product-card-info">
                <h4>{listing.title}</h4>
                <div className="price">{formatPrice(listing.price)}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {profile?.handle && (
        <p className="mt-6 text-sm text-[var(--text-grey)]">
          Public profile:{" "}
          <Link href={`/seller/${profile.handle}`} className="text-[var(--brand)] font-medium hover:opacity-75 transition">
            psy.market/seller/{profile.handle}
          </Link>
        </p>
      )}
    </div>
  );
}
