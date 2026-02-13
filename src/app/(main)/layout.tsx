import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { LoginModalProvider } from "@/components/auth/login-modal-provider";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("handle, display_name, avatar_url")
      .eq("user_id", user.id)
      .single();
    profile = data;
  }

  return (
    <LoginModalProvider>
      <SiteHeader
        user={user ? { id: user.id, email: user.email ?? undefined } : null}
        profile={profile}
      />
      <main>{children}</main>
      <SiteFooter />
    </LoginModalProvider>
  );
}
