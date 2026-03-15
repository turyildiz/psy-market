import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileEditForm } from "./_components/profile-edit-form";

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("handle, display_name, bio, avatar_url, header_url, location")
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect("/onboarding");

  return <ProfileEditForm profile={profile} userId={user.id} />;
}
