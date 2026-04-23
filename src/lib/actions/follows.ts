"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function followSeller(followingProfileId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) return { error: "Profile not found" };

  const { error } = await supabase
    .from("follows")
    .insert({ follower_profile_id: profile.id, following_profile_id: followingProfileId });

  if (error) return { error: error.message };

  revalidatePath(`/[handle]`, "page");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function unfollowSeller(followingProfileId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) return { error: "Profile not found" };

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_profile_id", profile.id)
    .eq("following_profile_id", followingProfileId);

  if (error) return { error: error.message };

  revalidatePath(`/[handle]`, "page");
  revalidatePath("/dashboard");
  return { success: true };
}
