"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function updateEmailNotifications(enabled: boolean) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("users")
    .update({ email_notifications: enabled })
    .eq("id", user.id);

  if (error) return { error: "Failed to update preferences" };
  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function deleteAccount() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Soft-delete: suspend all profiles and sign out
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id);

  if (profiles && profiles.length > 0) {
    await supabase
      .from("profiles")
      .update({ is_suspended: true })
      .in("id", profiles.map((p) => p.id));
  }

  // Sign the user out
  await supabase.auth.signOut();
  redirect("/");
}
