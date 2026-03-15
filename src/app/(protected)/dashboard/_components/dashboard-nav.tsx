"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SIDEBAR_ITEMS = [
  { label: "My Listings", href: "/dashboard/listings" },
  { label: "Messages", href: "/dashboard/messages" },
  { label: "Saved Items", href: "/dashboard/saved" },
  { label: "Profile", href: "/dashboard/profile" },
  { label: "Settings", href: "/dashboard/settings" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-52 md:shrink-0 bg-white rounded-2xl border border-gray-200 shadow-[var(--shadow-card)] overflow-hidden">
      {/* Mobile: horizontal scrollable tabs */}
      <nav className="flex md:hidden overflow-x-auto scrollbar-none">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                isActive
                  ? "border-[var(--brand)] text-[var(--brand)]"
                  : "border-transparent text-[var(--text-dark)] hover:text-[var(--brand)]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      {/* Desktop: vertical list */}
      <nav className="hidden md:block py-2">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-5 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[var(--brand)] text-white"
                  : "text-[var(--text-dark)] hover:bg-gray-50"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
