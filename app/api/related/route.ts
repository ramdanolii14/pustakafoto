import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const post_id = searchParams.get("post_id");
  const character = searchParams.get("character") || "";
  const tags = searchParams.get("tags") || "";
  const limit = Math.min(12, parseInt(searchParams.get("limit") || "6"));

  if (!post_id) return NextResponse.json({ posts: [] });

  const db = getAdminClient();
  const r2Dev = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_DEV_URL!;
  const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);

  // Strategy: find posts sharing same character OR tags, exclude current post
  // Priority: same character > shared tags
  const results: any[] = [];
  const seen = new Set<string>([post_id]);

  // 1. Same character (up to half the limit)
  if (character) {
    const { data: charPosts } = await db
      .from("posts")
      .select("id, title, character_name, tags, thumbnail_key, file_count, upvotes, created_at, is_nude, is_members_only")
      .ilike("character_name", `%${character.split(" ")[0]}%`)
      .neq("id", post_id)
      .order("upvotes", { ascending: false })
      .limit(Math.ceil(limit / 2));

    for (const p of charPosts || []) {
      if (!seen.has(p.id)) { seen.add(p.id); results.push({ ...p, _reason: "character" }); }
    }
  }

  // 2. Shared tags (fill remaining)
  if (tagList.length > 0 && results.length < limit) {
    const { data: tagPosts } = await db
      .from("posts")
      .select("id, title, character_name, tags, thumbnail_key, file_count, upvotes, created_at, is_nude, is_members_only")
      .overlaps("tags", tagList)
      .neq("id", post_id)
      .order("upvotes", { ascending: false })
      .limit(limit);

    for (const p of tagPosts || []) {
      if (!seen.has(p.id)) { seen.add(p.id); results.push({ ...p, _reason: "tags" }); }
    }
  }

  // 3. If still not enough, fill with recent posts
  if (results.length < limit) {
    const { data: recentPosts } = await db
      .from("posts")
      .select("id, title, character_name, tags, thumbnail_key, file_count, upvotes, created_at, is_nude, is_members_only")
      .neq("id", post_id)
      .order("created_at", { ascending: false })
      .limit(limit);

    for (const p of recentPosts || []) {
      if (!seen.has(p.id)) { seen.add(p.id); results.push({ ...p, _reason: "recent" }); }
    }
  }

  const posts = results.slice(0, limit).map((p) => ({
    ...p,
    thumbnail_url: `${r2Dev}/${p.thumbnail_key}`,
  }));

  return NextResponse.json({ posts });
}