"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Hash, Sword, Loader, TrendingUp } from "lucide-react";

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

interface Tag { id: string; name: string; slug: string; post_count: number; }
interface Character { name: string; slug: string; post_count: number; thumbnail_url: string; }

const TAG_COLORS: Record<string, string> = {
  anime: "#e84393", game: "#4488cc", solo: "#44aa66",
  group: "#cc8844", outdoor: "#44aacc", indoor: "#8844cc",
  original: "#ccaa44", event: "#cc4444", studio: "#44ccaa", concept: "#aa44cc",
};

export default function ExploreOverviewClient() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllChars, setShowAllChars] = useState(false);

  useEffect(() => {
    fetch("/api/explore/overview")
      .then((r) => r.json())
      .then((d) => { setTags(d.tags || []); setCharacters(d.characters || []); })
      .finally(() => setLoading(false));
  }, []);

  const visibleChars = showAllChars ? characters : characters.slice(0, 24);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader size={24} color="var(--accent)" style={{ animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Import AppShell inline to avoid circular */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "16px" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: "bold", color: "var(--text)", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
            <TrendingUp size={22} color="var(--accent)" />
            Explore
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-3)" }}>
            Jelajahi semua konten berdasarkan tag dan karakter cosplay.
          </p>
        </div>

        {/* Tags section */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{
            fontSize: 16, fontWeight: "bold", color: "var(--text)",
            marginBottom: 14, display: "flex", alignItems: "center", gap: 7,
            paddingBottom: 8, borderBottom: "1px solid var(--border)",
          }}>
            <Hash size={15} color="var(--accent)" /> Tags
            <span style={{ fontSize: 12, fontWeight: "normal", color: "var(--text-3)", marginLeft: 2 }}>
              ({tags.length})
            </span>
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {tags.map((tag) => {
              const color = TAG_COLORS[tag.slug] || "var(--accent)";
              return (
                <Link
                  key={tag.id}
                  href={`/explore/tag/${tag.slug}`}
                  style={{ textDecoration: "none" }}
                >
                  <div style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "8px 14px",
                    background: "var(--bg-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 3,
                    transition: "all 0.12s",
                  }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = color;
                      el.style.background = `${color}12`;
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = "var(--border)";
                      el.style.background = "var(--bg-2)";
                    }}
                  >
                    <span style={{ fontSize: 14, color, fontWeight: "bold" }}>#</span>
                    <span style={{ fontSize: 13, color: "var(--text)", fontWeight: "bold" }}>{tag.name}</span>
                    <span style={{
                      fontSize: 11, color: "var(--text-3)",
                      background: "var(--bg-3)", padding: "1px 6px",
                      borderRadius: 10,
                    }}>
                      {tag.post_count.toLocaleString()}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Characters section */}
        {characters.length > 0 && (
          <section>
            <h2 style={{
              fontSize: 16, fontWeight: "bold", color: "var(--text)",
              marginBottom: 14, display: "flex", alignItems: "center", gap: 7,
              paddingBottom: 8, borderBottom: "1px solid var(--border)",
            }}>
              <Sword size={15} color="var(--accent)" /> Characters
              <span style={{ fontSize: 12, fontWeight: "normal", color: "var(--text-3)", marginLeft: 2 }}>
                ({characters.length})
              </span>
            </h2>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: 8,
            }}>
              {visibleChars.map((char) => (
                <Link
                  key={char.slug}
                  href={`/explore/character/${char.slug}`}
                  style={{ textDecoration: "none" }}
                >
                  <div style={{
                    background: "var(--bg-2)", border: "1px solid var(--border)",
                    borderRadius: 3, overflow: "hidden",
                    transition: "border-color 0.12s",
                  }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-dim)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
                  >
                    {/* Thumbnail */}
                    <div style={{ aspectRatio: "3/4", overflow: "hidden", background: "var(--bg-3)", position: "relative" }}>
                      <img
                        src={cfImg(char.thumbnail_url, 200, 70)}
                        alt={char.name}
                        loading="lazy"
                        decoding="async"
                        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                      />
                      {/* Post count badge */}
                      <div style={{
                        position: "absolute", bottom: 6, right: 6,
                        background: "rgba(0,0,0,0.75)", borderRadius: 2,
                        padding: "2px 7px", fontSize: 10, color: "var(--text-2)",
                      }}>
                        {char.post_count} post{char.post_count !== 1 ? "s" : ""}
                      </div>
                    </div>
                    {/* Name */}
                    <div style={{ padding: "8px 10px" }}>
                      <div style={{
                        fontSize: 12, fontWeight: "bold", color: "var(--text)",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {char.name}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Show more / less */}
            {characters.length > 24 && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
                <button
                  onClick={() => setShowAllChars((v) => !v)}
                  style={{
                    padding: "8px 24px",
                    background: "var(--bg-2)", border: "1px solid var(--border-2)",
                    borderRadius: 3, color: "var(--text)", fontSize: 13,
                    fontFamily: "var(--font-sans)", cursor: "pointer",
                  }}
                >
                  {showAllChars
                    ? `Show less`
                    : `Show all ${characters.length} characters`}
                </button>
              </div>
            )}
          </section>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}