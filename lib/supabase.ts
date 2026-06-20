import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy browser client — instantiated on first use to avoid build-time crashes
let _browser: SupabaseClient | null = null;
export function getSupabase(): SupabaseClient {
  if (!_browser) {
    _browser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _browser;
}

// Server/admin client — bypasses RLS; only use in API routes
export function getAdminClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
