"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface PhotoFile {
  id: string;
  url: string;
  file_name: string;
}

interface PhotoGridProps {
  files: PhotoFile[];
}

export default function PhotoGrid({ files }: PhotoGridProps) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const openLightbox = (i: number) => setLightbox(i);
  const closeLightbox = () => setLightbox(null);
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
        {files.map((f, i) => (
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
            <div style={{
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
          </div>
        ))}
      </div>

      {/* Lightbox */}
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
          {/* Close */}
          <button
            onClick={closeLightbox}
            style={{
              position: "absolute", top: 12, right: 12,
              background: "rgba(255,255,255,0.1)",
              border: "none", borderRadius: 3,
              color: "white", cursor: "pointer",
              padding: 8,
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
                background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 3,
                color: "white", cursor: "pointer", padding: "10px 8px",
              }}
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Image */}
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

          {/* Next */}
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

          {/* Counter */}
          <div style={{
            position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
            color: "rgba(255,255,255,0.5)", fontSize: 13,
          }}>
            {lightbox + 1} / {files.length}
          </div>
        </div>
      )}
    </>
  );
}
