import { createServerSupabaseClient } from "@/lib/supabase/server";

// thread_id = "{listing_id}:{buyer_profile_id}"
// The buyer is always the one who initiated contact (non-seller)

export type Thread = {
  thread_id: string;
  listing_id: string;
  listing_title: string;
  listing_image: string | null;
  other_profile_id: string;
  other_display_name: string;
  other_handle: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
};

export type ThreadMessage = {
  id: string;
  content: string;
  sender_profile_id: string;
  created_at: string;
  read: boolean;
};

export async function getMyProfileId(): Promise<string | null> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  return profile?.id ?? null;
}

export async function getInboxThreads(): Promise<Thread[]> {
  const supabase = await createServerSupabaseClient();
  const profileId = await getMyProfileId();
  if (!profileId) return [];

  // Get all messages where I am sender or receiver, grouped by thread
  const { data: messages } = await supabase
    .from("messages")
    .select(`
      thread_id,
      listing_id,
      sender_profile_id,
      receiver_profile_id,
      content,
      created_at,
      read
    `)
    .or(`sender_profile_id.eq.${profileId},receiver_profile_id.eq.${profileId}`)
    .order("created_at", { ascending: false });

  if (!messages || messages.length === 0) return [];

  // Group by thread_id, keep only the latest message per thread
  const threadMap = new Map<string, typeof messages[0]>();
  for (const msg of messages) {
    if (!threadMap.has(msg.thread_id)) {
      threadMap.set(msg.thread_id, msg);
    }
  }

  // Count unread per thread
  const unreadMap = new Map<string, number>();
  for (const msg of messages) {
    if (msg.receiver_profile_id === profileId && !msg.read) {
      unreadMap.set(msg.thread_id, (unreadMap.get(msg.thread_id) ?? 0) + 1);
    }
  }

  // Collect all other profile IDs and listing IDs
  const otherProfileIds = new Set<string>();
  const listingIds = new Set<string>();
  for (const [, msg] of threadMap) {
    const otherId = msg.sender_profile_id === profileId ? msg.receiver_profile_id : msg.sender_profile_id;
    otherProfileIds.add(otherId);
    listingIds.add(msg.listing_id);
  }

  // Fetch profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, handle")
    .in("id", Array.from(otherProfileIds));

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  // Fetch listings
  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, images")
    .in("id", Array.from(listingIds));

  const listingById = new Map((listings ?? []).map((l) => [l.id, l]));

  const threads: Thread[] = [];
  for (const [threadId, msg] of threadMap) {
    const otherId = msg.sender_profile_id === profileId ? msg.receiver_profile_id : msg.sender_profile_id;
    const other = profileById.get(otherId);
    const listing = listingById.get(msg.listing_id);
    if (!other || !listing) continue;

    threads.push({
      thread_id: threadId,
      listing_id: msg.listing_id,
      listing_title: listing.title,
      listing_image: listing.images?.[0] ?? null,
      other_profile_id: otherId,
      other_display_name: other.display_name,
      other_handle: other.handle,
      last_message: msg.content,
      last_message_at: msg.created_at,
      unread_count: unreadMap.get(threadId) ?? 0,
    });
  }

  return threads;
}

export async function getThreadMessages(threadId: string): Promise<{
  messages: ThreadMessage[];
  myProfileId: string;
  otherDisplayName: string;
  listingTitle: string;
  listingId: string;
} | null> {
  const supabase = await createServerSupabaseClient();
  const profileId = await getMyProfileId();
  if (!profileId) return null;

  const { data: messages } = await supabase
    .from("messages")
    .select("id, content, sender_profile_id, receiver_profile_id, created_at, read, listing_id")
    .eq("thread_id", threadId)
    .or(`sender_profile_id.eq.${profileId},receiver_profile_id.eq.${profileId}`)
    .order("created_at", { ascending: true });

  if (!messages || messages.length === 0) return null;

  const firstMsg = messages[0];
  const otherId = firstMsg.sender_profile_id === profileId
    ? firstMsg.receiver_profile_id
    : firstMsg.sender_profile_id;

  const [{ data: other }, { data: listing }] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", otherId).single(),
    supabase.from("listings").select("title, id").eq("id", firstMsg.listing_id).single(),
  ]);

  // Mark unread messages as read
  const unreadIds = messages
    .filter((m) => m.receiver_profile_id === profileId && !m.read)
    .map((m) => m.id);

  if (unreadIds.length > 0) {
    await supabase.from("messages").update({ read: true }).in("id", unreadIds);
  }

  return {
    messages: messages.map((m) => ({
      id: m.id,
      content: m.content,
      sender_profile_id: m.sender_profile_id,
      created_at: m.created_at,
      read: m.read,
    })),
    myProfileId: profileId,
    otherDisplayName: other?.display_name ?? "Unknown",
    listingTitle: listing?.title ?? "Listing",
    listingId: listing?.id ?? firstMsg.listing_id,
  };
}
