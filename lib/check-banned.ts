import { getAdminClient } from "@/lib/supabase";

/**
 * Checks whether the given user id is currently banned.
 * Always queries the DB directly (never trusts client-supplied data).
 * Fails OPEN (returns false / "not banned") on any error — a DB hiccup
 * should not silently lock out a legitimate user, mirroring the same
 * fail-open choice already made for the page-level ban check in
 * middleware.ts. Actual moderation actions (the admin panel's ban
 * toggle) are unaffected by this — this only guards write endpoints.
 */
export async function isBannedUser(userId: string | undefined | null): Promise<boolean> {
  if (!userId) return false;
  try {
    const db = getAdminClient();
    const { data, error } = await db
      .from("user")
      .select("banned")
      .eq("id", userId)
      .single();
    if (error || !data) return false;
    return !!(data as any).banned;
  } catch {
    return false;
  }
}