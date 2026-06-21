import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { headers } from "next/headers";

export async function GET(_req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ banned: false });

    const db = getAdminClient();
    const { data } = await db
      .from("user")
      .select("banned")
      .eq("id", session.user.id)
      .single();

    return NextResponse.json({ banned: (data as any)?.banned || false });
  } catch {
    return NextResponse.json({ banned: false });
  }
}