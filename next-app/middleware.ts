import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Two jobs:
 *  1. Refresh the Supabase session cookie on every request, so a signed-in
 *     dentist is never logged out mid-session.
 *  2. Keep /dashboard behind the login.
 *
 * The widget pair and the calendar feed are deliberately public: a calendar
 * server fetches a feed URL with no cookie jar, and the widget is loaded by a
 * page on someone else's domain.
 */
const PUBLIC_PREFIXES = ["/api/calendar", "/api/operator", "/operator", "/_next", "/favicon"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // app.yourai.com -> /dashboard rewrite (kept from the original middleware).
  const host = req.headers.get("host") || "";
  if (
    host.startsWith("app.") &&
    !["/login", "/signup", "/welcome", "/pricing"].some(
      (p) => pathname === p || pathname.startsWith(p + "/"),
    ) &&
    !pathname.startsWith("/dashboard") &&
    !pathname.startsWith("/api") &&
    !isPublic(pathname)
  ) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard" + (pathname === "/" ? "" : pathname);
    return NextResponse.rewrite(url);
  }

  if (isPublic(pathname)) return NextResponse.next();

  let response = NextResponse.next({ request: req });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return response;

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list: { name: string; value: string; options?: unknown }[]) => {
        for (const { name, value } of list) req.cookies.set(name, value);
        response = NextResponse.next({ request: req });
        for (const { name, value, options } of list) {
          response.cookies.set(name, value, options as never);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Only the dashboard needs a user; login/signup/marketing stay open.
  const wantsApp = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  if (wantsApp && !user) {
    const login = req.nextUrl.clone();
    login.pathname = "/login";
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
