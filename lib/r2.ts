// lib/r2.ts
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomBytes } from "crypto";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.CLOUDFLARE_BUCKET_NAME!;
const R2_DEV_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_DEV_URL!;

/**
 * Build a stable public URL for a given R2 key.
 */
export function r2PublicUrl(key: string): string {
  return `${R2_DEV_URL}/${key}`;
}

/**
 * Generate a presigned PUT URL so the browser can upload directly to R2.
 * Expires in 15 minutes.
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(r2, command, { expiresIn: 900 });
}

/**
 * Generate a presigned GET URL for download (private objects).
 * Expires in 1 hour.
 */
export async function getPresignedDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  return getSignedUrl(r2, command, { expiresIn: 3600 });
}

/**
 * Delete multiple R2 objects by their keys.
 */
export async function deleteR2Objects(keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  await r2.send(
    new DeleteObjectsCommand({
      Bucket: BUCKET,
      Delete: {
        Objects: keys.map((Key) => ({ Key })),
        Quiet: true,
      },
    })
  );
}

/**
 * Build an R2 object key for a post file.
 * Format: posts/{postId}/[nyanpixel.my.id]-{character}-{n}-{token}.{ext}
 *
 * Deliberately does NOT use the uploader's original filename or any
 * part of it — that can leak local file paths, device/app names, or
 * other uploader metadata baked into the filename. Every file instead
 * gets a consistent, branded, non-identifying name. Extension is
 * derived from the validated MIME type, not the original filename.
 *
 * {n} is just the display/order number (file 1, 2, 3...) — on its
 * own it would let anyone who has one file's URL (e.g. a free preview
 * on a members-only post) just increment it in the address bar to
 * reach files that were supposed to be locked, completely bypassing
 * the API's membership check since R2 objects are fetched directly
 * and never go through our server. The trailing {token} is a random,
 * unguessable base64url string appended per file specifically to
 * kill that trick — knowing the number is no longer enough, you'd
 * also have to guess the token.
 */
const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
  "image/avif": "avif",
};

export function buildFileKey(
  postId: string,
  characterName: string,
  index: number,
  mimeType: string
): string {
  const ext = MIME_EXT[mimeType] || "jpg";

  const character =
    characterName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_-]/g, "") || "unknown";

  // 6 random bytes -> 8-char base64url token (URL/filename-safe: only
  // A-Z a-z 0-9 - _, no padding). Short, but ~281 trillion possible
  // values per file — not brute-forceable by guessing/incrementing.
  const token = randomBytes(6).toString("base64url");

  const filename = `[nyanpixel.my.id]-${character}-${index + 1}-${token}.${ext}`;
  return `posts/${postId}/${filename}`;
}

export { r2, BUCKET };