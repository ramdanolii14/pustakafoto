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

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "posts"; // posts | users | comments | members

  const db = getAdminClient();
  const r2Dev = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_DEV_URL!;

  let rows: any[] = [];
  let fileName = "";

  if (type === "posts") {
    const { data } = await db
      .from("posts")
      .select(`
        id, user_id, title, character_name, description, tags,
        thumbnail_key, file_count, upvotes, downvotes,
        is_nude, is_members_only, is_free_all, free_percent, forced_members_only,
        created_at, updated_at,
        user:user_id(name, email)
      `)
      .order("created_at", { ascending: false });

    rows = (data || []).map((p: any) => ({
      ...p,
      thumbnail_url: `${r2Dev}/${p.thumbnail_key}`,
      author_name: p.user?.name,
      author_email: p.user?.email,
    }));
    fileName = "posts";
  } else if (type === "users") {
    const { data } = await db
      .from("user")
      .select("id, name, email, role, banned, banned_reason, createdAt")
      .order("createdAt", { ascending: false });
    rows = data || [];
    fileName = "users";
  } else if (type === "comments") {
    const { data } = await db
      .from("comments")
      .select(`id, post_id, content, created_at, author:user_id(name, email)`)
      .order("created_at", { ascending: false });
    rows = (data || []).map((c: any) => ({
      ...c,
      author_name: c.author?.name,
      author_email: c.author?.email,
    }));
    fileName = "comments";
  } else if (type === "members") {
    const { data } = await db
      .from("subscriptions")
      .select(`id, user_id, status, amount, started_at, expires_at, created_at, user:user_id(name, email)`)
      .order("created_at", { ascending: false });
    rows = (data || []).map((m: any) => ({
      ...m,
      user_name: m.user?.name,
      user_email: m.user?.email,
    }));
    fileName = "members";
  } else {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const format = searchParams.get("format") || "json";
  const dateStr = new Date().toISOString().slice(0, 10);

  if (format === "csv") {
    const csv = toCSV(rows);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="pustakafoto-${fileName}-${dateStr}.csv"`,
      },
    });
  }

  return new NextResponse(JSON.stringify({ exported_at: new Date().toISOString(), type, count: rows.length, data: rows }, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="pustakafoto-${fileName}-${dateStr}.json"`,
    },
  });
}

function toCSV(rows: any[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]).filter((k) => typeof rows[0][k] !== "object");
  const lines = [headers.join(",")];

  for (const row of rows) {
    const values = headers.map((h) => {
      let val = row[h];
      if (val === null || val === undefined) return "";
      if (Array.isArray(val)) val = val.join("; ");
      val = String(val).replace(/"/g, '""');
      if (val.includes(",") || val.includes("\n") || val.includes('"')) {
        return `"${val}"`;
      }
      return val;
    });
    lines.push(values.join(","));
  }

  return lines.join("\n");
}