"use client";

import { useTransition } from "react";
import { deleteReservedHandle, deleteBlockedHandle } from "@/lib/actions/handles";

export function DeleteReservedButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(() => deleteReservedHandle(id))}
      disabled={pending}
      className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40"
    >
      {pending ? "..." : "Remove"}
    </button>
  );
}

export function DeleteBlockedButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(() => deleteBlockedHandle(id))}
      disabled={pending}
      className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40"
    >
      {pending ? "..." : "Remove"}
    </button>
  );
}
