"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { handleSchema } from "@/lib/validators";
import { redirect } from "next/navigation";

export async function checkHandleAvailability(handle: string) {
  const validation = handleSchema.safeParse(handle);
  if (!validation.success) {
    return { available: false, error: validation.error.issues[0].message };
  }

  // Check profiles table (publicly readable via RLS)
  const supabase = await createServerSupabaseClient();
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("handle", handle)
    .single();

  if (existingProfile) {
    return { available: false, error: "Handle already taken" };
  }

  // Check reserved handles (needs admin client — no public RLS policies)
  const { data: reserved } = await supabaseAdmin
    .from("reserved_handles")
    .select("id")
    .eq("handle", handle)
    .eq("consumed", false)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (reserved) {
    return { available: false, error: "Handle is reserved" };
  }

  return { available: true };
}

export async function completeOnboarding(formData: {
  handle: string;
  display_name: string;
  location?: string;
}) {
  const supabase = await createServerSupabaseClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Validate handle
  const validation = handleSchema.safeParse(formData.handle);
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  // Verify handle availability one more time
  const availability = await checkHandleAvailability(formData.handle);
  if (!availability.available) {
    return { error: availability.error || "Handle unavailable" };
  }

  // Get the user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { error: "Profile not found" };
  }

  // Update profile with chosen handle and display name
  const { error } = await supabase
    .from("profiles")
    .update({
      handle: formData.handle,
      display_name: formData.display_name,
      location: formData.location || null,
    })
    .eq("id", profile.id);

  if (error) {
    if (error.code === "23505") {
      return { error: "Handle already taken" };
    }
    return { error: "Failed to update profile. Please try again." };
  }

  redirect("/dashboard");
}
