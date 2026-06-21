"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { User, Calendar, Images, ThumbsUp, ThumbsDown, ArrowLeft } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import PostCard from "@/components/post/PostCard";
import { authClient } from "@/lib/auth-client";
import { formatDate } from "@/lib/utils";
import { Post } from "@/types";

interface ProfileData {
  user: {
    id: string;
    name: string;
    image?: string;
    role: string;
    createdAt: string;
  };
  posts: Post[];
  total: number;
  page: number;
  per_page: number;
  stats: {
    total_upvotes: number;
    total_downvotes: number;
    total_files: number;
  };
}

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchProfile = async (p: number, append = false) => {
    if (p === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await fetch(`/api/profile/${id}?page=${p}`);
      if (!res.ok) throw new Error();
      const d: ProfileData = await res.json();
      setData(d);
      setAllPosts((prev) => append ? [...prev, ...d.posts] : d.posts);
      setHasMore(p * d.per_page < d.total);
    } catch {
      router.push("/dashboard");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (id) fetchProfile(1);
  }, [id]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchProfile(next, true);
  };

  if (loading) {
    return (
      <AppShell>
        <div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-3)" }}>Loading...</div>
      </AppShell>
    );
  }

  if (!data) return null;

  const { user, stats, total } = data;
  const isOwnProfile = session?.user.id === id;

  return (
    <AppShell>
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

      {/* Profile header */}
      <div style={{
        background: "var(--bg-2)", border: "1px solid var(--border)",
        borderRadius: 3, padding: "20px 22px", marginBottom: 14,
        display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap",
      }}>
        {/* Avatar */}
        <div style={{
          width: 72, height: 72, borderRadius: "50%", flexShrink: 0,
          background: "var(--bg-3)", border: "2px solid var(--border-2)",
          overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {user.image ? (
            <img src={user.image} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <User size={32} color="var(--text-3)" />
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <h1 style={{ fontSize: 20, fontWeight: "bold", color: "var(--text)" }}>
              {user.name}
            </h1>
            {user.role === "admin" && (
              <span style={{
                fontSize: 10, fontWeight: "bold", padding: "2px 7px",
                background: "var(--accent)", color: "#000", borderRadius: 2,
              }}>
                ADMIN
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 4, marginBottom: 12 }}>
            <Calendar size={11} /> Joined {formatDate(user.createdAt)}
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {[
              { icon: <Images size={13} />, label: "Posts", value: total },
              { icon: <Images size={13} />, label: "Photos", value: stats.total_files },
              { icon: <ThumbsUp size={13} />, label: "Upvotes", value: stats.total_upvotes },
              { icon: <ThumbsDown size={13} />, label: "Downvotes", value: stats.total_downvotes },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: "bold", color: "var(--text)" }}>
                  {s.value.toLocaleString()}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                  {s.icon} {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {isOwnProfile && (
          <div style={{ fontSize: 12, color: "var(--text-3)", alignSelf: "flex-start" }}>
            This is your profile
          </div>
        )}
      </div>

      {/* Posts section */}
      <div style={{ marginBottom: 10, fontSize: 13, fontWeight: "bold", color: "var(--text-2)" }}>
        {total} post{total !== 1 ? "s" : ""}
      </div>

      {allPosts.length === 0 ? (
        <div style={{
          padding: "50px 0", textAlign: "center",
          color: "var(--text-3)", fontSize: 14,
          border: "1px solid var(--border)", borderRadius: 3,
          background: "var(--bg-2)",
        }}>
          No posts yet.
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 10,
        }}>
          {allPosts.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      )}

      {hasMore && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
          <button
            onClick={loadMore}
            disabled={loadingMore}
            style={{
              padding: "9px 28px", background: "var(--bg-2)",
              border: "1px solid var(--border-2)", borderRadius: 3,
              color: loadingMore ? "var(--text-3)" : "var(--text)",
              fontSize: 13, fontFamily: "var(--font-sans)", cursor: loadingMore ? "wait" : "pointer",
            }}
          >
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </AppShell>
  );
}