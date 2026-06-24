import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { deleteR2Objects } from "@/lib/r2";
import { headers } from "next/headers";

async function requireAdmin(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const db = getAdminClient();
  const { data: user } = await db.from("user").select("role").eq("id", session.user.id).single();
  if (user?.role !== "admin") return null;
  return session;
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const db = getAdminClient();

  if (action === "users") {
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const perPage = 30;
    const offset = (page - 1) * perPage;
    const q = searchParams.get("q") || "";
    let query = db
      .from("user")
      .select("id, name, email, image, role, banned, banned_reason, createdAt", { count: "exact" })
      .order("createdAt", { ascending: false })
      .range(offset, offset + perPage - 1);
    if (q) query = query.ilike("name", `%${q}%`);
    const { data, error, count } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ users: data || [], total: count || 0 });
  }

  if (action === "posts") {
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const perPage = 30;
    const offset = (page - 1) * perPage;
    const { data, error, count } = await db
      .from("posts")
      .select("id, title, character_name, user_id, file_count, upvotes, downvotes, created_at, is_nude, is_members_only, forced_members_only, user:user_id(name, email)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + perPage - 1);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ posts: data || [], total: count || 0 });
  }

  if (action === "comments") {
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const perPage = 30;
    const offset = (page - 1) * perPage;
    const { data, error, count } = await db
      .from("comments")
      .select("id, content, post_id, user_id, created_at, author:user_id(name, email)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + perPage - 1);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ comments: data || [], total: count || 0 });
  }

  if (action === "members") {
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const perPage = 30;
    const offset = (page - 1) * perPage;

    // Fetch subscriptions first
    const { data: subs, error, count } = await db
      .from("subscriptions")
      .select("id, user_id, status, started_at, expires_at, amount, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + perPage - 1);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!subs || subs.length === 0) return NextResponse.json({ members: [], total: count || 0 });

    // Fetch user data separately
    const userIds = [...new Set(subs.map((s: any) => s.user_id))];
    const { data: users } = await db
      .from("user")
      .select("id, name, email, image")
      .in("id", userIds);

    const userMap = Object.fromEntries((users || []).map((u: any) => [u.id, u]));

    const members = subs.map((s: any) => ({
      ...s,
      user: userMap[s.user_id] || null,
    }));

    return NextResponse.json({ members, total: count || 0 });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { action, target_id, reason } = body;
  const db = getAdminClient();

  if (action === "delete_post") {
    const { data: post } = await db.from("posts").select("thumbnail_key").eq("id", target_id).single();
    const { data: files } = await db.from("post_files").select("file_key").eq("post_id", target_id);
    const keys = [(post as any)?.thumbnail_key, ...((files || []).map((f: any) => f.file_key))].filter(Boolean);
    await deleteR2Objects(keys);
    await db.from("posts").delete().eq("id", target_id);
    return NextResponse.json({ success: true });
  }

  if (action === "delete_comment") {
    await db.from("comments").delete().eq("id", target_id);
    return NextResponse.json({ success: true });
  }

  if (action === "ban_user") {
    await db.from("user").update({ banned: true, banned_reason: reason || "Banned by admin" }).eq("id", target_id);
    await db.from("session").delete().eq("userId", target_id);
    return NextResponse.json({ success: true });
  }

  if (action === "unban_user") {
    await db.from("user").update({ banned: false, banned_reason: null }).eq("id", target_id);
    return NextResponse.json({ success: true });
  }

  if (action === "set_role") {
    await db.from("user").update({ role: body.role }).eq("id", target_id);
    return NextResponse.json({ success: true });
  }

  // ── Membership management ──
  if (action === "activate_member") {
    const { user_id, days = 30 } = body;
    const db2 = getAdminClient();

    // Get default plan
    const { data: plan } = await db2.from("membership_plans").select("id").eq("is_active", true).single();
    if (!plan) return NextResponse.json({ error: "No active plan" }, { status: 500 });

    const now = new Date();
    const expires = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    // Check existing subscription
    const { data: existing } = await db2
      .from("subscriptions")
      .select("id, expires_at")
      .eq("user_id", user_id)
      .eq("status", "active")
      .single();

    if (existing) {
      // Extend existing — add days from current expiry or now, whichever is later
      const currentExpiry = new Date(existing.expires_at);
      const base = currentExpiry > now ? currentExpiry : now;
      const newExpiry = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
      await db2.from("subscriptions").update({
        expires_at: newExpiry.toISOString(),
        updated_at: now.toISOString(),
      }).eq("id", existing.id);
    } else {
      // New subscription
      await db2.from("subscriptions").insert({
        user_id,
        plan_id: plan.id,
        status: "active",
        amount: 14999,
        started_at: now.toISOString(),
        expires_at: expires.toISOString(),
      });
    }
    return NextResponse.json({ success: true });
  }

  if (action === "deactivate_member") {
    // Accept both user_id from body or target_id
    const uid = body.user_id || target_id;
    await db.from("subscriptions")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("user_id", uid)
      .eq("status", "active");
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}