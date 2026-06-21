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

/**
 * Build a Cloudflare Image Resizing URL for grid thumbnails.
 * Falls back to original URL if domain doesn't match.
 * Requires: Cloudflare Dashboard → Speed → Optimization → Image Resizing → ON
 */
function getThumbUrl(url: string, width: number): string {
  try {
    const parsed = new URL(url);
    // Only apply to our CDN domain
    if (
      parsed.hostname === "cdn.pustakafoto.nyanpixel.my.id" ||
      parsed.hostname.endsWith(".r2.dev") ||
      parsed.hostname.endsWith(".r2.cloudflarestorage.com")
    ) {
      return `${parsed.origin}/cdn-cgi/image/width=${width},quality=72,format=webp${parsed.pathname}`;
    }
  } catch {
    // ignore parse errors
  }
  return url;
}

export default function PhotoGrid({ files, pageSize = 12 }: PhotoGridProps) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [lightboxLoaded, setLightboxLoaded] = useState(false);

  const visibleFiles = files.slice(0, visibleCount);
  const hasMore = visibleCount < files.length;
  const remaining = files.length - visibleCount;

  const openLightbox = (i: number) => {
    setLightboxLoaded(false);
    setLightbox(i);
  };
  const closeLightbox = () => setLightbox(null);
  const prev = () => {
    setLightboxLoaded(false);
    setLightbox((i) => (i! > 0 ? i! - 1 : files.length - 1));
  };
  const next = () => {
    setLightboxLoaded(false);
    setLightbox((i) => (i! < files.length - 1 ? i! + 1 : 0));
  };

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
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        gap: 5,
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
            {/* Compressed thumbnail for grid — much smaller file size */}
            <img
              src={getThumbUrl(f.url, 400)}
              alt={f.file_name}
              loading="lazy"
              decoding="async"
              style={{
                width: "100%", height: "100%",
                objectFit: "cover", display: "block",
              }}
            />
            <div
              style={{
                position: "absolute", inset: 0,
                background: "rgba(0,0,0,0)",
                transition: "background 0.12s",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.28)";
                const icon = e.currentTarget.querySelector("svg") as SVGElement;
                if (icon) icon.style.opacity = "1";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0)";
                const icon = e.currentTarget.querySelector("svg") as SVGElement;
                if (icon) icon.style.opacity = "0";
              }}
            >
              <ZoomIn size={22} color="white" style={{ opacity: 0, transition: "opacity 0.12s" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Footer: count + load more */}
      <div style={{
        marginTop: 10,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        fontSize: 12, color: "var(--text-3)",
      }}>
        <span>
          Showing {visibleFiles.length} of {files.length} photos
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          {hasMore && (
            <button
              onClick={() => setVisibleCount((c) => c + pageSize)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "5px 12px",
                background: "var(--bg-3)",
                border: "1px solid var(--border-2)",
                borderRadius: 3, color: "var(--text)",
                fontSize: 12, fontFamily: "var(--font-sans)", cursor: "pointer",
              }}
            >
              <ChevronDown size={12} />
              Load {Math.min(remaining, pageSize)} more
            </button>
          )}
          {!hasMore && files.length > pageSize && (
            <button
              onClick={() => setVisibleCount(pageSize)}
              style={{
                padding: "5px 12px", background: "transparent",
                border: "1px solid var(--border)", borderRadius: 3,
                color: "var(--text-3)", fontSize: 12,
                fontFamily: "var(--font-sans)", cursor: "pointer",
              }}
            >
              Collapse
            </button>
          )}
        </div>
      </div>

      {/* Lightbox — uses ORIGINAL full-res URL, not compressed */}
      {lightbox !== null && (
        <div
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          autoFocus
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.95)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {/* Close */}
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

          {/* Prev */}
          {files.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              style={{
                position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.1)", border: "none",
                borderRadius: 3, color: "white", cursor: "pointer", padding: "10px 8px",
              }}
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Image — show medium preview while full-res loads */}
          <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }}>
            {/* Blurry placeholder while loading */}
            {!lightboxLoaded && (
              <img
                src={getThumbUrl(files[lightbox].url, 400)}
                alt=""
                style={{
                  position: "absolute", inset: 0,
                  width: "100%", height: "100%",
                  objectFit: "contain",
                  filter: "blur(8px)",
                  transform: "scale(1.05)",
                }}
              />
            )}
            {/* Full resolution */}
            <img
              key={lightbox}
              src={files[lightbox].url}
              alt={files[lightbox].file_name}
              onClick={(e) => e.stopPropagation()}
              onLoad={() => setLightboxLoaded(true)}
              style={{
                maxWidth: "90vw", maxHeight: "90vh",
                objectFit: "contain", borderRadius: 2,
                display: "block",
                opacity: lightboxLoaded ? 1 : 0,
                transition: "opacity 0.2s",
              }}
            />
          </div>

          {/* Next */}
          {files.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.1)", border: "none",
                borderRadius: 3, color: "white", cursor: "pointer", padding: "10px 8px",
              }}
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Counter + filename */}
          <div style={{
            position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          }}>
            <div style={{
              color: "rgba(255,255,255,0.5)", fontSize: 12,
              background: "rgba(0,0,0,0.5)", padding: "3px 12px", borderRadius: 20,
            }}>
              {lightbox + 1} / {files.length}
            </div>
            <div style={{
              color: "rgba(255,255,255,0.3)", fontSize: 10,
              maxWidth: "60vw", overflow: "hidden",
              textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {files[lightbox].file_name}
            </div>
          </div>
        </div>
      )}
    </>
  );
}