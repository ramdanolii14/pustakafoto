"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, User, Tag, Trash2, Images } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import PhotoGrid from "@/components/post/PhotoGrid";
import VoteBar from "@/components/post/VoteBar";
import CommentSection from "@/components/post/CommentSection";
import DownloadAllButton from "@/components/post/DownloadAllButton";
import { authClient } from "@/lib/auth-client";
import { formatDate } from "@/lib/utils";

export default function PostDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/posts/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setData)
      .catch(() => router.push("/dashboard"))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleDelete = async () => {
    if (!confirm("Delete this post and all its files? This cannot be undone.")) return;
    setDeleting(true);
    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/dashboard");
    } else {
      alert("Failed to delete post.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-3)" }}>
          Loading...
        </div>
      </AppShell>
    );
  }

  if (!data) return null;

  const { post, files, comments } = data;
  const isOwner = session?.user.id === post.user_id;

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

      {/* Banner thumbnail */}
      {post.thumbnail_url && (
        <div style={{
          width: "100%",
          height: 340,
          overflow: "hidden",
          borderRadius: 4,
          marginBottom: 12,
          position: "relative",
          background: "var(--bg-3)",
        }}>
          <img
            src={post.thumbnail_url}
            alt={post.title}
            style={{
              width: "100%", height: "100%",
              objectFit: "cover",
              objectPosition: "top",
              display: "block",
            }}
          />
          {/* Gradient overlay bottom */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.1) 50%, transparent 100%)",
          }} />
          {/* Title overlay on banner */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            padding: "20px 22px",
          }}>
            <h1 style={{
              fontSize: 26, fontWeight: "bold", color: "#fff",
              lineHeight: 1.2, marginBottom: 4,
              textShadow: "0 2px 8px rgba(0,0,0,0.8)",
            }}>
              {post.title}
            </h1>
            <div style={{
              fontSize: 15, color: "var(--accent)",
              fontStyle: "italic",
              textShadow: "0 1px 4px rgba(0,0,0,0.8)",
            }}>
              {post.character_name}
            </div>
          </div>
        </div>
      )}

      {/* Header card */}
      <div style={{
        background: "var(--bg-2)", border: "1px solid var(--border)",
        borderRadius: 3, padding: "14px 18px", marginBottom: 12,
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Show title/character only if no banner */}
            {!post.thumbnail_url && (
              <>
                <h1 style={{ fontSize: 24, fontWeight: "bold", color: "var(--text)", lineHeight: 1.2, marginBottom: 4 }}>
                  {post.title}
                </h1>
                <div style={{ fontSize: 16, color: "var(--accent)", fontStyle: "italic", marginBottom: 10 }}>
                  {post.character_name}
                </div>
              </>
            )}

            {post.description && (
              <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 12 }}>
                {post.description}
              </p>
            )}

            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 14, fontSize: 12, color: "var(--text-3)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <User size={12} /> {post.author?.name || "Unknown"}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Calendar size={12} /> {formatDate(post.created_at)}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Images size={12} /> {post.file_count} file{post.file_count !== 1 ? "s" : ""}
              </span>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                <Tag size={11} color="var(--text-3)" />
                {post.tags.map((t: string) => (
                  <span key={t} style={{
                    fontSize: 11, padding: "2px 8px",
                    border: "1px solid var(--border)", borderRadius: 2,
                    color: "var(--text-3)",
                  }}>
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
            <VoteBar
              postId={post.id}
              initialUpvotes={post.upvotes}
              initialDownvotes={post.downvotes}
              initialVote={post.user_vote}
              isLoggedIn={!!session}
            />
            {files.length > 0 && (
              <DownloadAllButton postId={post.id} fileCount={files.length} />
            )}
            {isOwner && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "7px 12px", background: "transparent",
                  border: "1px solid var(--red)", color: "var(--red)",
                  borderRadius: 3, fontSize: 12, fontFamily: "var(--font-sans)",
                  cursor: deleting ? "wait" : "pointer",
                }}
              >
                <Trash2 size={12} />
                {deleting ? "Deleting..." : "Delete Post"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Photo grid with pagination */}
      {files.length > 0 ? (
        <div style={{
          background: "var(--bg-2)", border: "1px solid var(--border)",
          borderRadius: 3, padding: "14px", marginBottom: 12,
        }}>
          <PhotoGrid files={files} pageSize={25} />
        </div>
      ) : (
        <div style={{
          padding: "30px", textAlign: "center",
          border: "1px solid var(--border)", borderRadius: 3,
          color: "var(--text-3)", fontSize: 13, marginBottom: 12,
          background: "var(--bg-2)",
        }}>
          No photos attached to this post.
        </div>
      )}

      {/* Comments */}
      <div style={{
        background: "var(--bg-2)", border: "1px solid var(--border)",
        borderRadius: 3, padding: "16px 18px",
      }}>
        <CommentSection
          postId={post.id}
          initialComments={comments}
          currentUserId={session?.user.id}
        />
      </div>
    </AppShell>
  );
}
