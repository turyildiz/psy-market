import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user!.id)
    .single();

  return (
    <div className="bg-[var(--dark-1)] text-white p-8 min-h-[60vh]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-[var(--text-muted)] mb-8">
          Welcome back, {profile?.display_name || "User"}
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-[var(--dark-3)] bg-[var(--dark-2)] p-6">
            <h2 className="text-sm font-medium text-[var(--text-muted)] mb-1">Handle</h2>
            <p className="text-lg font-semibold">@{profile?.handle}</p>
          </div>
          <div className="rounded-lg border border-[var(--dark-3)] bg-[var(--dark-2)] p-6">
            <h2 className="text-sm font-medium text-[var(--text-muted)] mb-1">Listings</h2>
            <p className="text-lg font-semibold">0</p>
          </div>
          <div className="rounded-lg border border-[var(--dark-3)] bg-[var(--dark-2)] p-6">
            <h2 className="text-sm font-medium text-[var(--text-muted)] mb-1">Messages</h2>
            <p className="text-lg font-semibold">0</p>
          </div>
        </div>

        <p className="mt-8 text-sm text-[var(--text-grey)]">
          This is a placeholder dashboard. Full functionality coming soon.
        </p>
      </div>
    </div>
  );
}
