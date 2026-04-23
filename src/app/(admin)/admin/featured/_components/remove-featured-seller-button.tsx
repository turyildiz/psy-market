"use client";

import { useTransition } from "react";
import { removeFeaturedSeller } from "@/lib/actions/admin";

export function RemoveFeaturedSellerButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(async () => { await removeFeaturedSeller(id); })}
      disabled={pending}
      className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40"
    >
      {pending ? "..." : "Remove"}
    </button>
  );
}
