"use client";

import Link from "next/link";
import { ThumbsUp, ThumbsDown, Images, Calendar } from "lucide-react";
import { Post } from "@/types";
import { formatDate } from "@/lib/utils";

interface PostCardProps {
  post: Post;
}

const CDN_HOST = "cdn.pustakafoto.nyanpixel.my.id";

function cfImg(url: string, width: number, quality = 70): string {
  try {
    const u = new URL(url);
    if (
      u.hostname === CDN_HOST ||
      u.hostname.endsWith(".r2.dev") ||
      u.hostname.endsWith(".r2.cloudflarestorage.com")
    ) {
      return `${u.origin}/cdn-cgi/image/width=${width},quality=${quality},format=webp${u.pathname}`;
    }
  } catch {}
  return url;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <Link
      href={`/post/${post.id}`}
      style={{ textDecoration: "none", display: "block" }}
    >
      <article
        style={{
          background: "var(--bg-2)",
          border: "1px solid var(--border)",
          borderRadius: 3,
          overflow: "hidden",
          transition: "border-color 0.15s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-dim)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
        }}
      >
        {/* Thumbnail — 280px cukup untuk card grid ~200px wide */}
        <div style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden", background: "var(--bg-3)" }}>
          {post.thumbnail_url ? (
            <img
              src={cfImg(post.thumbnail_url, 280, 68)}
              alt={post.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div style={{
              width: "100%", height: "100%",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--text-3)",
            }}>
              <Images size={32} />
            </div>
          )}

          {/* File count badge */}
          {post.file_count > 0 && (
            <div style={{
              position: "absolute", bottom: 6, right: 6,
              background: "rgba(0,0,0,0.75)",
              border: "1px solid var(--border)",
              borderRadius: 2, padding: "2px 7px",
              fontSize: 11, color: "var(--text-2)",
              display: "flex", alignItems: "center", gap: 4,
            }}>
              <Images size={10} />
              {post.file_count}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
          <div
            style={{ fontSize: 15, fontWeight: "bold", color: "var(--text)", lineHeight: 1.3 }}
            title={post.title}
          >
            {post.title}
          </div>
          <div style={{ fontSize: 13, color: "var(--accent)", fontStyle: "italic" }}>
            {post.character_name}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 2 }}>
              {post.tags.slice(0, 3).map((tag) => (
                <span key={tag} style={{
                  fontSize: 10, padding: "1px 6px",
                  border: "1px solid var(--border)", borderRadius: 2,
                  color: "var(--text-3)",
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginTop: 4, paddingTop: 6, borderTop: "1px solid var(--border)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "var(--text-3)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <ThumbsUp size={11} /> {post.upvotes}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <ThumbsDown size={11} /> {post.downvotes}
              </span>
            </div>
            <span style={{ fontSize: 11, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 3 }}>
              <Calendar size={10} />
              {formatDate(post.created_at)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}