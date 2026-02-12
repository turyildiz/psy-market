import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // User is guaranteed by middleware, but TypeScript needs the check
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("handle, display_name, avatar_url")
    .eq("user_id", user.id)
    .single();

  return (
    <>
      <SiteHeader
        user={{ id: user.id, email: user.email ?? undefined }}
        profile={profile}
      />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
