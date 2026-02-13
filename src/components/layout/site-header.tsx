"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Bell, Heart, MessageSquare, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { NAV_CATEGORIES } from "@/lib/constants";
import { useLoginModal } from "@/components/auth/login-modal-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SiteHeaderProps {
  user: { id: string; email?: string } | null;
  profile: {
    handle: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
}

function getInitials(name: string | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function SiteHeader({ user, profile }: SiteHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const { openLogin, openSignup } = useLoginModal();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsScrolled(window.scrollY > 150);
    const handleScroll = () => setIsScrolled(window.scrollY > 150);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname, search]);

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {/* ============ TOP BAR ============ */}
      <header className="top-bar">
        <div className="container">
          <Link href="/" className="logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo_web.png" alt="Psy.Market" className="logo-img" />
          </Link>

          {user ? (
            <div className="auth-buttons">
              <div className="flex items-center gap-5 text-white/85">
                <button
                  type="button"
                  aria-label="Notifications"
                  className="relative transition-colors hover:text-white"
                >
                  <Bell size={20} strokeWidth={1.8} />
                  <span className="absolute -right-1.5 -top-1.5 h-2.5 w-2.5 rounded-full bg-[var(--brand)]" />
                </button>
                <button
                  type="button"
                  aria-label="Favorites"
                  className="transition-colors hover:text-white"
                >
                  <Heart size={20} strokeWidth={1.8} />
                </button>
                <button
                  type="button"
                  aria-label="Messages"
                  className="transition-colors hover:text-white"
                >
                  <MessageSquare size={20} strokeWidth={1.8} />
                </button>
                <span className="h-6 w-px bg-white/20" aria-hidden="true" />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-2 outline-none cursor-pointer transition-opacity hover:opacity-100 opacity-95"
                    >
                      <Avatar className="h-11 w-11 border border-[#e9b58f]/60 bg-[#f7d8bf]">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-[linear-gradient(90deg,#efd9c7_0%,#efd9c7_48%,#f9c9a3_48%,#f9c9a3_100%)] text-[#1c1a18] text-sm font-semibold">
                          {getInitials(profile?.display_name)}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown size={15} strokeWidth={2} className="text-white/80" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="z-[220] w-56 bg-[var(--dark-2)] border-[var(--dark-3)] text-white"
                  >
                    <DropdownMenuLabel className="font-normal">
                      <div className="font-medium text-white">{profile?.display_name}</div>
                      <div className="text-xs text-[var(--text-muted)]">
                        @{profile?.handle}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-[var(--dark-4)]" />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer text-white">
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/listings" className="cursor-pointer text-white">
                        My Listings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[var(--dark-4)]" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-400 focus:text-red-400"
                    >
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <button type="button" onClick={openLogin} className="btn btn-outline">
                Log In
              </button>
              <button type="button" onClick={openSignup} className="btn btn-primary">
                Sign Up
              </button>
            </div>
          )}

          <div
            className={`hamburger ${isMobileMenuOpen ? "active" : ""}`}
            onClick={toggleMobileMenu}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        {/* Mobile Menu */}
        <nav className={`mobile-menu ${isMobileMenuOpen ? "active" : ""}`}>
          {NAV_CATEGORIES.map((cat) => (
            <Link key={cat.href} href={cat.href}>
              {cat.label}
            </Link>
          ))}
          {user ? (
            <div className="mobile-auth" style={{ flexDirection: "column", gap: "8px" }}>
              <Link
                href="/dashboard"
                className="btn btn-outline"
                style={{ flex: 1, textAlign: "center" }}
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-outline"
                style={{ flex: 1 }}
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="mobile-auth">
              <button type="button" onClick={openLogin} className="btn btn-outline" style={{ flex: 1 }}>
                Log In
              </button>
              <button type="button" onClick={openSignup} className="btn btn-primary" style={{ flex: 1 }}>
                Sign Up
              </button>
            </div>
          )}
        </nav>
      </header>

      {/* ============ DESKTOP NAV ============ */}
      <nav className={`nav-bar ${isScrolled ? "scrolled" : ""}`}>
        <div className="container">
          <Link href="/" className="nav-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Psy.Market" />
          </Link>
          <ul className="nav-links">
            {NAV_CATEGORIES.map((cat) => (
              <li key={cat.href}>
                <Link href={cat.href}>{cat.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}
