import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

const publicRoutes = [
  "/",
  "/browse",
  "/listing",
  "/seller",
  "/events",
  "/privacy",
  "/terms",
  "/signup",
];

const adminRoutes = ["/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Refresh Supabase auth session
  const { supabase, user, response } = await updateSession(request);

  // Allow public routes
  const isPublic = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  if (isPublic || pathname.startsWith("/auth/")) {
    return response;
  }

  // Require auth for all other routes
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("auth", "login");
    url.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(url);
  }

  // Check for incomplete profile → redirect to onboarding
  if (!pathname.startsWith("/onboarding")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("handle")
      .eq("user_id", user.id)
      .single();

    if (profile?.handle?.startsWith("user_")) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }
  }

  // Admin route protection
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userData?.role !== "admin" && userData?.role !== "super_admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
