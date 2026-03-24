import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getThreadMessages } from "@/lib/data/messages";
import { MessageThread } from "./message-thread";

type ThreadPageProps = {
  params: Promise<{ threadId: string }>;
};

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { threadId } = await params;
  const decoded = decodeURIComponent(threadId);

  const data = await getThreadMessages(decoded);
  if (!data) {
    notFound();
  }

  const { messages, myProfileId, otherDisplayName, listingTitle, listingId } = data;

  // Determine the receiver: the other person in the thread
  const otherProfileId = messages.find((m) => m.sender_profile_id !== myProfileId)?.sender_profile_id
    ?? messages.find((m) => m.sender_profile_id === myProfileId)?.sender_profile_id
    ?? "";

  // Get the actual other profile id (the non-me one)
  const receiverProfileId = messages
    .map((m) => [m.sender_profile_id])
    .flat()
    .find((id) => id !== myProfileId) ?? otherProfileId;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-[var(--shadow-card)] overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <Link
          href="/dashboard/messages"
          className="text-[var(--text-grey)] hover:text-[var(--text-dark)] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[var(--text-dark)] text-sm">{otherDisplayName}</p>
          <Link
            href={`/listing/${listingId}`}
            className="text-xs text-[var(--brand)] hover:opacity-75 transition truncate block"
          >
            re: {listingTitle}
          </Link>
        </div>
      </div>

      {/* Messages + composer */}
      <MessageThread
        threadId={decoded}
        receiverProfileId={receiverProfileId}
        listingId={listingId}
        myProfileId={myProfileId}
        initialMessages={messages}
      />
    </div>
  );
}
