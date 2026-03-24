import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SettingsForm } from "./_components/settings-form";

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: userData } = await supabase
    .from("users")
    .select("email_notifications")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-[var(--shadow-card)] p-8">
        <h1 className="text-2xl font-bold text-[var(--text-dark)] mb-6" style={{ fontFamily: "var(--font-display)" }}>
          Settings
        </h1>

        <SettingsForm
          email={user.email ?? ""}
          emailNotifications={userData?.email_notifications ?? true}
        />
      </div>
    </div>
  );
}
