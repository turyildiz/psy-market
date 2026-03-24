import Link from "next/link";
import { redirect } from "next/navigation";
import { getInboxThreads, getMyProfileId } from "@/lib/data/messages";

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default async function MessagesPage() {
  const profileId = await getMyProfileId();
  if (!profileId) redirect("/?auth=login");

  const threads = await getInboxThreads();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-[var(--shadow-card)] overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100">
        <h1
          className="text-2xl font-bold text-[var(--text-dark)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Messages
        </h1>
        {threads.length > 0 && (
          <p className="text-sm text-[var(--text-grey)] mt-1">
            {threads.length} conversation{threads.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {threads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-[var(--text-dark)] font-semibold mb-1">No messages yet</p>
          <p className="text-sm text-[var(--text-grey)]">
            When you contact a seller or receive a message, it will appear here.
          </p>
          <Link
            href="/browse"
            className="mt-6 h-10 px-6 rounded-full bg-[var(--brand)] text-white text-sm font-semibold hover:opacity-90 transition inline-flex items-center"
          >
            Browse listings
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {threads.map((thread) => (
            <li key={thread.thread_id}>
              <Link
                href={`/dashboard/messages/${encodeURIComponent(thread.thread_id)}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                {/* Listing thumbnail */}
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {thread.listing_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thread.listing_image}
                      alt={thread.listing_title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="font-semibold text-sm text-[var(--text-dark)] truncate">
                      {thread.other_display_name}
                    </span>
                    <span className="text-xs text-[var(--text-grey)] flex-shrink-0">
                      {formatRelativeTime(thread.last_message_at)}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--brand)] truncate mb-0.5">
                    re: {thread.listing_title}
                  </p>
                  <p className="text-sm text-[var(--text-grey)] truncate">{thread.last_message}</p>
                </div>

                {/* Unread badge */}
                {thread.unread_count > 0 && (
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--brand)] text-white text-[10px] font-bold flex items-center justify-center">
                    {thread.unread_count > 9 ? "9+" : thread.unread_count}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
