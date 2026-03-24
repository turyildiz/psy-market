"use client";

import { startConversation } from "@/lib/actions/messages";
import { useTransition } from "react";

type Props = {
  listingId: string;
  sellerProfileId: string;
};

export function ContactSellerButton({ listingId, sellerProfileId }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await startConversation(listingId, sellerProfileId);
    });
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleClick}
      className="w-full h-12 rounded-full bg-[var(--brand)] text-white font-semibold text-base shadow-[var(--shadow-card)] hover:opacity-90 transition disabled:opacity-60"
    >
      {isPending ? "Opening chat..." : "Contact Seller"}
    </button>
  );
}
