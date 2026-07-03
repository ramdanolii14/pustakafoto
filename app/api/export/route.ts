import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { headers } from "next/headers";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function GET(_req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit by user ID — 3 exports per 5 minutes
  const rl = rateLimit(`export:${session.user.id}`, { limit: 3, windowSec: 300 });
  if (!rl.allowed) return rateLimitResponse(rl);

  const db = getAdminClient();
  const userId = session.user.id;
  const r2Dev = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_DEV_URL!;

  const { data: user } = await db
    .from("user")
    .select("id, name, email, image, role, createdAt")
    .eq("id", userId)
    .single();

  const { data: posts } = await db
    .from("posts")
    .select(`
      id, title, character_name, description, tags,
      thumbnail_key, file_count, upvotes, downvotes,
      is_nude, is_members_only, is_free_all, free_percent,
      created_at, updated_at
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const postIds = (posts || []).map((p: any) => p.id);
  let files: any[] = [];
  if (postIds.length > 0) {
    const { data } = await db
      .from("post_files")
      .select("post_id, file_key, file_name, file_size, mime_type, sort_order, created_at")
      .in("post_id", postIds);
    files = data || [];
  }

  const { data: comments } = await db
    .from("comments")
    .select("id, post_id, content, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const { data: votes } = await db
    .from("votes")
    .select("post_id, vote_type, created_at")
    .eq("user_id", userId);

  const { data: bookmarks } = await db
    .from("bookmarks")
    .select("post_id, created_at")
    .eq("user_id", userId);

  const { data: subscriptions } = await db
    .from("subscriptions")
    .select("status, amount, started_at, expires_at, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const enrichedPosts = (posts || []).map((p: any) => ({
    ...p,
    thumbnail_url: `${r2Dev}/${p.thumbnail_key}`,
    files: files
      .filter((f) => f.post_id === p.id)
      .map((f) => ({ ...f, url: `${r2Dev}/${f.file_key}` })),
  }));

  const exportData = {
    export_info: {
      generated_at: new Date().toISOString(),
      platform: "PustakaFoto",
      data_subject: "This export contains all personal data associated with your account.",
    },
    profile: user,
    posts: enrichedPosts,
    comments: comments || [],
    votes: votes || [],
    bookmarks: bookmarks || [],
    membership_history: subscriptions || [],
    summary: {
      total_posts: enrichedPosts.length,
      total_files: files.length,
      total_comments: (comments || []).length,
      total_votes: (votes || []).length,
      total_bookmarks: (bookmarks || []).length,
    },
  };

  const fileName = `pustakafoto-data-export-${userId.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.json`;

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}