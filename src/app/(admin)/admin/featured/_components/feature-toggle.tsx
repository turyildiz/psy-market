"use client";

import { useTransition } from "react";
import { featureListing } from "@/lib/actions/admin";
import { toast } from "sonner";

type Props = {
  listingId: string;
  isFeatured: boolean;
};

export function FeatureToggle({ listingId, isFeatured }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      const result = await featureListing(listingId, !isFeatured);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success(isFeatured ? "Removed from featured" : "Added to featured");
      }
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`px-3 py-1.5 text-xs font-semibold rounded transition ${
        isFeatured
          ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      } disabled:opacity-50`}
    >
      {isFeatured ? "★ Unfeature" : "☆ Feature"}
    </button>
  );
}
