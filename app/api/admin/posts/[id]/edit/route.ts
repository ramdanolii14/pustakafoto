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
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getAdminClient();
  const { data: user } = await db
    .from("user").select("role").eq("id", session.user.id).single();

  if (user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { forced_members_only } = await req.json();

  const { data, error } = await db
    .from("posts")
    .update({
      forced_members_only: !!forced_members_only,
      is_members_only: !!forced_members_only,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id, forced_members_only, is_members_only")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ post: data });
}