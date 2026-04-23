"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");
  const { data } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (data?.role !== "admin" && data?.role !== "super_admin") redirect("/");
}

export async function addReservedHandle(formData: FormData) {
  await requireAdmin();
  const handle = (formData.get("handle") as string)?.toLowerCase().trim();
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const days = parseInt(formData.get("days") as string) || 90;
  if (!handle || !email) return;
  const supabase = createServiceRoleClient();
  await supabase.from("reserved_handles").insert({
    handle,
    email,
    expires_at: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
  });
  revalidatePath("/admin/handles");
}

export async function deleteReservedHandle(id: string) {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  await supabase.from("reserved_handles").delete().eq("id", id);
  revalidatePath("/admin/handles");
}

export async function addBlockedHandle(formData: FormData) {
  await requireAdmin();
  const handle = (formData.get("handle") as string)?.toLowerCase().trim();
  if (!handle) return;
  const supabase = createServiceRoleClient();
  await supabase.from("blocked_handles").insert({ handle });
  revalidatePath("/admin/handles");
}

export async function deleteBlockedHandle(id: string) {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  await supabase.from("blocked_handles").delete().eq("id", id);
  revalidatePath("/admin/handles");
}
