import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { headers } from "next/headers";
import { rateLimit, getClientIp, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  // Read requests: rate limit by IP (no login required) — 120/min
  const ip = getClientIp(req);
  const rl = rateLimit(`posts-read:${ip}`, RATE_LIMITS.read);
  if (!rl.allowed) return rateLimitResponse(rl);

  const db = getAdminClient();
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q")?.trim() || "";
  const tags = searchParams.get("tags") || "";
  const sort = searchParams.get("sort") || "recent";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const perPage = 24;
  const offset = (page - 1) * perPage;
  const r2Dev = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_DEV_URL!;

  if (sort === "random" && !q && !tags) {
    const { data, error } = await db.rpc("get_random_posts", { limit_n: perPage });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const posts = (data || []).map((p: any) => ({
      ...p,
      thumbnail_url: `${r2Dev}/${p.thumbnail_key}`,
      author: p.user_data,
    }));
    return NextResponse.json({ posts, total: posts.length, page: 1, per_page: perPage });
  }

  let query = db
    .from("posts")
    .select(
      `id, user_id, title, character_name, description, tags,
      thumbnail_key, file_count, upvotes, downvotes, created_at, updated_at,
      is_nude, is_members_only, is_free_all, free_percent, forced_members_only,
      user:user_id (id, name, image)`,
      { count: "exact" }
    )
    .range(offset, offset + perPage - 1);

  if (sort === "top") {
    query = query.order("upvotes", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  if (q) {
    query = query.or(`title.ilike.%${q}%,character_name.ilike.%${q}%,description.ilike.%${q}%`);
  }

  if (tags) {
    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
    if (tagList.length > 0) query = query.overlaps("tags", tagList);
  }

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const posts = (data || []).map((p: any) => ({
    ...p,
    thumbnail_url: `${r2Dev}/${p.thumbnail_key}`,
    author: p.user,
  }));

  return NextResponse.json({ posts, total: count || 0, page, per_page: perPage });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit POST by user ID — 30 posts per minute
  const rl = rateLimit(`post-create:${session.user.id}`, RATE_LIMITS.write);
  if (!rl.allowed) return rateLimitResponse(rl);

  const body = await req.json();
  const { id, title, character_name, description, tags, thumbnail_key } = body;

  if (!id || !title || !character_name || !thumbnail_key) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { is_nude = false, is_members_only = false, is_free_all = true, free_percent = 100 } = body;

  const db = getAdminClient();
  const { data, error } = await db
    .from("posts")
    .insert({
      id,
      user_id: session.user.id,
      title: title.trim(),
      character_name: character_name.trim(),
      description: description?.trim() || null,
      tags: tags || [],
      thumbnail_key,
      is_nude: !!is_nude,
      is_members_only: !!is_members_only || !!is_nude,
      is_free_all: !!is_free_all,
      free_percent: Math.max(0, Math.min(100, parseInt(free_percent) || 100)),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ post: data }, { status: 201 });
}