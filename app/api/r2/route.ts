// app/api/r2/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getPresignedUploadUrl,
  getPresignedDownloadUrl,
  buildFileKey,
  r2PublicUrl,
} from "@/lib/r2";
import { getAdminClient } from "@/lib/supabase";
import { headers } from "next/headers";
import { isValidImageType } from "@/lib/utils";
import { isAdminUser } from "@/lib/require-admin";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

/**
 * POST /api/r2/upload
 * Body: { post_id: string, files: Array<{ name: string, type: string, size: number }> }
 * Returns: Array<{ upload_url, file_key, public_url }>
 *
 * Upload is admin-only. This check is authoritative — the client UI
 * also gates the upload page, but that's just UX; someone hitting
 * this route directly (curl, devtools, modified JS) still gets 403
 * here because the role is re-verified from the DB on every request.
 */
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await isAdminUser(session.user.id))) {
    return NextResponse.json({ error: "Forbidden — upload is admin-only" }, { status: 403 });
  }

  // Rate limit by user ID — 5 upload batches per minute
  const rl = rateLimit(`upload:${session.user.id}`, RATE_LIMITS.upload);
  if (!rl.allowed) return rateLimitResponse(rl);

  const { post_id, files } = await req.json();

  if (!post_id || !files || !Array.isArray(files)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const results = await Promise.all(
    files.map(async (f: { name: string; type: string; size: number }) => {
      if (!isValidImageType(f.type)) {
        throw new Error(`Unsupported file type: ${f.type}`);
      }
      const key = buildFileKey(post_id, f.name);
      const upload_url = await getPresignedUploadUrl(key, f.type);
      return {
        upload_url,
        file_key: key,
        public_url: r2PublicUrl(key),
      };
    })
  ).catch((err) => {
    return null;
  });

  if (!results) {
    return NextResponse.json(
      { error: "Failed to generate upload URLs" },
      { status: 500 }
    );
  }

  return NextResponse.json({ urls: results });
}

/**
 * GET /api/r2/download?post_id=xxx
 * Returns presigned download URLs for all files in a post
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const post_id = searchParams.get("post_id");

  if (!post_id) {
    return NextResponse.json({ error: "post_id required" }, { status: 400 });
  }

  const db = getAdminClient();
  const { data: files, error } = await db
    .from("post_files")
    .select("file_key, file_name")
    .eq("post_id", post_id)
    .order("sort_order");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const urls = await Promise.all(
    (files || []).map(async (f: any) => ({
      file_name: f.file_name,
      url: await getPresignedDownloadUrl(f.file_key),
    }))
  );

  return NextResponse.json({ files: urls });
}