// Browser Supabase client placeholder (createBrowserClient)
import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use in Client Components ("use client").
 * Reads/writes the auth session via browser cookies automatically.
 *
 * Call this once per component (or hoist into a small hook) rather than
 * module-scoping the client instance, per @supabase/ssr's guidance for
 * the App Router.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}