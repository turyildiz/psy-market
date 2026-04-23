"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" as const };

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "admin" && userData?.role !== "super_admin") {
    return { error: "Forbidden" as const };
  }

  return { supabase };
}

export async function approveListing(listingId: string) {
  const result = await requireAdmin();
  if ("error" in result) return result;
  const { supabase } = result;

  const { error } = await supabase
    .from("listings")
    .update({ status: "active", admin_notes: null })
    .eq("id", listingId);

  if (error) return { error: "Failed to approve listing" };
  revalidatePath("/admin/listings");
  return { success: true };
}

export async function rejectListing(listingId: string, reason: string) {
  const result = await requireAdmin();
  if ("error" in result) return result;
  const { supabase } = result;

  const { error } = await supabase
    .from("listings")
    .update({ status: "rejected", admin_notes: reason })
    .eq("id", listingId);

  if (error) return { error: "Failed to reject listing" };
  revalidatePath("/admin/listings");
  return { success: true };
}

export async function featureListing(listingId: string, featured: boolean) {
  const result = await requireAdmin();
  if ("error" in result) return result;
  const { supabase } = result;

  const { error } = await supabase
    .from("listings")
    .update({ is_featured: featured })
    .eq("id", listingId);

  if (error) return { error: "Failed to update featured status" };
  revalidatePath("/admin/listings");
  return { success: true };
}

export async function addFeaturedSeller(formData: FormData) {
  const result = await requireAdmin();
  if ("error" in result) return result;
  const { supabase } = result;

  const handle = (formData.get("handle") as string)?.toLowerCase().trim();
  const category = formData.get("category") as string;
  const image_url = (formData.get("image_url") as string)?.trim() || null;

  if (!handle || !category) return { error: "Handle and category required" };

  const { data: profile } = await supabase.from("profiles").select("id").eq("handle", handle).single();
  if (!profile) return { error: "Profile not found" };

  const { error } = await supabase.from("featured_sellers").upsert({
    profile_id: profile.id, category, image_url,
    position: 0,
  }, { onConflict: "profile_id,category" });

  if (error) return { error: error.message };
  revalidatePath("/admin/featured");
  return { success: true };
}

export async function removeFeaturedSeller(id: string) {
  const result = await requireAdmin();
  if ("error" in result) return result;
  const { supabase } = result;
  await supabase.from("featured_sellers").delete().eq("id", id);
  revalidatePath("/admin/featured");
  return { success: true };
}

export async function suspendProfile(profileId: string, suspended: boolean) {
  const result = await requireAdmin();
  if ("error" in result) return result;
  const { supabase } = result;

  const { error } = await supabase
    .from("profiles")
    .update({ is_suspended: suspended })
    .eq("id", profileId);

  if (error) return { error: "Failed to update profile status" };
  revalidatePath("/admin/users");
  return { success: true };
}
