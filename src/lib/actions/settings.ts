"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";

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

  // Sign out first so the session is invalidated
  await supabase.auth.signOut();

  // Hard delete: remove from public.users (cascades to profiles → listings/messages/favorites/follows)
  // Then delete the auth.users record using service role
  const admin = createServiceRoleClient();
  await admin.from("users").delete().eq("id", user.id);
  await admin.auth.admin.deleteUser(user.id);

  redirect("/");
}
