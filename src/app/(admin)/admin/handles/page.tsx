import { createServiceRoleClient } from "@/lib/supabase/server";
import { addReservedHandle, addBlockedHandle } from "@/lib/actions/handles";
import { DeleteReservedButton, DeleteBlockedButton } from "./_components/handle-delete-buttons";

export default async function AdminHandlesPage() {
  const supabase = createServiceRoleClient();

  const [{ data: reserved }, { data: blocked }] = await Promise.all([
    supabase
      .from("reserved_handles")
      .select("id, handle, email, consumed, consumed_at, expires_at, reserved_at")
      .order("reserved_at", { ascending: false }),
    supabase
      .from("blocked_handles")
      .select("id, handle, created_at")
      .order("handle"),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Handle Management</h1>
        <p className="text-sm text-gray-500">Reserve handles for artists and block reserved system words.</p>
      </div>

      {/* Reserved Handles */}
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Reserved Handles</h2>
            <p className="text-xs text-gray-500 mt-0.5">Tied to a specific email — claimed automatically when that email signs up.</p>
          </div>
          <span className="text-sm text-gray-400">{reserved?.length ?? 0}</span>
        </div>

        {/* Add form */}
        <form action={addReservedHandle} className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Handle</label>
            <div className="flex items-center rounded border border-gray-300 bg-white overflow-hidden">
              <span className="px-2 text-gray-400 text-sm">@</span>
              <input
                name="handle"
                required
                placeholder="astrix"
                pattern="^[a-zA-Z0-9_]{3,30}$"
                className="py-2 pr-3 text-sm outline-none w-32"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              placeholder="artist@email.com"
              className="px-3 py-2 text-sm border border-gray-300 rounded bg-white outline-none w-52"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Expires (days)</label>
            <input
              name="days"
              type="number"
              defaultValue={90}
              min={1}
              max={365}
              className="px-3 py-2 text-sm border border-gray-300 rounded bg-white outline-none w-20"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium bg-orange-500 text-white rounded hover:bg-orange-600 transition"
          >
            Reserve
          </button>
        </form>

        {/* List */}
        <div className="divide-y divide-gray-100">
          {!reserved?.length && (
            <p className="px-6 py-6 text-sm text-gray-400 text-center">No reservations yet.</p>
          )}
          {reserved?.map((r) => (
            <div key={r.id} className="px-6 py-3 flex items-center gap-4">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                r.consumed ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
              }`}>
                {r.consumed ? "claimed" : "pending"}
              </span>
              <span className="font-mono text-sm font-medium text-gray-900">@{r.handle}</span>
              <span className="text-sm text-gray-500 flex-1">{r.email}</span>
              {r.consumed ? (
                <span className="text-xs text-gray-400">
                  Claimed {new Date(r.consumed_at!).toLocaleDateString()}
                </span>
              ) : (
                <span className="text-xs text-gray-400">
                  Expires {new Date(r.expires_at).toLocaleDateString()}
                </span>
              )}
              {!r.consumed && <DeleteReservedButton id={r.id} />}
            </div>
          ))}
        </div>
      </section>

      {/* Blocked Handles */}
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Blocked Handles</h2>
            <p className="text-xs text-gray-500 mt-0.5">System words and handles nobody can register.</p>
          </div>
          <span className="text-sm text-gray-400">{blocked?.length ?? 0}</span>
        </div>

        {/* Add form */}
        <form action={addBlockedHandle} className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Handle</label>
            <div className="flex items-center rounded border border-gray-300 bg-white overflow-hidden">
              <span className="px-2 text-gray-400 text-sm">@</span>
              <input
                name="handle"
                required
                placeholder="newword"
                pattern="^[a-zA-Z0-9_]{1,30}$"
                className="py-2 pr-3 text-sm outline-none w-36"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium bg-gray-800 text-white rounded hover:bg-gray-900 transition"
          >
            Block
          </button>
        </form>

        {/* Grid of blocked handles */}
        <div className="px-6 py-4 flex flex-wrap gap-2">
          {!blocked?.length && (
            <p className="text-sm text-gray-400">No blocked handles.</p>
          )}
          {blocked?.map((b) => (
            <span key={b.id} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700">
              @{b.handle}
              <DeleteBlockedButton id={b.id} />
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
