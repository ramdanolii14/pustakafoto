import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { headers } from "next/headers";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const post_id = searchParams.get("post_id");
  if (!post_id) return NextResponse.json({ error: "post_id required" }, { status: 400 });

  const db = getAdminClient();
  const { data, error } = await db
    .from("comments")
    .select("id, content, created_at, author:user_id(id, name, image)")
    .eq("post_id", post_id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comments: data || [] });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit by user ID — 10 comments per minute
  const rl = rateLimit(`comment:${session.user.id}`, RATE_LIMITS.comment);
  if (!rl.allowed) return rateLimitResponse(rl);

  const { post_id, content } = await req.json();
  if (!post_id || !content?.trim()) {
    return NextResponse.json({ error: "post_id and content required" }, { status: 400 });
  }
  if (content.trim().length > 1000) {
    return NextResponse.json({ error: "Comment too long (max 1000 chars)" }, { status: 400 });
  }

  const db = getAdminClient();
  const { data, error } = await db
    .from("comments")
    .insert({ post_id, user_id: session.user.id, content: content.trim() })
    .select("id, content, created_at, author:user_id(id, name, image)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comment: data }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { comment_id } = await req.json();
  if (!comment_id) return NextResponse.json({ error: "comment_id required" }, { status: 400 });

  const db = getAdminClient();

  const { data: comment } = await db.from("comments").select("user_id").eq("id", comment_id).single();
  if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: user } = await db.from("user").select("role").eq("id", session.user.id).single();
  const isAdmin = user?.role === "admin";
  const isOwner = comment.user_id === session.user.id;

  if (!isAdmin && !isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db.from("comments").delete().eq("id", comment_id);
  return NextResponse.json({ success: true });
}