"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Loader, TrendingUp, Clock, LayoutGrid } from "lucide-react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import PostCard from "@/components/post/PostCard";
import { Post } from "@/types";

type SortMode = "recent" | "top";

interface ExploreClientProps {
  type: "tag" | "character";
  slug: string;
  displayName: string;
  icon: React.ReactNode;
}

export default function ExploreClient({ type, slug, displayName, icon }: ExploreClientProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortMode>("recent");
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  const fetchPosts = useCallback(async (s: SortMode, p: number, append = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type, slug, sort: s, page: String(p) });
      const res = await fetch(`/api/explore?${params}`);
      const data = await res.json();
      setPosts((prev) => append ? [...prev, ...(data.posts || [])] : (data.posts || []));
      setTotal(data.total || 0);
      setHasMore(p * (data.per_page || 24) < (data.total || 0));
    } finally {
      setLoading(false);
    }
  }, [type, slug]);

  useEffect(() => {
    fetchPosts(sort, 1, false);
  }, [fetchPosts, sort]);

  const handleSort = (s: SortMode) => {
    setSort(s);
    setPage(1);
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPosts(sort, next, true);
  };

  const SORT_OPTS: { value: SortMode; label: string; icon: React.ReactNode }[] = [
    { value: "recent", label: "Recent",     icon: <Clock size={12} /> },
    { value: "top",    label: "Most Liked", icon: <TrendingUp size={12} /> },
  ];

  return (
    <AppShell>
      {/* Back */}
      <button
        onClick={() => router.back()}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "transparent", border: "none",
          color: "var(--text-3)", fontSize: 13, cursor: "pointer",
          marginBottom: 14, padding: 0, fontFamily: "var(--font-sans)",
        }}
      >
        <ArrowLeft size={14} /> Back
      </button>

      {/* Header */}
      <div style={{
        background: "var(--bg-2)", border: "1px solid var(--border)",
        borderRadius: 3, padding: "16px 18px", marginBottom: 14,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 3,
            background: "var(--bg-3)", border: "1px solid var(--border-2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--accent)",
          }}>
            {icon}
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
              {type === "tag" ? "Tag" : "Character"}
            </div>
            <h1 style={{ fontSize: 20, fontWeight: "bold", color: "var(--text)", lineHeight: 1 }}>
              {displayName}
            </h1>
          </div>
        </div>

        <div style={{ fontSize: 12, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 5 }}>
          <LayoutGrid size={12} />
          {loading && posts.length === 0 ? "Loading..." : `${total.toLocaleString()} post${total !== 1 ? "s" : ""}`}
        </div>
      </div>

      {/* Sort bar */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {SORT_OPTS.map((opt) => {
          const active = sort === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => handleSort(opt.value)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "6px 14px", borderRadius: 3,
                border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                background: active ? "var(--accent)" : "transparent",
                color: active ? "#000" : "var(--text-2)",
                fontSize: 12, fontWeight: active ? "bold" : "normal",
                fontFamily: "var(--font-sans)", cursor: "pointer",
                transition: "all 0.12s",
              }}
            >
              {opt.icon} {opt.label}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {posts.length === 0 && !loading ? (
        <div style={{
          padding: "60px 0", textAlign: "center",
          color: "var(--text-3)", fontSize: 14,
          border: "1px solid var(--border)", borderRadius: 3,
          background: "var(--bg-2)",
        }}>
          No posts found for "{displayName}".
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 10,
        }}>
          {posts.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
          <button
            onClick={loadMore}
            disabled={loading}
            style={{
              padding: "9px 28px", background: "var(--bg-2)",
              border: "1px solid var(--border-2)", borderRadius: 3,
              color: loading ? "var(--text-3)" : "var(--text)",
              fontSize: 13, fontFamily: "var(--font-sans)",
              cursor: loading ? "wait" : "pointer",
              display: "flex", alignItems: "center", gap: 7,
            }}
          >
            {loading && <Loader size={13} style={{ animation: "spin 1s linear infinite" }} />}
            Load more
          </button>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AppShell>
  );
}