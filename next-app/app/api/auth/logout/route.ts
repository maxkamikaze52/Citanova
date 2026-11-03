import { NextResponse } from "next/server";
import { createSupabaseServer } from "../../../../lib/supabase-server";
import { clearInviteCookie } from "../../../../lib/account";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/auth/logout — clear the Supabase session and the setup cookie. */
export async function GET(request: Request) {
  const sb = await createSupabaseServer();
  await sb.auth.signOut().catch(() => {});
  await clearInviteCookie().catch(() => {});
  return NextResponse.redirect(new URL("/login", request.url));
}
