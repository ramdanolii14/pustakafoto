import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { headers } from "next/headers";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit by user ID — 60 votes per minute
  const rl = rateLimit(`vote:${session.user.id}`, RATE_LIMITS.action);
  if (!rl.allowed) return rateLimitResponse(rl);

  const { post_id, vote_type } = await req.json();
  if (!post_id || !["up", "down"].includes(vote_type)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const db = getAdminClient();

  // Check existing vote
  const { data: existing } = await db
    .from("votes")
    .select("id, vote_type")
    .eq("user_id", session.user.id)
    .eq("post_id", post_id)
    .single();

  if (existing) {
    if (existing.vote_type === vote_type) {
      // Remove vote (toggle off)
      await db.from("votes").delete().eq("id", existing.id);
      await db.rpc("update_vote_counts", { p_post_id: post_id });
    } else {
      // Change vote
      await db.from("votes").update({ vote_type }).eq("id", existing.id);
      await db.rpc("update_vote_counts", { p_post_id: post_id });
    }
  } else {
    // New vote
    await db.from("votes").insert({ user_id: session.user.id, post_id, vote_type });
    await db.rpc("update_vote_counts", { p_post_id: post_id });
  }

  const { data: post } = await db
    .from("posts")
    .select("upvotes, downvotes")
    .eq("id", post_id)
    .single();

  return NextResponse.json({ upvotes: post?.upvotes || 0, downvotes: post?.downvotes || 0 });
}