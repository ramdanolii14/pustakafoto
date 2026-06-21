import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
  const db = getAdminClient();
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q") || "";
  const tags = searchParams.get("tags") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const perPage = 24;
  const offset = (page - 1) * perPage;

  let query = db
    .from("posts")
    .select(
      `
      id, user_id, title, character_name, description, tags,
      thumbnail_key, file_count, upvotes, downvotes, created_at, updated_at,
      user:user_id (id, name, image)
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + perPage - 1);

  if (q) {
    query = query.textSearch("fts", q, {
      type: "websearch",
      config: "english",
    });
  }

  if (tags) {
    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (tagList.length > 0) {
      query = query.overlaps("tags", tagList);
    }
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const r2Dev = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_DEV_URL!;
  const posts = (data || []).map((p: any) => ({
    ...p,
    thumbnail_url: `${r2Dev}/${p.thumbnail_key}`,
    author: p.user,
  }));

  return NextResponse.json({ posts, total: count || 0, page, per_page: perPage });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, title, character_name, description, tags, thumbnail_key } = body;

  if (!id || !title || !character_name || !thumbnail_key) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

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
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ post: data }, { status: 201 });
}
