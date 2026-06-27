import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. Bypasses RLS entirely — this is the
 * client that's allowed to do things no authenticated role's policies
 * permit directly: create auth.users entries, insert into public.users
 * (which has no INSERT policy for any role), etc.
 *
 * `import "server-only"` makes this throw a build error if anything ever
 * tries to import this file into a Client Component bundle. Never expose
 * SUPABASE_SERVICE_ROLE_KEY to the browser — it is NOT prefixed with
 * NEXT_PUBLIC_ on purpose.
 *
 * Create a fresh client per call rather than module-scoping a singleton,
 * consistent with the request-scoped pattern used in lib/supabase/server.ts.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}