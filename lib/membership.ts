import { getAdminClient } from "@/lib/supabase";

export async function checkMembership(userId: string): Promise<boolean> {
  if (!userId) return false;
  const db = getAdminClient();
  const { data } = await db
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .limit(1)
    .single();
  return !!data;
}

export async function getSubscription(userId: string) {
  const db = getAdminClient();
  const { data } = await db
    .from("subscriptions")
    .select("*, plan:plan_id(name, price, duration_days)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  return data;
}