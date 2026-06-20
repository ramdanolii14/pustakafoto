import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { headers } from "next/headers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getAdminClient();
  const r2Dev = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_DEV_URL!;

  const { data, error } = await db
    .from("post_files")
    .select("*")
    .eq("post_id", id)
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const files = (data || []).map((f: any) => ({
    ...f,
    url: `${r2Dev}/${f.file_key}`,
  }));

  return NextResponse.json({ files });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getAdminClient();
  const body = await req.json();
  const { files } = body; // Array of { file_key, file_name, file_size, mime_type, sort_order }

  if (!files || !Array.isArray(files) || files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const { data: post } = await db
    .from("posts")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!post || post.user_id !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = files.map((f: any) => ({
    post_id: id,
    user_id: session.user.id,
    file_key: f.file_key,
    file_name: f.file_name,
    file_size: f.file_size || 0,
    mime_type: f.mime_type || "image/jpeg",
    sort_order: f.sort_order || 0,
  }));

  const { data, error } = await db
    .from("post_files")
    .insert(rows)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update file_count on post
  const { count } = await db
    .from("post_files")
    .select("*", { count: "exact", head: true })
    .eq("post_id", id);

  await db.from("posts").update({ file_count: count || 0 }).eq("id", id);

  return NextResponse.json({ files: data }, { status: 201 });
}
