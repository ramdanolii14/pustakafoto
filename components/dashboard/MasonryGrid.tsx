"use client";

import { Post } from "@/types";
import PostCard from "@/components/post/PostCard";

interface MasonryGridProps {
  posts: Post[];
}

// Masonry via CSS columns — performant, no JS layout calculation needed.
// Cards keep their natural aspect ratio (no forced 3/4 crop).
export default function MasonryGrid({ posts }: MasonryGridProps) {
  return (
    <div
      style={{
        columnCount: 2,
        columnGap: 10,
      }}
      className="masonry-container"
    >
      {posts.map((p) => (
        <div
          key={p.id}
          style={{
            breakInside: "avoid",
            marginBottom: 10,
            display: "inline-block",
            width: "100%",
          }}
        >
          <PostCard post={p} masonry />
        </div>
      ))}

      <style>{`
        .masonry-container {
          column-count: 2;
        }
        @media (min-width: 480px) {
          .masonry-container { column-count: 2; }
        }
        @media (min-width: 700px) {
          .masonry-container { column-count: 3; }
        }
        @media (min-width: 960px) {
          .masonry-container { column-count: 4; }
        }
        @media (min-width: 1280px) {
          .masonry-container { column-count: 5; }
        }
      `}</style>
    </div>
  );
}