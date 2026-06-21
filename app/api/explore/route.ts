import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // "tag" | "character"
  const slug = searchParams.get("slug") || "";
  const sort = searchParams.get("sort") || "recent";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const perPage = 24;
  const offset = (page - 1) * perPage;
  const db = getAdminClient();
  const r2Dev = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_DEV_URL!;

  if (!type || !slug) {
    return NextResponse.json({ error: "type and slug required" }, { status: 400 });
  }

  let query = db
    .from("posts")
    .select(
      `id, user_id, title, character_name, description, tags,
      thumbnail_key, file_count, upvotes, downvotes, created_at, updated_at,
      user:user_id (id, name, image)`,
      { count: "exact" }
    )
    .range(offset, offset + perPage - 1);

  if (type === "tag") {
    // Title Case match
    const tagName = slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();
    query = query.overlaps("tags", [tagName]);
  } else if (type === "character") {
    // Decode slug back to search term
    const term = decodeURIComponent(slug).replace(/-/g, " ");
    query = query.ilike("character_name", `%${term}%`);
  }

  // Sort
  if (sort === "top") {
    query = query.order("upvotes", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const posts = (data || []).map((p: any) => ({
    ...p,
    thumbnail_url: `${r2Dev}/${p.thumbnail_key}`,
    author: p.user,
  }));

  return NextResponse.json({ posts, total: count || 0, page, per_page: perPage });
}