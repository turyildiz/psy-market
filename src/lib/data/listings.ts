import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ListingFilters = {
  q?: string;
  category?: string;
  condition?: string;
  sort?: string;
  min_price?: string;
  max_price?: string;
};

export async function getActiveListings(filters: ListingFilters = {}) {
  const supabase = await createServerSupabaseClient();

  const ascending = filters.sort === "price_asc";
  const orderBy = filters.sort === "price_asc" || filters.sort === "price_desc" ? "price" : "created_at";

  let query = supabase
    .from("listings")
    .select("id, profile_id, title, price, condition, category, images, created_at")
    .eq("status", "active")
    .order(orderBy, { ascending })
    .limit(48);

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.condition) {
    query = query.eq("condition", filters.condition);
  }

  if (filters.min_price) {
    const cents = Math.round(Number(filters.min_price) * 100);
    if (!isNaN(cents)) query = query.gte("price", cents);
  }

  if (filters.max_price) {
    const cents = Math.round(Number(filters.max_price) * 100);
    if (!isNaN(cents)) query = query.lte("price", cents);
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

export async function getFeaturedListings() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("listings")
    .select("id, title, price, condition, category, images")
    .eq("status", "active")
    .eq("is_featured", true)
    .order("updated_at", { ascending: false })
    .limit(10);
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
