import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { headers } from "next/headers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getAdminClient();

  // Check ownership or admin
  const { data: post } = await db
    .from("posts")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const { data: currentUser } = await db
    .from("user")
    .select("role")
    .eq("id", session.user.id)
    .single();

  const isAdmin = currentUser?.role === "admin";
  const isOwner = post.user_id === session.user.id;

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { title, character_name, description, tags } = body;

  if (!title?.trim() || !character_name?.trim()) {
    return NextResponse.json({ error: "Title and character name are required" }, { status: 400 });
  }

  const { data, error } = await db
    .from("posts")
    .update({
      title: title.trim(),
      character_name: character_name.trim(),
      description: description?.trim() || null,
      tags: tags || [],
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ post: data });
}