"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface VoteBarProps {
  postId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  initialVote: "up" | "down" | null;
  isLoggedIn: boolean;
}

export default function VoteBar({
  postId,
  initialUpvotes,
  initialDownvotes,
  initialVote,
  isLoggedIn,
}: VoteBarProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(initialVote);
  const [loading, setLoading] = useState(false);

  const vote = async (type: "up" | "down") => {
    if (!isLoggedIn || loading) return;
    setLoading(true);

    // Optimistic update
    const prev = userVote;
    let newUp = upvotes;
    let newDown = downvotes;

    if (prev === type) {
      // toggle off
      if (type === "up") newUp--;
      else newDown--;
      setUserVote(null);
    } else {
      if (prev === "up") newUp--;
      if (prev === "down") newDown--;
      if (type === "up") newUp++;
      else newDown++;
      setUserVote(type);
    }
    setUpvotes(newUp);
    setDownvotes(newDown);

    try {
      await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, vote_type: type }),
      });
    } catch {
      // revert
      setUpvotes(upvotes);
      setDownvotes(downvotes);
      setUserVote(prev);
    }
    setLoading(false);
  };

  const btnStyle = (active: boolean, color: string) => ({
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 16px",
    border: `1px solid ${active ? color : "var(--border)"}`,
    borderRadius: 3,
    background: active ? color + "22" : "var(--bg-2)",
    color: active ? color : "var(--text-2)",
    fontSize: 14,
    fontFamily: "var(--font-sans)",
    cursor: isLoggedIn ? "pointer" : "default",
    transition: "all 0.12s",
    opacity: loading ? 0.6 : 1,
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button onClick={() => vote("up")} style={btnStyle(userVote === "up", "#44aa66")} title={isLoggedIn ? "Upvote" : "Sign in to vote"}>
        <ThumbsUp size={15} />
        <span>{upvotes}</span>
      </button>
      <button onClick={() => vote("down")} style={btnStyle(userVote === "down", "#cc4444")} title={isLoggedIn ? "Downvote" : "Sign in to vote"}>
        <ThumbsDown size={15} />
        <span>{downvotes}</span>
      </button>
    </div>
  );
}