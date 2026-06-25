// Server Supabase client placeholder (createServerClient, for Server Components/Actions)
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for use in Server Components, Server Actions, and Route
 * Handlers. Must be created fresh per request (not module-scoped) since it
 * binds to that request's cookie jar.
 *
 * In a Server Component, `cookies().set()` will throw — Next.js only
 * allows writing cookies from a Server Action or Route Handler. The
 * try/catch below swallows that specific case: Supabase still needs to
 * attempt the write (e.g. to refresh an expiring session token), but if
 * you're calling this from a plain Server Component, middleware should
 * already be refreshing the session on the request before it gets here,
 * so a failed write at this layer is safe to ignore.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — no-op, see comment above.
          }
        },
      },
    }
  );
}