"use client";

import { useTransition } from "react";
import { suspendProfile } from "@/lib/actions/admin";
import { toast } from "sonner";

type Props = {
  profileId: string;
  isSuspended: boolean;
};

export function AdminUserActions({ profileId, isSuspended }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleToggleSuspend() {
    const action = isSuspended ? "unsuspend" : "suspend";
    if (!isSuspended && !confirm(`Are you sure you want to suspend this user?`)) return;

    startTransition(async () => {
      const result = await suspendProfile(profileId, !isSuspended);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success(`User ${action}ed`);
      }
    });
  }

  return (
    <button
      onClick={handleToggleSuspend}
      disabled={isPending}
      className={`px-3 py-1.5 text-xs font-semibold rounded transition disabled:opacity-50 ${
        isSuspended
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-red-100 text-red-600 hover:bg-red-200"
      }`}
    >
      {isSuspended ? "Unsuspend" : "Suspend"}
    </button>
  );
}
