"use client";

import { useState, useTransition } from "react";
import { approveListing, rejectListing, featureListing } from "@/lib/actions/admin";
import { toast } from "sonner";

type Props = {
  listingId: string;
  status: string;
  isFeatured: boolean;
};

export function AdminListingActions({ listingId, status, isFeatured }: Props) {
  const [isPending, startTransition] = useTransition();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  function handleApprove() {
    startTransition(async () => {
      const result = await approveListing(listingId);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Listing approved");
      }
    });
  }

  function handleReject() {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    startTransition(async () => {
      const result = await rejectListing(listingId, rejectReason.trim());
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Listing rejected");
        setShowRejectForm(false);
        setRejectReason("");
      }
    });
  }

  function handleFeatureToggle() {
    startTransition(async () => {
      const result = await featureListing(listingId, !isFeatured);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success(isFeatured ? "Removed from featured" : "Marked as featured");
      }
    });
  }

  if (showRejectForm) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Reason for rejection..."
          className="text-xs border border-gray-300 rounded px-2 py-1.5 w-56 focus:outline-none focus:border-red-400"
          autoFocus
        />
        <button
          onClick={handleReject}
          disabled={isPending}
          className="px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded hover:bg-red-600 disabled:opacity-50 transition"
        >
          Confirm
        </button>
        <button
          onClick={() => { setShowRejectForm(false); setRejectReason(""); }}
          className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded hover:bg-gray-200 transition"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {status === "pending" && (
        <button
          onClick={handleApprove}
          disabled={isPending}
          className="px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded hover:bg-green-600 disabled:opacity-50 transition"
        >
          Approve
        </button>
      )}
      {(status === "pending" || status === "active") && (
        <button
          onClick={() => setShowRejectForm(true)}
          disabled={isPending}
          className="px-3 py-1.5 bg-red-100 text-red-600 text-xs font-semibold rounded hover:bg-red-200 disabled:opacity-50 transition"
        >
          Reject
        </button>
      )}
      {status === "active" && (
        <button
          onClick={handleFeatureToggle}
          disabled={isPending}
          className={`px-3 py-1.5 text-xs font-semibold rounded transition ${
            isFeatured
              ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {isFeatured ? "Unfeature" : "Feature"}
        </button>
      )}
    </div>
  );
}
