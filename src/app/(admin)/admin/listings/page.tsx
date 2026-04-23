import Link from "next/link";
import Image from "next/image";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { AdminListingActions } from "./_components/admin-listing-actions";

type AdminListingsPageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminListingsPage({ searchParams }: AdminListingsPageProps) {
  const params = await searchParams;
  const status = params.status === "active" ? "active" : "pending";
  const supabase = await createServerSupabaseClient();

  const { data: listings } = await supabase
    .from("listings")
    .select(`
      id, title, description, price, condition, category, images,
      status, admin_notes, is_featured, submitted_at, created_at,
      profile:profiles(id, handle, display_name, avatar_url)
    `)
    .eq("status", status)
    .order("submitted_at", { ascending: true, nullsFirst: false })
    .limit(50);

  const tabs = [
    { id: "pending", label: "Pending Review" },
    { id: "active", label: "Active Listings" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Listings</h1>
        <p className="text-sm text-gray-500 mt-1">
          {status === "pending" ? "Review and approve listings submitted by sellers." : "All currently active listings."}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={`/admin/listings${tab.id === "active" ? "?status=active" : ""}`}
            className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition ${
              status === tab.id
                ? "border-[var(--brand)] text-[var(--brand)]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Listings */}
      {!listings || listings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">
            {status === "pending" ? "No listings pending review." : "No active listings."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => {
            const profile = Array.isArray(listing.profile) ? listing.profile[0] : listing.profile;
            return (
              <div key={listing.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex gap-4 p-4">
                  {/* Image */}
                  <div className="relative w-28 h-28 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {listing.images?.[0] ? (
                      <Image
                        src={listing.images[0]}
                        alt={listing.title}
                        fill
                        className="object-cover"
                        sizes="112px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 truncate">{listing.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-500 capitalize">{listing.category}</span>
                          <span className="text-gray-300">·</span>
                          <span className="text-sm text-gray-500 capitalize">{listing.condition.replace("_", " ")}</span>
                          <span className="text-gray-300">·</span>
                          <span className="text-sm font-semibold text-[var(--brand)]">{formatPrice(listing.price)}</span>
                        </div>
                        {profile && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <Link
                              href={`/${profile.handle}`}
                              className="text-xs text-blue-600 hover:underline font-medium"
                              target="_blank"
                            >
                              @{profile.handle}
                            </Link>
                            <span className="text-gray-300">·</span>
                            <span className="text-xs text-gray-400">
                              Submitted {listing.submitted_at
                                ? new Date(listing.submitted_at).toLocaleDateString()
                                : "N/A"}
                            </span>
                          </div>
                        )}
                      </div>
                      {listing.is_featured && (
                        <span className="shrink-0 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{listing.description}</p>
                    {listing.admin_notes && (
                      <div className="mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                        <span className="font-semibold">Rejection note:</span> {listing.admin_notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
                  <Link
                    href={`/listing/${listing.id}`}
                    target="_blank"
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    View listing
                  </Link>
                  <div className="ml-auto">
                    <AdminListingActions
                      listingId={listing.id}
                      status={listing.status}
                      isFeatured={listing.is_featured}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
