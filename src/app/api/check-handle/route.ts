import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

const HANDLE_REGEX = /^[a-zA-Z0-9_]+$/;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get("handle")?.toLowerCase().trim() ?? "";
  const email = searchParams.get("email")?.toLowerCase().trim() ?? "";

  if (!handle) return NextResponse.json({ available: false, message: "Handle required" });
  if (handle.length < 3) return NextResponse.json({ available: false, message: "At least 3 characters" });
  if (handle.length > 30) return NextResponse.json({ available: false, message: "Max 30 characters" });
  if (!HANDLE_REGEX.test(handle)) return NextResponse.json({ available: false, message: "Letters, numbers and underscores only" });

  const supabase = createServiceRoleClient();

  const [{ data: blocked }, { data: taken }, { data: reserved }] = await Promise.all([
    supabase.from("blocked_handles").select("handle").eq("handle", handle).maybeSingle(),
    supabase.from("profiles").select("handle").eq("handle", handle).maybeSingle(),
    supabase.from("reserved_handles")
      .select("handle, email")
      .eq("handle", handle)
      .eq("consumed", false)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle(),
  ]);

  if (blocked) return NextResponse.json({ available: false, message: "This handle is not available" });
  if (taken) return NextResponse.json({ available: false, message: "Already taken" });
  if (reserved) {
    if (email && reserved.email.toLowerCase() === email) {
      return NextResponse.json({ available: true, reserved_for_you: true });
    }
    return NextResponse.json({ available: false, message: "This handle is reserved" });
  }

  return NextResponse.json({ available: true });
}
