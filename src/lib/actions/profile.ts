"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

type UpdateProfileInput = {
  handle: string;
  display_name: string;
  bio?: string;
  location?: string;
  avatar_url?: string | null;
  header_url?: string | null;
};

export async function updateProfile(input: UpdateProfileInput) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const validation = profileSchema
    .pick({ handle: true, display_name: true, bio: true, location: true })
    .safeParse(input);

  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, handle")
    .eq("user_id", user.id)
    .single();

  if (!profile) return { error: "Profile not found" };

  // Check handle availability only if it changed
  if (input.handle !== profile.handle) {
    const { data: taken } = await supabase
      .from("profiles")
      .select("id")
      .eq("handle", input.handle)
      .maybeSingle();

    if (taken) return { error: "Handle already taken" };
  }

  const updateData: Record<string, unknown> = {
    handle: input.handle,
    display_name: input.display_name,
    bio: input.bio || null,
    location: input.location || null,
  };

  if (input.avatar_url !== undefined) {
    updateData.avatar_url = input.avatar_url;
  }

  if (input.header_url !== undefined) {
    updateData.header_url = input.header_url;
  }

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", profile.id);

  if (error) {
    if (error.code === "23505") return { error: "Handle already taken" };
    return { error: "Failed to save. Please try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/seller/${input.handle}`);
  if (input.handle !== profile.handle) {
    revalidatePath(`/seller/${profile.handle}`);
  }

  return { success: true };
}
