"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function getCurrentProfileId() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" as const };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) return { error: "Profile not found" as const };
  return { profileId: profile.id, supabase };
}

export async function toggleFavorite(listingId: string) {
  const result = await getCurrentProfileId();
  if ("error" in result) return { error: result.error };
  const { profileId, supabase } = result;

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("profile_id", profileId)
    .eq("listing_id", listingId)
    .single();

  if (existing) {
    await supabase.from("favorites").delete().eq("id", existing.id);
    revalidatePath(`/listing/${listingId}`);
    revalidatePath("/dashboard/saved");
    return { saved: false };
  } else {
    await supabase.from("favorites").insert({ profile_id: profileId, listing_id: listingId });
    revalidatePath(`/listing/${listingId}`);
    revalidatePath("/dashboard/saved");
    return { saved: true };
  }
}

export async function getSavedListings() {
  const result = await getCurrentProfileId();
  if ("error" in result) return [];
  const { profileId, supabase } = result;

  const { data } = await supabase
    .from("favorites")
    .select(`
      listing:listings(id, title, price, condition, category, images, status)
    `)
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  return (data ?? [])
    .map((f) => Array.isArray(f.listing) ? f.listing[0] : f.listing)
    .filter((l): l is NonNullable<typeof l> => !!l && l.status === "active");
}

export async function getIsFavorited(listingId: string): Promise<boolean> {
  const result = await getCurrentProfileId();
  if ("error" in result) return false;
  const { profileId, supabase } = result;

  const { data } = await supabase
    .from("favorites")
    .select("id")
    .eq("profile_id", profileId)
    .eq("listing_id", listingId)
    .single();

  return !!data;
}
