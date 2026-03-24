"use client";

import { useEffect } from "react";
import { incrementViewCount } from "@/lib/actions/listings";

export function ViewTracker({ listingId }: { listingId: string }) {
  useEffect(() => {
    const key = `viewed_listing_${listingId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    incrementViewCount(listingId);
  }, [listingId]);

  return null;
}
