import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function AdminOverviewPage() {
  const supabase = await createServerSupabaseClient();

  const [
    { count: pendingCount },
    { count: activeCount },
    { count: userCount },
    { count: profileCount },
  ] = await Promise.all([
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Pending Approval", value: pendingCount ?? 0, href: "/admin/listings", urgent: (pendingCount ?? 0) > 0 },
    { label: "Active Listings", value: activeCount ?? 0, href: "/admin/listings?status=active" },
    { label: "Total Users", value: userCount ?? 0, href: "/admin/users" },
    { label: "Profiles", value: profileCount ?? 0, href: "/admin/users" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-sm text-gray-500 mt-1">psy.market platform management</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition ${
              stat.urgent ? "border-orange-300 bg-orange-50" : "border-gray-200"
            }`}
          >
            <div className={`text-3xl font-bold ${stat.urgent ? "text-orange-600" : "text-gray-900"}`}>
              {stat.value}
            </div>
            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            {stat.urgent && stat.value > 0 && (
              <div className="mt-2 text-xs font-semibold text-orange-600">Needs review →</div>
            )}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/listings"
            className="px-4 py-2 bg-[var(--brand)] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition"
          >
            Review Pending Listings
          </Link>
          <Link
            href="/admin/users"
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
          >
            Manage Users
          </Link>
        </div>
      </div>
    </div>
  );
}
