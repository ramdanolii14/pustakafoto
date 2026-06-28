import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { headers } from "next/headers";

// GET /api/bookmarks?post_id=xxx  → check if bookmarked
// GET /api/bookmarks?page=1       → list user's bookmarks
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const post_id = searchParams.get("post_id");
  const db = getAdminClient();
  const r2Dev = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_DEV_URL!;

  // Check single post
  if (post_id) {
    const { data } = await db
      .from("bookmarks")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("post_id", post_id)
      .single();
    return NextResponse.json({ bookmarked: !!data });
  }

  // List all bookmarks with post data
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const perPage = 24;
  const offset = (page - 1) * perPage;

  const { data, error, count } = await db
    .from("bookmarks")
    .select(`
      id, created_at,
      post:post_id (
        id, user_id, title, character_name, tags,
        thumbnail_key, file_count, upvotes, downvotes, created_at,
        is_nude, is_members_only,
        user:user_id (id, name, image)
      )
    `, { count: "exact" })
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + perPage - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const bookmarks = (data || []).map((b: any) => ({
    ...b,
    post: b.post ? {
      ...b.post,
      thumbnail_url: `${r2Dev}/${b.post.thumbnail_key}`,
      author: b.post.user,
    } : null,
  }));

  return NextResponse.json({ bookmarks, total: count || 0, page, per_page: perPage });
}

// POST /api/bookmarks → toggle bookmark
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { post_id } = await req.json();
  if (!post_id) return NextResponse.json({ error: "post_id required" }, { status: 400 });

  const db = getAdminClient();

  const { data: existing } = await db
    .from("bookmarks")
    .select("id")
    .eq("user_id", session.user.id)
    .eq("post_id", post_id)
    .single();

  if (existing) {
    await db.from("bookmarks").delete().eq("id", existing.id);
    return NextResponse.json({ bookmarked: false });
  }

  await db.from("bookmarks").insert({ user_id: session.user.id, post_id });
  return NextResponse.json({ bookmarked: true });
}