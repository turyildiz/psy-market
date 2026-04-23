import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AdminUserActions } from "./_components/admin-user-actions";

export default async function AdminUsersPage() {
  const supabase = await createServerSupabaseClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select(`
      id, handle, display_name, avatar_url, is_verified, is_suspended, created_at,
      user:users(role, email_notifications)
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-1">{profiles?.length ?? 0} total profiles</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-semibold text-gray-600">User</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Handle</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Joined</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles?.map((profile) => (
              <tr key={profile.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{profile.display_name}</div>
                </td>
                <td className="px-4 py-3">
                  <a
                    href={`/${profile.handle}`}
                    target="_blank"
                    className="text-blue-600 hover:underline"
                  >
                    @{profile.handle}
                  </a>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {profile.is_suspended ? (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">Suspended</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Active</span>
                    )}
                    {profile.is_verified && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Verified</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(profile.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <AdminUserActions
                    profileId={profile.id}
                    isSuspended={profile.is_suspended}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
