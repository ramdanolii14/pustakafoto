import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { headers } from "next/headers";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const db = getAdminClient();
  const { data: user } = await db.from("user").select("role").eq("id", session.user.id).single();
  if (user?.role !== "admin") return null;
  return session;
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function lastNDays(n: number): string[] {
  const days: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    days.push(dayKey(d));
  }
  return days;
}

export async function GET(_req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const db = getAdminClient();
  const days30 = lastNDays(30);
  const since30 = new Date(days30[0] + "T00:00:00.000Z").toISOString();

  // ── Totals ──
  const [
    { count: totalUsers },
    { count: totalPosts },
    { count: totalComments },
    { count: bannedUsers },
    { count: nudePosts },
    { count: membersOnlyPosts },
  ] = await Promise.all([
    db.from("user").select("id", { count: "exact", head: true }),
    db.from("posts").select("id", { count: "exact", head: true }),
    db.from("comments").select("id", { count: "exact", head: true }),
    db.from("user").select("id", { count: "exact", head: true }).eq("banned", true),
    db.from("posts").select("id", { count: "exact", head: true }).eq("is_nude", true),
    db.from("posts").select("id", { count: "exact", head: true }).eq("is_members_only", true),
  ]);

  // Active members (subscriptions active + not expired)
  const { count: activeMembers } = await db
    .from("subscriptions")
    .select("id", { count: "exact", head: true })
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString());

  // Total file count (sum across all posts)
  const { data: fileCountRows } = await db.from("posts").select("file_count");
  const totalFiles = (fileCountRows || []).reduce((sum: number, r: any) => sum + (r.file_count || 0), 0);

  // Total upvotes/downvotes
  const { data: voteRows } = await db.from("posts").select("upvotes, downvotes");
  const totalUpvotes = (voteRows || []).reduce((sum: number, r: any) => sum + (r.upvotes || 0), 0);
  const totalDownvotes = (voteRows || []).reduce((sum: number, r: any) => sum + (r.downvotes || 0), 0);

  // ── Time series: signups per day (last 30 days) ──
  const { data: userRows } = await db
    .from("user")
    .select("createdAt")
    .gte("createdAt", since30);

  const signupsByDay: Record<string, number> = {};
  for (const d of days30) signupsByDay[d] = 0;
  for (const row of userRows || []) {
    const key = dayKey(new Date((row as any).createdAt));
    if (key in signupsByDay) signupsByDay[key]++;
  }

  // ── Time series: posts per day (last 30 days) ──
  const { data: postRows } = await db
    .from("posts")
    .select("created_at")
    .gte("created_at", since30);

  const postsByDay: Record<string, number> = {};
  for (const d of days30) postsByDay[d] = 0;
  for (const row of postRows || []) {
    const key = dayKey(new Date((row as any).created_at));
    if (key in postsByDay) postsByDay[key]++;
  }

  // ── Time series: membership activations per day (last 30 days) ──
  const { data: subRows } = await db
    .from("subscriptions")
    .select("created_at, amount")
    .gte("created_at", since30);

  const membersByDay: Record<string, number> = {};
  const revenueByDay: Record<string, number> = {};
  for (const d of days30) { membersByDay[d] = 0; revenueByDay[d] = 0; }
  for (const row of subRows || []) {
    const key = dayKey(new Date((row as any).created_at));
    if (key in membersByDay) {
      membersByDay[key]++;
      revenueByDay[key] += (row as any).amount || 0;
    }
  }

  const totalRevenue30d = Object.values(revenueByDay).reduce((a, b) => a + b, 0);

  // ── Top tags by post count ──
  const { data: allTagsRows } = await db.from("posts").select("tags");
  const tagCounts: Record<string, number> = {};
  for (const row of allTagsRows || []) {
    for (const tag of (row as any).tags || []) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }
  const topTags = Object.entries(tagCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // ── Top posts by upvotes ──
  const { data: topPostsRows } = await db
    .from("posts")
    .select("id, title, character_name, upvotes, downvotes, file_count, thumbnail_key")
    .order("upvotes", { ascending: false })
    .limit(5);

  const r2Dev = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_DEV_URL!;
  const topPosts = (topPostsRows || []).map((p: any) => ({
    ...p,
    thumbnail_url: `${r2Dev}/${p.thumbnail_key}`,
  }));

  // ── Top uploaders by post count ──
  const { data: postUserRows } = await db.from("posts").select("user_id");
  const uploaderCounts: Record<string, number> = {};
  for (const row of postUserRows || []) {
    const uid = (row as any).user_id;
    uploaderCounts[uid] = (uploaderCounts[uid] || 0) + 1;
  }
  const topUploaderIds = Object.entries(uploaderCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  let topUploaders: any[] = [];
  if (topUploaderIds.length > 0) {
    const { data: uploaderUsers } = await db
      .from("user")
      .select("id, name, image")
      .in("id", topUploaderIds);
    topUploaders = topUploaderIds.map((id) => {
      const u = (uploaderUsers || []).find((u: any) => u.id === id);
      return { id, name: u?.name || "Unknown", image: u?.image, post_count: uploaderCounts[id] };
    });
  }

  return NextResponse.json({
    totals: {
      users: totalUsers || 0,
      posts: totalPosts || 0,
      comments: totalComments || 0,
      files: totalFiles,
      active_members: activeMembers || 0,
      banned_users: bannedUsers || 0,
      nude_posts: nudePosts || 0,
      members_only_posts: membersOnlyPosts || 0,
      total_upvotes: totalUpvotes,
      total_downvotes: totalDownvotes,
      revenue_30d: totalRevenue30d,
    },
    series: {
      days: days30,
      signups: days30.map((d) => signupsByDay[d]),
      posts: days30.map((d) => postsByDay[d]),
      members: days30.map((d) => membersByDay[d]),
      revenue: days30.map((d) => revenueByDay[d]),
    },
    top_tags: topTags,
    top_posts: topPosts,
    top_uploaders: topUploaders,
  });
}