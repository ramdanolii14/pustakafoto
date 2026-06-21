import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getAdminClient();
  const r2Dev = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_DEV_URL!;
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const perPage = 24;
  const offset = (page - 1) * perPage;

  const { data: user } = await db
    .from("user")
    .select("id, name, image, role, banned, createdAt")
    .eq("id", id)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if ((user as any).banned) {
    return NextResponse.json({ error: "This account has been banned" }, { status: 403 });
  }

  const { data: posts, count } = await db
    .from("posts")
    .select(
      "id, title, character_name, tags, thumbnail_key, file_count, upvotes, downvotes, created_at",
      { count: "exact" }
    )
    .eq("user_id", id)
    .order("created_at", { ascending: false })
    .range(offset, offset + perPage - 1);

  // Stats
  const { data: statsData } = await db
    .from("posts")
    .select("upvotes, downvotes, file_count")
    .eq("user_id", id);

  const stats = (statsData || []).reduce(
    (acc: any, p: any) => ({
      total_upvotes: acc.total_upvotes + p.upvotes,
      total_downvotes: acc.total_downvotes + p.downvotes,
      total_files: acc.total_files + p.file_count,
    }),
    { total_upvotes: 0, total_downvotes: 0, total_files: 0 }
  );

  const enrichedPosts = (posts || []).map((p: any) => ({
    ...p,
    thumbnail_url: `${r2Dev}/${p.thumbnail_key}`,
  }));

  return NextResponse.json({
    user,
    posts: enrichedPosts,
    total: count || 0,
    page,
    per_page: perPage,
    stats,
  });
}