"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

type ProfileSnippet = {
  id: string;
  handle: string;
  display_name: string;
  avatar_url: string | null;
};

type Props = {
  followerCount: number;
  followingCount: number;
  followers: ProfileSnippet[];
  following: ProfileSnippet[];
};

export function FollowStats({ followerCount, followingCount, followers, following }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"followers" | "following">("followers");

  function openTab(t: "followers" | "following") {
    setTab(t);
    setOpen(true);
  }

  const list = tab === "followers" ? followers : following;

  return (
    <>
      {/* Badges */}
      <button
        onClick={() => openTab("followers")}
        className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-gray-200 shadow-[var(--shadow-card)] hover:border-[var(--brand)] transition-colors"
      >
        <span className="text-xl font-black text-[var(--brand)]" style={{ fontFamily: "var(--font-display)" }}>
          {followerCount}
        </span>
        <span className="text-xs font-semibold text-[var(--text-grey)] uppercase tracking-wide">
          Followers
        </span>
      </button>

      <button
        onClick={() => openTab("following")}
        className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-gray-200 shadow-[var(--shadow-card)] hover:border-[var(--brand)] transition-colors"
      >
        <span className="text-xl font-black text-[var(--brand)]" style={{ fontFamily: "var(--font-display)" }}>
          {followingCount}
        </span>
        <span className="text-xs font-semibold text-[var(--text-grey)] uppercase tracking-wide">
          Following
        </span>
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[80vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
              <div className="flex gap-1">
                <button
                  onClick={() => setTab("followers")}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                    tab === "followers"
                      ? "bg-[var(--brand)] text-white"
                      : "text-[var(--text-grey)] hover:bg-gray-100"
                  }`}
                >
                  Followers <span className="opacity-70">({followerCount})</span>
                </button>
                <button
                  onClick={() => setTab("following")}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                    tab === "following"
                      ? "bg-[var(--brand)] text-white"
                      : "text-[var(--text-grey)] hover:bg-gray-100"
                  }`}
                >
                  Following <span className="opacity-70">({followingCount})</span>
                </button>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-[var(--text-grey)] hover:text-[var(--text-dark)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1">
              {list.length === 0 ? (
                <p className="text-center text-sm text-[var(--text-grey)] py-10">
                  {tab === "followers" ? "No followers yet." : "Not following anyone yet."}
                </p>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {list.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/${p.handle}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                      >
                        <div className="p-[2px] rounded-full bg-gradient-to-br from-[var(--brand)] via-orange-300 to-pink-500 shrink-0">
                          <div className="p-[2px] rounded-full bg-white">
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={p.avatar_url || "/reference/profile_picture.jpeg"}
                                alt={p.display_name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-[var(--text-dark)] truncate">{p.display_name}</p>
                          <p className="text-xs text-[var(--brand)] font-semibold truncate">@{p.handle}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
