import { getAdminClient } from "@/lib/supabase";

/**
 * Checks whether the given user id currently has the "admin" role.
 * Always queries the DB directly (never trusts client-supplied data)
 * and fails CLOSED (returns false) on any error, so a DB hiccup or
 * unexpected shape never accidentally grants admin access.
 */
export async function isAdminUser(userId: string | undefined | null): Promise<boolean> {
  if (!userId) return false;
  try {
    const db = getAdminClient();
    const { data, error } = await db
      .from("user")
      .select("role")
      .eq("id", userId)
      .single();
    if (error || !data) return false;
    return (data as any).role === "admin";
  } catch {
    return false;
  }
}