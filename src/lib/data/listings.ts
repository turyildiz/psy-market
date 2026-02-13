import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ListingFilters = {
  q?: string;
  category?: string;
};

export async function getActiveListings(filters: ListingFilters = {}) {
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from("listings")
    .select("id, profile_id, title, price, condition, category, images, created_at")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(24);

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.q?.trim()) {
    const search = filters.q.trim();
    query = query.or(
      `title.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`
    );
  }

  const { data, error } = await query;
  if (error) {
    return [];
  }

  return data ?? [];
}

export async function getListingById(id: string) {
  const supabase = await createServerSupabaseClient();

  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .in("status", ["active", "sold"])
    .single();

  if (!listing) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, handle, display_name, avatar_url, location, created_at")
    .eq("id", listing.profile_id)
    .single();

  return { listing, profile };
}

export async function getCurrentUserListings() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return [];
  }

  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, price, status, images, created_at, updated_at")
    .eq("profile_id", profile.id)
    .order("updated_at", { ascending: false });

  return listings ?? [];
}
