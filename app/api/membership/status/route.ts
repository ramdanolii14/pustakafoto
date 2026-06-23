import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { headers } from "next/headers";

export async function GET(_req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ is_member: false, subscription: null });
  }

  const db = getAdminClient();
  const { data } = await db
    .from("subscriptions")
    .select("id, status, started_at, expires_at, amount, plan:plan_id(name, price)")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const isMember =
    data?.status === "active" &&
    data?.expires_at &&
    new Date(data.expires_at) > new Date();

  return NextResponse.json({ is_member: isMember, subscription: data || null });
}