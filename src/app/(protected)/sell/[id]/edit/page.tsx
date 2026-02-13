import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ListingForm } from "@/components/listings/listing-form";

type EditListingPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/?auth=login&next=${encodeURIComponent(`/sell/${id}/edit`)}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    redirect("/onboarding");
  }

  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .eq("profile_id", profile.id)
    .single();

  if (!listing) {
    notFound();
  }

  return (
    <div className="bg-[var(--dark-1)] text-white min-h-[60vh] p-8">
      <ListingForm mode="edit" listingId={id} initialValues={listing} />
    </div>
  );
}
