"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/lib/actions/favorites";
import { toast } from "sonner";
import { useLoginModal } from "@/components/auth/login-modal-provider";

type Props = {
  listingId: string;
  initialSaved: boolean;
  isLoggedIn: boolean;
};

export function SaveButton({ listingId, initialSaved, isLoggedIn }: Props) {
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();
  const { openLogin } = useLoginModal();

  function handleClick() {
    if (!isLoggedIn) {
      openLogin();
      return;
    }
    startTransition(async () => {
      const prev = saved;
      setSaved(!prev);
      const result = await toggleFavorite(listingId);
      if ("error" in result) {
        setSaved(prev);
        toast.error("Failed to save listing");
      } else {
        toast.success(result.saved ? "Saved to your list" : "Removed from saved");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={saved ? "Remove from saved" : "Save listing"}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition disabled:opacity-60 ${
        saved
          ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      <Heart
        size={16}
        className={saved ? "fill-red-500 stroke-red-500" : "stroke-current"}
      />
      {saved ? "Saved" : "Save"}
    </button>
  );
}
