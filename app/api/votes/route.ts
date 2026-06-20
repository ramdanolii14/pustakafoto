import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { post_id, vote_type } = await req.json();

  if (!post_id || !["up", "down"].includes(vote_type)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const db = getAdminClient();
  const userId = session.user.id;

  const { data: existing } = await db
    .from("votes")
    .select("id, vote_type")
    .eq("post_id", post_id)
    .eq("user_id", userId)
    .single();

  if (existing) {
    if (existing.vote_type === vote_type) {
      // Toggle off — remove vote
      await db.from("votes").delete().eq("id", existing.id);
      return NextResponse.json({ action: "removed", vote_type: null });
    } else {
      // Change vote
      await db
        .from("votes")
        .update({ vote_type })
        .eq("id", existing.id);
      return NextResponse.json({ action: "changed", vote_type });
    }
  }

  // New vote
  await db.from("votes").insert({ post_id, user_id: userId, vote_type });
  return NextResponse.json({ action: "added", vote_type });
}
