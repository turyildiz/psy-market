"use client";

import { useTransition } from "react";
import { markAsSold } from "@/lib/actions/listings";
import { toast } from "sonner";

export function MarkSoldButton({ listingId }: { listingId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Mark this listing as sold? It will remain visible but buyers can no longer contact you about it.")) return;
    startTransition(async () => {
      const result = await markAsSold(listingId);
      if (result && "error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Listing marked as sold");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="text-xs font-semibold text-[var(--text-grey)] hover:text-blue-600 transition disabled:opacity-50 shrink-0"
    >
      {isPending ? "..." : "Sold"}
    </button>
  );
}
