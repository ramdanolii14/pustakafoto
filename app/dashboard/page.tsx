"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, Loader, LayoutGrid } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import PostCard from "@/components/post/PostCard";
import TagFilter from "@/components/dashboard/TagFilter";
import { Post } from "@/types";

export default function DashboardPage() {
  const [query, setQuery] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPosts = useCallback(async (q: string, t: string[], p: number, append = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (t.length > 0) params.set("tags", t.join(","));
      params.set("page", String(p));

      const res = await fetch(`/api/posts?${params}`);
      const data = await res.json();

      setPosts((prev) => append ? [...prev, ...data.posts] : data.posts);
      setTotal(data.total || 0);
      setHasMore(p * data.per_page < (data.total || 0));
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPosts("", [], 1, false);
  }, [fetchPosts]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchPosts(query, tags, 1, false);
    }, 320);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, tags, fetchPosts]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPosts(query, tags, next, true);
  };

  return (
    <AppShell>
      {/* Search + Filter bar */}
      <div style={{
        background: "var(--bg-2)",
        border: "1px solid var(--border)",
        borderRadius: 3,
        padding: "10px 14px",
        marginBottom: 14,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}>
        {/* Search input */}
        <div style={{ position: "relative" }}>
          <Search
            size={15}
            color="var(--text-3)"
            style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            placeholder="Search by title, character, description..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px 9px 34px",
              borderRadius: 3,
              fontSize: 15,
            }}
          />
        </div>

        {/* Tag filters */}
        <TagFilter selected={tags} onChange={(t) => { setTags(t); setPage(1); }} />
      </div>

      {/* Result count */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 10, color: "var(--text-3)", fontSize: 12,
      }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <LayoutGrid size={12} />
          {loading && posts.length === 0 ? "Loading..." : `${total.toLocaleString()} post${total !== 1 ? "s" : ""}`}
          {(query || tags.length > 0) && " found"}
        </span>
        {loading && posts.length > 0 && (
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Loader size={11} style={{ animation: "spin 1s linear infinite" }} />
            Updating...
          </span>
        )}
      </div>

      {/* Grid */}
      {posts.length === 0 && !loading ? (
        <div style={{
          padding: "60px 0", textAlign: "center",
          color: "var(--text-3)", fontSize: 14,
        }}>
          {query || tags.length > 0
            ? "No posts match your search."
            : "No posts yet. Be the first to upload."}
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 10,
        }}>
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
          <button
            onClick={loadMore}
            disabled={loading}
            style={{
              padding: "9px 28px",
              background: "var(--bg-2)",
              border: "1px solid var(--border-2)",
              borderRadius: 3,
              color: loading ? "var(--text-3)" : "var(--text)",
              fontSize: 13,
              fontFamily: "var(--font-serif)",
              cursor: loading ? "wait" : "pointer",
              display: "flex", alignItems: "center", gap: 7,
            }}
          >
            {loading ? <Loader size={13} style={{ animation: "spin 1s linear infinite" }} /> : null}
            Load more
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </AppShell>
  );
}
