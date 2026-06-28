"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Loader, LayoutGrid } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import PostCard from "@/components/post/PostCard";
import { authClient } from "@/lib/auth-client";
import { Post } from "@/types";

export default function BookmarksPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (!isPending && !session) router.push("/auth/login");
  }, [session, isPending, router]);

  const fetchBookmarks = async (p: number, append = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookmarks?page=${p}`);
      const data = await res.json();
      const newPosts = (data.bookmarks || [])
        .map((b: any) => b.post)
        .filter(Boolean);
      setPosts((prev) => append ? [...prev, ...newPosts] : newPosts);
      setTotal(data.total || 0);
      setHasMore(p * (data.per_page || 24) < (data.total || 0));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchBookmarks(1);
  }, [session]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchBookmarks(next, true);
  };

  if (isPending) return (
    <AppShell>
      <div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-3)" }}>Loading...</div>
    </AppShell>
  );

  return (
    <AppShell>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        marginBottom: 16,
      }}>
        <Bookmark size={20} color="var(--accent)" />
        <h1 style={{ fontSize: 20, fontWeight: "bold", color: "var(--text)" }}>
          Saved Posts
        </h1>
        {!loading && (
          <span style={{ fontSize: 13, color: "var(--text-3)", marginLeft: 4 }}>
            ({total})
          </span>
        )}
      </div>

      {loading && posts.length === 0 ? (
        <div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-3)" }}>
          <Loader size={20} style={{ animation: "spin 1s linear infinite", margin: "0 auto 8px" }} />
          Loading...
        </div>
      ) : posts.length === 0 ? (
        <div style={{
          padding: "60px 24px", textAlign: "center",
          border: "1px solid var(--border)", borderRadius: 3,
          background: "var(--bg-2)",
        }}>
          <Bookmark size={36} color="var(--text-3)" style={{ margin: "0 auto 12px" }} />
          <p style={{ fontSize: 15, color: "var(--text-2)", marginBottom: 6 }}>
            No saved posts yet
          </p>
          <p style={{ fontSize: 13, color: "var(--text-3)" }}>
            Click the bookmark icon on any post to save it here.
          </p>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}>
            <LayoutGrid size={11} />
            {total.toLocaleString()} saved post{total !== 1 ? "s" : ""}
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 10,
          }}>
            {posts.map((p) => <PostCard key={p.id} post={p} />)}
          </div>

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
        </>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AppShell>
  );
}