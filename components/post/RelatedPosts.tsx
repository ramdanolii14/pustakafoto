"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

const CDN_HOST = "cdn.pustakafoto.nyanpixel.my.id";
function cfImg(url: string, width: number, quality = 70): string {
  try {
    const u = new URL(url);
    if (u.hostname === CDN_HOST || u.hostname.endsWith(".r2.dev") || u.hostname.endsWith(".r2.cloudflarestorage.com")) {
      return `${u.origin}/cdn-cgi/image/width=${width},quality=${quality},format=webp${u.pathname}`;
    }
  } catch {}
  return url;
}

interface RelatedPost {
  id: string;
  title: string;
  character_name: string;
  thumbnail_url: string;
  upvotes: number;
  is_nude: boolean;
}

interface RelatedPostsProps {
  postId: string;
  character: string;
  tags: string[];
}

export default function RelatedPosts({ postId, character, tags }: RelatedPostsProps) {
  const [posts, setPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({
      post_id: postId,
      character,
      tags: tags.join(","),
      limit: "6",
    });
    fetch(`/api/related?${params}`)
      .then((r) => r.json())
      .then((d) => setPosts(d.posts || []))
      .finally(() => setLoading(false));
  }, [postId, character, tags]);

  if (loading || posts.length === 0) return null;

  return (
    <section style={{
      background: "var(--bg-2)", border: "1px solid var(--border)",
      borderRadius: 3, padding: "14px 16px", marginTop: 12,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 7,
        marginBottom: 12, fontSize: 14, fontWeight: "bold", color: "var(--text)",
      }}>
        <Sparkles size={14} color="var(--accent)" />
        Related Posts
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
        gap: 8,
      }}>
        {posts.map((p) => (
          <Link key={p.id} href={`/post/${p.id}`} style={{ textDecoration: "none" }}>
            <div style={{
              borderRadius: 2, overflow: "hidden",
              border: "1px solid var(--border)",
              background: "var(--bg-3)",
              transition: "border-color 0.12s",
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-dim)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
            >
              {/* Thumbnail */}
              <div style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden" }}>
                <img
                  src={cfImg(p.thumbnail_url, 200, 70)}
                  alt={p.title}
                  loading="lazy"
                  decoding="async"
                  style={{
                    width: "100%", height: "100%", objectFit: "cover",
                    filter: p.is_nude ? "blur(8px)" : "none",
                    transform: p.is_nude ? "scale(1.1)" : "none",
                  }}
                />
                {p.is_nude && (
                  <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(0,0,0,0.3)",
                  }}>
                    <span style={{
                      fontSize: 10, fontWeight: "bold", padding: "2px 6px",
                      background: "rgba(204,68,68,0.8)", color: "white", borderRadius: 2,
                    }}>18+</span>
                  </div>
                )}
              </div>
              {/* Info */}
              <div style={{ padding: "6px 8px" }}>
                <div style={{
                  fontSize: 11, fontWeight: "bold", color: "var(--text)",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  marginBottom: 2,
                }}>
                  {p.title}
                </div>
                <div style={{
                  fontSize: 10, color: "var(--accent)", fontStyle: "italic",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {p.character_name}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}