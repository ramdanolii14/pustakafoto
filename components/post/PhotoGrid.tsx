"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ChevronDown } from "lucide-react";

interface PhotoFile {
  id: string;
  url: string;
  file_name: string;
}

interface PhotoGridProps {
  files: PhotoFile[];
  pageSize?: number;
}

export default function PhotoGrid({ files, pageSize = 25 }: PhotoGridProps) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(pageSize);

  const visibleFiles = files.slice(0, visibleCount);
  const hasMore = visibleCount < files.length;
  const remaining = files.length - visibleCount;

  const openLightbox = (i: number) => setLightbox(i);
  const closeLightbox = () => setLightbox(null);
  // lightbox navigates over ALL files, not just visible
  const prev = () => setLightbox((i) => (i! > 0 ? i! - 1 : files.length - 1));
  const next = () => setLightbox((i) => (i! < files.length - 1 ? i! + 1 : 0));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
    if (e.key === "Escape") closeLightbox();
  };

  return (
    <>
      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: 6,
      }}>
        {visibleFiles.map((f, i) => (
          <div
            key={f.id}
            onClick={() => openLightbox(i)}
            style={{
              aspectRatio: "3/4",
              overflow: "hidden",
              borderRadius: 2,
              background: "var(--bg-3)",
              cursor: "zoom-in",
              position: "relative",
              border: "1px solid var(--border)",
            }}
          >
            <img
              src={f.url}
              alt={f.file_name}
              loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            <div
              style={{
                position: "absolute", inset: 0,
                background: "rgba(0,0,0,0)",
                transition: "background 0.15s",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.3)";
                const icon = e.currentTarget.querySelector("svg") as SVGElement;
                if (icon) icon.style.opacity = "1";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0)";
                const icon = e.currentTarget.querySelector("svg") as SVGElement;
                if (icon) icon.style.opacity = "0";
              }}
            >
              <ZoomIn size={24} color="white" style={{ opacity: 0, transition: "opacity 0.15s" }} />
            </div>

            {/* Page number badge tiap 25 */}
            {i === 0 && visibleCount > pageSize && (
              <div style={{
                position: "absolute", top: 4, left: 4,
                background: "rgba(0,0,0,0.65)", color: "rgba(255,255,255,0.6)",
                fontSize: 9, padding: "1px 5px", borderRadius: 2,
              }}>
                {Math.ceil(visibleCount / pageSize) > 1 ? `1–${visibleCount}` : ""}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load more / show count */}
      <div style={{
        marginTop: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: 12,
        color: "var(--text-3)",
      }}>
        <span>
          Showing {visibleFiles.length} of {files.length} photos
        </span>
        {hasMore && (
          <button
            onClick={() => setVisibleCount((c) => c + pageSize)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "6px 14px",
              background: "var(--bg-2)",
              border: "1px solid var(--border-2)",
              borderRadius: 3,
              color: "var(--text)",
              fontSize: 12,
              fontFamily: "var(--font-sans)",
              cursor: "pointer",
            }}
          >
            <ChevronDown size={13} />
            Load {Math.min(remaining, pageSize)} more
          </button>
        )}
        {!hasMore && files.length > pageSize && (
          <button
            onClick={() => setVisibleCount(pageSize)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "6px 14px",
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: 3,
              color: "var(--text-3)",
              fontSize: 12,
              fontFamily: "var(--font-sans)",
              cursor: "pointer",
            }}
          >
            Collapse
          </button>
        )}
      </div>

      {/* Lightbox — navigates over ALL files */}
      {lightbox !== null && (
        <div
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.93)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <button
            onClick={closeLightbox}
            style={{
              position: "absolute", top: 12, right: 12,
              background: "rgba(255,255,255,0.1)", border: "none",
              borderRadius: 3, color: "white", cursor: "pointer", padding: 8,
            }}
          >
            <X size={20} />
          </button>

          {files.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              style={{
                position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 3,
                color: "white", cursor: "pointer", padding: "10px 8px",
              }}
            >
              <ChevronLeft size={24} />
            </button>
          )}

          <img
            src={files[lightbox].url}
            alt={files[lightbox].file_name}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90vw", maxHeight: "90vh",
              objectFit: "contain", borderRadius: 2,
              boxShadow: "0 0 60px rgba(0,0,0,0.8)",
            }}
          />

          {files.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 3,
                color: "white", cursor: "pointer", padding: "10px 8px",
              }}
            >
              <ChevronRight size={24} />
            </button>
          )}

          <div style={{
            position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
            color: "rgba(255,255,255,0.5)", fontSize: 13,
            background: "rgba(0,0,0,0.5)", padding: "3px 10px", borderRadius: 20,
          }}>
            {lightbox + 1} / {files.length}
          </div>
        </div>
      )}
    </>
  );
}
