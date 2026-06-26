"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, Loader, LayoutGrid, Clock, Shuffle, TrendingUp } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import PostCard from "@/components/post/PostCard";
import TagFilter from "@/components/dashboard/TagFilter";
import { Post } from "@/types";

type SortMode = "recent" | "random" | "top";

const SORT_OPTIONS: { value: SortMode; label: string; icon: React.ReactNode }[] = [
  { value: "recent", label: "Recent",    icon: <Clock size={13} /> },
  { value: "top",    label: "Most Liked", icon: <TrendingUp size={13} /> },
  { value: "random", label: "Random",    icon: <Shuffle size={13} /> },
];

export default function DashboardClient() {
  const [query, setQuery]   = useState("");
  const [tags, setTags]     = useState<string[]>([]);
  const [sort, setSort]     = useState<SortMode>("random");
  const [posts, setPosts]   = useState<Post[]>([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPosts = useCallback(async (
    q: string, t: string[], s: SortMode, p: number, append = false
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (t.length > 0) params.set("tags", t.join(","));
      params.set("sort", s);
      params.set("page", String(p));

      const res = await fetch(`/api/posts?${params}`);
      const data = await res.json();

      setPosts((prev) => append ? [...prev, ...(data.posts || [])] : (data.posts || []));
      setTotal(data.total || 0);
      setHasMore(p * (data.per_page || 24) < (data.total || 0));
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPosts("", [], "random", 1, false);
  }, [fetchPosts]);

  // Debounced search + tag + sort changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchPosts(query, tags, sort, 1, false);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, tags, sort, fetchPosts]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPosts(query, tags, sort, next, true);
  };

  const handleSort = (s: SortMode) => {
    setSort(s);
    setPage(1);
  };

  return (
    <AppShell>
      {/* Search + Tags */}
      <div style={{
        background: "var(--bg-2)", border: "1px solid var(--border)",
        borderRadius: 3, padding: "10px 14px", marginBottom: 10,
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        <div style={{ position: "relative" }}>
          <Search size={15} color="var(--text-3)"
            style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search by title, character, description..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: "100%", padding: "9px 12px 9px 34px", borderRadius: 3, fontSize: 15 }}
          />
        </div>
        <TagFilter selected={tags} onChange={(t) => { setTags(t); setPage(1); }} />
      </div>

      {/* Sort bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        marginBottom: 12, flexWrap: "wrap",
      }}>
        {SORT_OPTIONS.map((opt) => {
          const active = sort === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => handleSort(opt.value)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "6px 14px",
                borderRadius: 3,
                border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                background: active ? "var(--accent)" : "transparent",
                color: active ? "#000" : "var(--text-2)",
                fontSize: 12,
                fontWeight: active ? "bold" : "normal",
                fontFamily: "var(--font-sans)",
                cursor: "pointer",
                transition: "all 0.12s",
              }}
            >
              {opt.icon}
              {opt.label}
            </button>
          );
        })}

        {/* Count on the right */}
        <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 5 }}>
          {loading && posts.length > 0 ? (
            <><Loader size={11} style={{ animation: "spin 1s linear infinite" }} /> Updating...</>
          ) : (
            <><LayoutGrid size={11} />
            {loading && posts.length === 0 ? "Loading..." : `${total.toLocaleString()} post${total !== 1 ? "s" : ""}${(query || tags.length > 0) ? " found" : ""}`}</>
          )}
        </div>
      </div>

      {/* Grid */}
      {posts.length === 0 && !loading ? (
        <div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-3)", fontSize: 14 }}>
          {query || tags.length > 0 ? "No posts match your search." : "No posts yet. Be the first to upload."}
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
      {hasMore && sort !== "random" && (
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

      {/* Random: reshuffle button instead of load more */}
      {sort === "random" && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
          <button
            onClick={() => fetchPosts(query, tags, "random", 1, false)}
            disabled={loading}
            style={{
              padding: "9px 22px", background: "var(--bg-2)",
              border: "1px solid var(--border-2)", borderRadius: 3,
              color: loading ? "var(--text-3)" : "var(--text)",
              fontSize: 13, fontFamily: "var(--font-sans)",
              cursor: loading ? "wait" : "pointer",
              display: "flex", alignItems: "center", gap: 7,
            }}
          >
            <Shuffle size={13} />
            Shuffle again
          </button>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AppShell>
  );
}