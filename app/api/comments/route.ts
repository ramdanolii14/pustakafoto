import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { deleteR2Objects } from "@/lib/r2";
import { headers } from "next/headers";
import { isAdminUser } from "@/lib/require-admin";
import { checkMembership } from "@/lib/membership";
import { freeFileCount, redactLockedFiles } from "@/lib/file-access";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getAdminClient();
  const r2Dev = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_DEV_URL!;

  // Get session to check user vote
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null);

  const { data: post, error } = await db
    .from("posts")
    .select(
      `
      id, user_id, title, character_name, description, tags,
      thumbnail_key, file_count, upvotes, downvotes, created_at, updated_at,
      is_nude, is_members_only, is_free_all, free_percent, forced_members_only,
      user:user_id (id, name, image)
    `
    )
    .eq("id", id)
    .single();

  if (error || !post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const { data: files } = await db
    .from("post_files")
    .select("*")
    .eq("post_id", id)
    .order("sort_order", { ascending: true });

  const { data: comments } = await db
    .from("comments")
    .select(`*, author:user_id (id, name, image)`)
    .eq("post_id", id)
    .order("created_at", { ascending: true });

  let userVote = null;
  if (session) {
    const { data: vote } = await db
      .from("votes")
      .select("vote_type")
      .eq("post_id", id)
      .eq("user_id", session.user.id)
      .single();
    userVote = vote?.vote_type || null;
  }

  // --- Members-only enforcement (server-side, authoritative) ---
  // Mirrors the exact gating math PostDetailClient.tsx already uses for
  // display, but decides it here so a locked file's real key/URL never
  // leaves the server for a viewer who isn't entitled to see it. Calling
  // this endpoint directly (curl/devtools) can no longer read the R2 key
  // for anything beyond what the post's own settings allow.
  const isOwner = !!session && session.user.id === (post as any).user_id;
  const isAdmin = session ? await isAdminUser(session.user.id) : false;
  const isMember = session ? await checkMembership(session.user.id) : false;

  const allFiles = files || [];
  const freeCount = freeFileCount(post as any, allFiles.length, { isOwner, isAdmin, isMember });
  const enrichedFiles = redactLockedFiles(allFiles as any, freeCount, (key) => `${r2Dev}/${key}`);

  return NextResponse.json({
    post: {
      ...post,
      thumbnail_url: `${r2Dev}/${(post as any).thumbnail_key}`,
      author: (post as any).user,
      user_vote: userVote,
    },
    files: enrichedFiles,
    comments: comments || [],
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getAdminClient();

  const { data: post } = await db
    .from("posts")
    .select("user_id, thumbnail_key")
    .eq("id", id)
    .single();

  if (!post || post.user_id !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: files } = await db
    .from("post_files")
    .select("file_key")
    .eq("post_id", id);

  const keys = [
    (post as any).thumbnail_key,
    ...((files || []).map((f: any) => f.file_key)),
  ];

  await deleteR2Objects(keys);
  await db.from("posts").delete().eq("id", id);

  return NextResponse.json({ success: true });
}