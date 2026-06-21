import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { deleteR2Objects } from "@/lib/r2";
import { headers } from "next/headers";

async function requireAdmin(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const db = getAdminClient();
  const { data: user } = await db
    .from("user")
    .select("role")
    .eq("id", session.user.id)
    .single();

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
      .select("id, title, character_name, user_id, file_count, upvotes, downvotes, created_at, user:user_id(name, email)", { count: "exact" })
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

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { action, target_id, reason } = body;
  const db = getAdminClient();

  // Delete post
  if (action === "delete_post") {
    const { data: post } = await db
      .from("posts")
      .select("thumbnail_key")
      .eq("id", target_id)
      .single();

    const { data: files } = await db
      .from("post_files")
      .select("file_key")
      .eq("post_id", target_id);

    const keys = [
      (post as any)?.thumbnail_key,
      ...((files || []).map((f: any) => f.file_key)),
    ].filter(Boolean);

    await deleteR2Objects(keys);
    await db.from("posts").delete().eq("id", target_id);

    return NextResponse.json({ success: true });
  }

  // Delete comment
  if (action === "delete_comment") {
    await db.from("comments").delete().eq("id", target_id);
    return NextResponse.json({ success: true });
  }

  // Ban user
  if (action === "ban_user") {
    await db
      .from("user")
      .update({ banned: true, banned_reason: reason || "Banned by admin" })
      .eq("id", target_id);

    // Invalidate all sessions
    await db.from("session").delete().eq("userId", target_id);

    return NextResponse.json({ success: true });
  }

  // Unban user
  if (action === "unban_user") {
    await db
      .from("user")
      .update({ banned: false, banned_reason: null })
      .eq("id", target_id);

    return NextResponse.json({ success: true });
  }

  // Promote to admin
  if (action === "set_role") {
    const { role } = body;
    await db.from("user").update({ role }).eq("id", target_id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}