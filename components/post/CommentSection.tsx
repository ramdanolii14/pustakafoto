"use client";

import { useState } from "react";
import { Send, Trash2, User } from "lucide-react";
import { Comment } from "@/types";
import { formatDate } from "@/lib/utils";

interface CommentSectionProps {
  postId: string;
  initialComments: Comment[];
  currentUserId?: string;
}

export default function CommentSection({
  postId,
  initialComments,
  currentUserId,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, content }),
      });
      if (res.ok) {
        const { comment } = await res.json();
        setComments((prev) => [...prev, comment]);
        setContent("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (id: string) => {
    const res = await fetch(`/api/comments?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <section>
      <h2 style={{ fontSize: 16, fontWeight: "bold", color: "var(--text)", marginBottom: 12, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
        Comments ({comments.length})
      </h2>

      {/* Comment list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {comments.length === 0 && (
          <p style={{ color: "var(--text-3)", fontSize: 13, padding: "12px 0" }}>
            No comments yet. Be the first.
          </p>
        )}
        {comments.map((c, i) => (
          <div key={c.id} style={{
            padding: "10px 0",
            borderBottom: i < comments.length - 1 ? "1px solid var(--border)" : "none",
            display: "flex",
            gap: 10,
          }}>
            {/* Avatar */}
            <div style={{ flexShrink: 0 }}>
              {(c.author as any)?.image ? (
                <img
                  src={(c.author as any).image}
                  alt={(c.author as any).name}
                  style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "var(--bg-3)", border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <User size={13} color="var(--text-3)" />
                </div>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 13, fontWeight: "bold", color: "var(--text)" }}>
                  {(c.author as any)?.name || "Anonymous"}
                </span>
                <span style={{ fontSize: 11, color: "var(--text-3)" }}>
                  {formatDate(c.created_at)}
                </span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>
                {c.content}
              </p>
            </div>

            {currentUserId && c.user_id === currentUserId && (
              <button
                onClick={() => deleteComment(c.id)}
                style={{
                  flexShrink: 0,
                  background: "transparent",
                  border: "none",
                  color: "var(--text-3)",
                  cursor: "pointer",
                  padding: 4,
                }}
                title="Delete comment"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      {currentUserId ? (
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment..."
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) submit();
            }}
            style={{
              flex: 1,
              padding: "8px 10px",
              borderRadius: 3,
              resize: "vertical",
              minHeight: 56,
              fontSize: 13,
            }}
          />
          <button
            onClick={submit}
            disabled={submitting || !content.trim()}
            style={{
              padding: "8px 14px",
              background: submitting || !content.trim() ? "var(--bg-3)" : "var(--accent)",
              color: submitting || !content.trim() ? "var(--text-3)" : "#000",
              border: "none",
              borderRadius: 3,
              fontSize: 13,
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: 5,
              alignSelf: "flex-end",
            }}
          >
            <Send size={13} />
            {submitting ? "..." : "Send"}
          </button>
        </div>
      ) : (
        <p style={{ marginTop: 10, fontSize: 13, color: "var(--text-3)" }}>
          <a href="/auth/login">Sign in</a> to leave a comment.
        </p>
      )}
    </section>
  );
}
