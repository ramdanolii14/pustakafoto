"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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

const CDN_HOST = "cdn.pustakafoto.nyanpixel.my.id";

/**
 * Build Cloudflare Image Resizing URL.
 * width: pixel lebar output
 * quality: 1-100
 * format: webp selalu — ukuran paling kecil
 */
function cfImg(url: string, width: number, quality = 70): string {
  try {
    const u = new URL(url);
    if (
      u.hostname === CDN_HOST ||
      u.hostname.endsWith(".r2.dev") ||
      u.hostname.endsWith(".r2.cloudflarestorage.com")
    ) {
      return `${u.origin}/cdn-cgi/image/width=${width},quality=${quality},format=webp${u.pathname}`;
    }
  } catch {}
  return url;
}

// Ukuran per use-case:
// - Grid thumbnail  : 320px  q65  → ~30-80KB per foto
// - Lightbox display: 1440px q75  → ~200-600KB (cukup tajam di semua layar)
// - Preload neighbor: 1440px q75  → di-prefetch sebelum user swipe
const THUMB_W = 320;
const THUMB_Q = 65;
const LB_W    = 1440;
const LB_Q    = 75;

export default function PhotoGrid({ files, pageSize = 30 }: PhotoGridProps) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [lbLoaded, setLbLoaded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const gridRef = useRef<HTMLDivElement>(null);

  // After load more, scroll just a tiny bit to trigger lazy load on newly added images
  const loadMore = useCallback(() => {
    setVisibleCount((c) => {
      const next = c + pageSize;
      // After state update, nudge scroll to trigger browser lazy load
      setTimeout(() => {
        window.dispatchEvent(new Event("scroll"));
      }, 50);
      return next;
    });
  }, [pageSize]);

  const visibleFiles = files.slice(0, visibleCount);
  const hasMore = visibleCount < files.length;
  const remaining = files.length - visibleCount;

  const openLightbox = useCallback((i: number) => {
    setLbLoaded(false);
    setLightbox(i);
  }, []);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  const prev = useCallback(() => {
    setLbLoaded(false);
    setLightbox((i) => (i! > 0 ? i! - 1 : files.length - 1));
  }, [files.length]);

  const next = useCallback(() => {
    setLbLoaded(false);
    setLightbox((i) => (i! < files.length - 1 ? i! + 1 : 0));
  }, [files.length]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft")  prev();
    if (e.key === "ArrowRight") next();
    if (e.key === "Escape")     closeLightbox();
  }, [prev, next, closeLightbox]);

  // Preload prev/next lightbox images while current is showing
  const preloadNeighbors = useCallback((i: number) => {
    if (files.length <= 1) return;
    const PRELOAD = 10;
    const indices: number[] = [];
    for (let d = 1; d <= PRELOAD; d++) {
      indices.push((i - d + files.length) % files.length);
      indices.push((i + d) % files.length);
    }
    [...new Set(indices)].forEach((idx) => {
      const img = new Image();
      img.src = cfImg(files[idx].url, LB_W, LB_Q);
    });
  }, [files]);

  return (
    <>
      {/* ── Grid ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: 4,
      }}>
        {visibleFiles.map((f, i) => (
          <div
            key={`${f.id}-${i}`}
            onClick={() => { openLightbox(i); preloadNeighbors(i); }}
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
              src={cfImg(f.url, THUMB_W, THUMB_Q)}
              alt={f.file_name}
              loading={i < 12 ? "eager" : "lazy"}
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
                transition: "background 0.1s",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.25)";
                const svg = e.currentTarget.querySelector("svg") as SVGElement;
                if (svg) svg.style.opacity = "1";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0)";
                const svg = e.currentTarget.querySelector("svg") as SVGElement;
                if (svg) svg.style.opacity = "0";
              }}
            >
              <ZoomIn size={20} color="white" style={{ opacity: 0, transition: "opacity 0.1s" }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Footer: count + load more ── */}
      <div style={{
        marginTop: 10,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        fontSize: 12, color: "var(--text-3)",
      }}>
        <span>Showing {visibleFiles.length} of {files.length} photos</span>
        <div style={{ display: "flex", gap: 8 }}>
          {hasMore && (
            <button
              onClick={loadMore}
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

      {/* ── Lightbox ── */}
      {lightbox !== null && (
        <div
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          autoFocus
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.96)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            style={{
              position: "absolute", top: 12, right: 12,
              background: "rgba(255,255,255,0.08)", border: "none",
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
                background: "rgba(255,255,255,0.08)", border: "none",
                borderRadius: 3, color: "white", cursor: "pointer", padding: "10px 8px",
              }}
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Image container */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }}
          >
            {/* Blur placeholder (thumbnail) shown while lightbox loads */}
            {!lbLoaded && (
              <img
                src={cfImg(files[lightbox].url, THUMB_W, THUMB_Q)}
                alt=""
                aria-hidden
                style={{
                  position: "absolute", inset: 0,
                  width: "100%", height: "100%",
                  objectFit: "contain",
                  filter: "blur(10px)",
                  transform: "scale(1.04)",
                  pointerEvents: "none",
                }}
              />
            )}

            {/* 
              Compressed 1440px version — NOT the 10MB original.
              Looks sharp on any monitor/phone, loads 10-20x faster.
            */}
            <img
              key={lightbox}
              src={cfImg(files[lightbox].url, LB_W, LB_Q)}
              alt={files[lightbox].file_name}
              onLoad={() => {
                setLbLoaded(true);
                // Start preloading neighbors once current is shown
                preloadNeighbors(lightbox);
              }}
              style={{
                maxWidth: "90vw", maxHeight: "90vh",
                objectFit: "contain", borderRadius: 2,
                display: "block",
                opacity: lbLoaded ? 1 : 0,
                transition: "opacity 0.18s",
              }}
            />
          </div>

          {/* Next */}
          {files.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.08)", border: "none",
                borderRadius: 3, color: "white", cursor: "pointer", padding: "10px 8px",
              }}
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Counter + filename */}
          <div style={{
            position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            pointerEvents: "none",
          }}>
            <div style={{
              color: "rgba(255,255,255,0.45)", fontSize: 12,
              background: "rgba(0,0,0,0.45)", padding: "3px 12px", borderRadius: 20,
            }}>
              {lightbox + 1} / {files.length}
            </div>
            <div style={{
              color: "rgba(255,255,255,0.25)", fontSize: 10,
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