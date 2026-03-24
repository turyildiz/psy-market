"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchMoreListings } from "@/lib/actions/listings";
import { formatPrice } from "@/lib/utils";

const PAGE_SIZE = 24;

type Listing = {
  id: string;
  title: string;
  price: number;
  condition: string;
  category: string;
  images: string[] | null;
};

type Props = {
  initialListings: Listing[];
  initialHasMore: boolean;
  filters: {
    q?: string;
    category?: string;
    condition?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  };
};

export function LoadMoreListings({ initialListings, initialHasMore, filters }: Props) {
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [offset, setOffset] = useState(PAGE_SIZE);
  const [isPending, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset when filters change
  useEffect(() => {
    setListings(initialListings);
    setHasMore(initialHasMore);
    setOffset(PAGE_SIZE);
  }, [initialListings, initialHasMore]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isPending) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, isPending, offset]);

  function loadMore() {
    startTransition(async () => {
      const result = await fetchMoreListings({ ...filters, offset });
      setListings((prev) => [...prev, ...result.listings]);
      setHasMore(result.hasMore);
      setOffset((prev) => prev + PAGE_SIZE);
    });
  }

  if (listings.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-[var(--shadow-card)]">
        <p className="text-xl font-semibold text-[var(--text-dark)] mb-2">No listings found</p>
        <p className="text-[var(--text-grey)] text-sm">Try adjusting your filters or search terms.</p>
        <Link href="/browse" className="mt-4 inline-block text-sm text-[var(--brand)] hover:underline font-medium">Clear filters</Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {listings.map((listing) => (
          <Link key={listing.id} href={`/listing/${listing.id}`} className="product-card">
            <div className="product-card-img h-52">
              <Image
                src={listing.images?.[0] || "/modem.jpg"}
                alt={listing.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            </div>
            <div className="product-card-info">
              <h4>{listing.title}</h4>
              <div className="category capitalize">{listing.category} · {listing.condition.replace("_", " ")}</div>
              <div className="price">{formatPrice(listing.price)}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-6">
          {isPending && (
            <div className="w-6 h-6 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      )}

      {!hasMore && listings.length > PAGE_SIZE && (
        <p className="text-center text-sm text-[var(--text-grey)] py-4">All listings loaded</p>
      )}
    </>
  );
}
