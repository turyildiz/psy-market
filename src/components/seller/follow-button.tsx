"use client";

import { useState, useTransition } from "react";
import { followSeller, unfollowSeller } from "@/lib/actions/follows";

interface FollowButtonProps {
  profileId: string;
  initialFollowing: boolean;
  followerCount: number;
  isOwnProfile: boolean;
}

export function FollowButton({ profileId, initialFollowing, followerCount, isOwnProfile }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [count, setCount] = useState(followerCount);
  const [isPending, startTransition] = useTransition();

  if (isOwnProfile) return null;

  function toggle() {
    startTransition(async () => {
      if (isFollowing) {
        setIsFollowing(false);
        setCount((c) => c - 1);
        await unfollowSeller(profileId);
      } else {
        setIsFollowing(true);
        setCount((c) => c + 1);
        await followSeller(profileId);
      }
    });
  }

  return (
    <div className="flex items-center gap-3">
      {count > 0 && (
        <span className="text-sm text-[var(--text-grey)]">
          <span className="font-bold text-[var(--text-dark)]">{count}</span> follower{count !== 1 ? "s" : ""}
        </span>
      )}
      <button
        onClick={toggle}
        disabled={isPending}
        className={`px-5 py-2 rounded-full text-sm font-bold transition-all disabled:opacity-60 ${
          isFollowing
            ? "bg-gray-100 text-[var(--text-dark)] border border-gray-300 hover:bg-red-50 hover:text-red-500 hover:border-red-200"
            : "bg-gradient-to-r from-[var(--brand)] to-orange-400 text-white shadow-[0_4px_12px_rgba(255,107,53,0.3)] hover:opacity-90"
        }`}
      >
        {isPending ? "..." : isFollowing ? "Following" : "Follow"}
      </button>
    </div>
  );
}
