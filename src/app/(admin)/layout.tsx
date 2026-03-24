import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("handle, display_name, avatar_url")
    .eq("user_id", user.id)
    .single();

  return (
    <>
      <SiteHeader user={{ id: user.id, email: user.email ?? undefined }} profile={profile} />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[1200px] mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* Sidebar */}
            <aside className="w-48 shrink-0">
              <nav className="space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Admin</p>
                <Link href="/admin" className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm transition">
                  Overview
                </Link>
                <Link href="/admin/listings" className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm transition">
                  Listings Queue
                </Link>
                <Link href="/admin/users" className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm transition">
                  Users
                </Link>
              </nav>
            </aside>
            {/* Main */}
            <main className="flex-1 min-w-0">{children}</main>
          </div>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
