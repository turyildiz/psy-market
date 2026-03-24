import type { MetadataRoute } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createServerSupabaseClient();
  const baseUrl = "https://psy.market";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/browse`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${baseUrl}/privacy`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/terms`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const { data: listings } = await supabase
    .from("listings")
    .select("id, updated_at")
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(1000);

  const listingRoutes: MetadataRoute.Sitemap = (listings ?? []).map((l) => ({
    url: `${baseUrl}/listing/${l.id}`,
    lastModified: new Date(l.updated_at),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const { data: profiles } = await supabase
    .from("profiles")
    .select("handle, updated_at")
    .eq("is_suspended", false)
    .limit(500);

  const profileRoutes: MetadataRoute.Sitemap = (profiles ?? []).map((p) => ({
    url: `${baseUrl}/seller/${p.handle}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...listingRoutes, ...profileRoutes];
}
