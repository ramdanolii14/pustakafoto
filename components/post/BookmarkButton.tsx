"use client";

import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";

interface BookmarkButtonProps {
  postId: string;
  isLoggedIn: boolean;
  initialBookmarked?: boolean;
  size?: "sm" | "md";
}

export default function BookmarkButton({
  postId,
  isLoggedIn,
  initialBookmarked = false,
  size = "md",
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(!!initialBookmarked);

  // Fetch real bookmark status on mount
  useEffect(() => {
    if (!isLoggedIn || checked) return;
    fetch(`/api/bookmarks?post_id=${postId}`)
      .then((r) => r.json())
      .then((d) => {
        setBookmarked(d.bookmarked || false);
        setChecked(true);
      })
      .catch(() => setChecked(true));
  }, [postId, isLoggedIn, checked]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn || loading) return;

    setLoading(true);
    const prev = bookmarked;
    setBookmarked(!prev); // optimistic

    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId }),
      });
      const data = await res.json();
      setBookmarked(data.bookmarked);
    } catch {
      setBookmarked(prev); // revert
    } finally {
      setLoading(false);
    }
  };

  const iconSize = size === "sm" ? 13 : 15;
  const pad = size === "sm" ? "3px 7px" : "7px 12px";
  const fs = size === "sm" ? 11 : 12;

  if (!isLoggedIn) return null;

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={bookmarked ? "Remove bookmark" : "Bookmark this post"}
      style={{
        display: "flex", alignItems: "center", gap: 5,
        padding: pad,
        background: bookmarked ? "rgba(192,160,96,0.12)" : "transparent",
        border: `1px solid ${bookmarked ? "var(--accent)" : "var(--border)"}`,
        borderRadius: 3,
        color: bookmarked ? "var(--accent)" : "var(--text-3)",
        fontSize: fs,
        fontFamily: "var(--font-sans)",
        cursor: loading ? "wait" : "pointer",
        transition: "all 0.15s",
        flexShrink: 0,
      }}
    >
      <Bookmark
        size={iconSize}
        fill={bookmarked ? "var(--accent)" : "none"}
        style={{ transition: "fill 0.15s" }}
      />
      {size === "md" && (bookmarked ? "Saved" : "Save")}
    </button>
  );
}