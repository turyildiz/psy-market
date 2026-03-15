"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Rss, Package, MessageSquare, Heart, User, Settings } from "lucide-react";

const SIDEBAR_ITEMS = [
  { label: "Feed",        href: "/dashboard",          icon: Rss },
  { label: "My Listings", href: "/dashboard/listings", icon: Package },
  { label: "Messages",    href: "/dashboard/messages", icon: MessageSquare },
  { label: "Saved Items", href: "/dashboard/saved",    icon: Heart },
  { label: "Profile",     href: "/dashboard/profile",  icon: User },
  { label: "Settings",    href: "/dashboard/settings", icon: Settings },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-56 md:shrink-0 bg-white rounded-2xl border border-gray-200 shadow-[var(--shadow-card)] overflow-hidden">
      {/* Mobile: horizontal scrollable tabs */}
      <nav className="flex md:hidden overflow-x-auto scrollbar-none">
        {SIDEBAR_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = href === "/dashboard" ? pathname === "/dashboard" : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
                isActive
                  ? "border-[var(--brand)] text-[var(--brand)]"
                  : "border-transparent text-[var(--text-grey)] hover:text-[var(--brand)]"
              }`}
            >
              <Icon size={14} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Desktop: vertical list */}
      <nav className="hidden md:block p-2">
        {SIDEBAR_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = href === "/dashboard" ? pathname === "/dashboard" : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all mb-0.5 ${
                isActive
                  ? "bg-gradient-to-r from-[var(--brand)] to-orange-400 text-white shadow-[0_4px_12px_rgba(255,107,53,0.35)]"
                  : "text-[var(--text-grey)] hover:bg-gray-50 hover:text-[var(--text-dark)]"
              }`}
            >
              <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
