"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMyProfileId } from "@/lib/data/messages";

export async function startConversation(listingId: string, sellerProfileId: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/?auth=login&next=/listing/${listingId}`);
  }

  const { data: buyerProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!buyerProfile) {
    redirect("/onboarding");
  }

  // Can't message yourself
  if (buyerProfile.id === sellerProfileId) {
    redirect(`/listing/${listingId}`);
  }

  const threadId = `${listingId}:${buyerProfile.id}`;

  // Check if thread already exists
  const { data: existing } = await supabase
    .from("messages")
    .select("id")
    .eq("thread_id", threadId)
    .limit(1)
    .single();

  // If no existing thread, create an opening message
  if (!existing) {
    const { data: listing } = await supabase
      .from("listings")
      .select("title")
      .eq("id", listingId)
      .single();

    const openingMessage = listing
      ? `Hi! I'm interested in "${listing.title}".`
      : "Hi! I'm interested in your listing.";

    await supabase.from("messages").insert({
      thread_id: threadId,
      listing_id: listingId,
      sender_profile_id: buyerProfile.id,
      receiver_profile_id: sellerProfileId,
      content: openingMessage,
    });
  }

  redirect(`/dashboard/messages/${encodeURIComponent(threadId)}`);
}

export async function sendMessage(
  threadId: string,
  receiverProfileId: string,
  listingId: string,
  content: string
) {
  const trimmed = content.trim();
  if (!trimmed || trimmed.length > 2000) {
    return { error: "Message must be between 1 and 2000 characters" };
  }

  const supabase = await createServerSupabaseClient();
  const profileId = await getMyProfileId();
  if (!profileId) return { error: "Unauthorized" };

  const { data, error } = await supabase.from("messages").insert({
    thread_id: threadId,
    listing_id: listingId,
    sender_profile_id: profileId,
    receiver_profile_id: receiverProfileId,
    content: trimmed,
  }).select("id").single();

  if (error) return { error: "Failed to send message" };
  return { success: true, messageId: data?.id };
}
