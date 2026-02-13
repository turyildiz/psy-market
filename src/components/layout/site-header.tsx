"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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
  }, [pathname]);

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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 outline-none cursor-pointer">
                    <Avatar className="h-9 w-9 border-2 border-[var(--dark-4)]">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-[var(--dark-3)] text-[var(--brand)] text-sm font-semibold">
                        {getInitials(profile?.display_name)}
                      </AvatarFallback>
                    </Avatar>
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
