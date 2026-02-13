"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { listingSchema } from "@/lib/validators";

type ListingFormInput = {
  title: string;
  description: string;
  price_eur: string;
  condition: "new" | "like_new" | "good" | "worn" | "vintage";
  size: string;
  category: "clothing" | "accessories" | "gear" | "art" | "other";
  images_csv: string;
  tags_csv: string;
  ships_to_csv: string;
};

function parseCsv(value: string) {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function toPayload(input: ListingFormInput) {
  const price = Math.round(Number(input.price_eur) * 100);
  const images = parseCsv(input.images_csv);
  const tags = parseCsv(input.tags_csv).map((tag) => tag.toLowerCase());
  const ships_to = parseCsv(input.ships_to_csv).map((country) =>
    country.toUpperCase()
  );

  const parsed = listingSchema.safeParse({
    title: input.title,
    description: input.description,
    price,
    condition: input.condition,
    size: input.size,
    images,
    category: input.category,
    tags,
    ships_to,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  return { data: parsed.data };
}

async function getCurrentProfileId() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { error: "Profile not found" };
  }

  return { profileId: profile.id };
}

export async function createListing(
  input: ListingFormInput,
  intent: "draft" | "pending"
) {
  const payload = toPayload(input);
  if ("error" in payload) {
    return { error: payload.error };
  }

  const current = await getCurrentProfileId();
  if ("error" in current) {
    return { error: current.error };
  }

  const supabase = await createServerSupabaseClient();
  const status = intent === "pending" ? "pending" : "draft";
  const submitted_at = intent === "pending" ? new Date().toISOString() : null;

  const { error } = await supabase.from("listings").insert({
    ...payload.data,
    profile_id: current.profileId,
    status,
    submitted_at,
  });

  if (error) {
    return { error: "Failed to create listing. Please try again." };
  }

  redirect("/dashboard/listings");
}

export async function updateListing(
  listingId: string,
  input: ListingFormInput,
  intent: "save" | "submit"
) {
  const payload = toPayload(input);
  if ("error" in payload) {
    return { error: payload.error };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { error: "Profile not found" };
  }

  const { data: listing } = await supabase
    .from("listings")
    .select("id, status")
    .eq("id", listingId)
    .eq("profile_id", profile.id)
    .single();

  if (!listing) {
    return { error: "Listing not found" };
  }

  const shouldSubmit = intent === "submit" || listing.status === "rejected";
  const status = shouldSubmit ? "pending" : listing.status;
  const submitted_at = shouldSubmit ? new Date().toISOString() : null;

  const { error } = await supabase
    .from("listings")
    .update({
      ...payload.data,
      status,
      submitted_at,
    })
    .eq("id", listingId)
    .eq("profile_id", profile.id);

  if (error) {
    return { error: "Failed to update listing. Please try again." };
  }

  redirect("/dashboard/listings");
}

