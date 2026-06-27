import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Core session-refresh + role-gating logic, called from the root
 * src/middleware.ts.
 *
 * IMPORTANT: keep the order of operations below intact — create the
 * response object first, create the client bound to it, and call
 * supabase.auth.getUser() immediately after, with no other logic in
 * between.
 *
 * Performance note: this resolves the caller's role/full_name once here.
 * Rather than letting (dashboard)/layout.tsx look the same thing up
 * again via a second auth.getUser() + DB query on every navigation
 * (which it previously did, as a "defense in depth" check), the result
 * is forwarded via x-user-role / x-user-full-name request headers, which
 * the layout reads directly with headers() instead of re-querying. This
 * removes one full pair of network round-trips from every single page
 * navigation.
 */
export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user) {
    if (pathname === "/login") {
      return supabaseResponse;
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "profile_not_found");
    return NextResponse.redirect(loginUrl);
  }

  const role = profile.role as "admin" | "branch_manager" | "cashier";

  if (role === "cashier") {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "cashier_web_access_denied");
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login") {
    const destination = role === "branch_manager" ? "/branch/dashboard" : "/dashboard";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (role === "branch_manager" && !pathname.startsWith("/branch")) {
    return NextResponse.redirect(new URL("/branch/dashboard", request.url));
  }

  // Forward the already-resolved identity to Server Components downstream.
  const forwardedHeaders = new Headers(request.headers);
  forwardedHeaders.set("x-user-role", role);
  forwardedHeaders.set("x-user-full-name", profile.full_name ?? "");

  const response = NextResponse.next({
    request: { headers: forwardedHeaders },
  });

  // The auth-refresh cookies queued onto supabaseResponse above need to
  // carry over onto this final response object, since this one — not
  // supabaseResponse — is what actually gets returned.
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie);
  });

  return response;
}