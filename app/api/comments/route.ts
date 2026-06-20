import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const post_id = searchParams.get("post_id");

  if (!post_id) {
    return NextResponse.json({ error: "post_id required" }, { status: 400 });
  }

  const db = getAdminClient();
  const { data, error } = await db
    .from("comments")
    .select(`*, author:user_id (id, name, image)`)
    .eq("post_id", post_id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ comments: data || [] });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { post_id, content } = await req.json();

  if (!post_id || !content?.trim()) {
    return NextResponse.json({ error: "post_id and content required" }, { status: 400 });
  }

  const db = getAdminClient();

  const { data, error } = await db
    .from("comments")
    .insert({
      post_id,
      user_id: session.user.id,
      content: content.trim(),
    })
    .select(`*, author:user_id (id, name, image)`)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ comment: data }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const db = getAdminClient();

  const { data: comment } = await db
    .from("comments")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!comment || comment.user_id !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.from("comments").delete().eq("id", id);

  return NextResponse.json({ success: true });
}
