import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET(_req: NextRequest) {
  const db = getAdminClient();
  const r2Dev = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_DEV_URL!;

  // All tags with post count
  const { data: tagRows } = await db
    .from("tags")
    .select("id, name, slug")
    .order("name");

  // Count posts per tag via unnest
  const tagCounts: Record<string, number> = {};
  if (tagRows && tagRows.length > 0) {
    for (const tag of tagRows) {
      const { count } = await db
        .from("posts")
        .select("id", { count: "exact", head: true })
        .overlaps("tags", [tag.name]);
      tagCounts[tag.slug] = count || 0;
    }
  }

  const tags = (tagRows || []).map((t: any) => ({
    ...t,
    post_count: tagCounts[t.slug] || 0,
  })).sort((a, b) => b.post_count - a.post_count);

  // Top characters by post count
  const { data: charRows } = await db
    .from("posts")
    .select("character_name, thumbnail_key")
    .order("created_at", { ascending: false });

  // Aggregate characters
  const charMap: Record<string, { count: number; thumbnail_key: string }> = {};
  for (const row of charRows || []) {
    const name = (row.character_name || "").trim();
    if (!name) continue;
    if (!charMap[name]) {
      charMap[name] = { count: 0, thumbnail_key: row.thumbnail_key };
    }
    charMap[name].count++;
  }

  const characters = Object.entries(charMap)
    .map(([name, data]) => ({
      name,
      slug: encodeURIComponent(name.toLowerCase().replace(/\s+/g, "-")),
      post_count: data.count,
      thumbnail_url: `${r2Dev}/${data.thumbnail_key}`,
    }))
    .sort((a, b) => b.post_count - a.post_count)
    .slice(0, 60); // top 60 characters

  return NextResponse.json({ tags, characters });
}