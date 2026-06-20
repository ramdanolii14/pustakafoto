"use client";

import { useState } from "react";
import { Download, Loader } from "lucide-react";

interface DownloadAllButtonProps {
  postId: string;
  fileCount: number;
}

export default function DownloadAllButton({ postId, fileCount }: DownloadAllButtonProps) {
  const [status, setStatus] = useState<"idle" | "fetching" | "downloading">("idle");

  const handleDownload = async () => {
    if (status !== "idle") return;
    setStatus("fetching");

    try {
      const res = await fetch(`/api/r2?post_id=${postId}`);
      const { files } = await res.json();

      setStatus("downloading");

      // Download satu per satu via fetch → blob → object URL
      // Ini cara yang benar untuk cross-origin download
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        try {
          const response = await fetch(f.url);
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = f.file_name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Revoke setelah sedikit delay
          setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

          // Stagger antar file supaya tidak numpuk
          if (i < files.length - 1) {
            await new Promise((r) => setTimeout(r, 500));
          }
        } catch (err) {
          console.error(`Failed to download ${f.file_name}:`, err);
        }
      }
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setStatus("idle");
    }
  };

  const label = {
    idle: `Download All (${fileCount})`,
    fetching: "Preparing...",
    downloading: "Downloading...",
  }[status];

  return (
    <button
      onClick={handleDownload}
      disabled={status !== "idle"}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "8px 16px",
        background: status !== "idle" ? "var(--bg-3)" : "var(--bg-2)",
        border: "1px solid var(--border-2)",
        borderRadius: 3,
        color: status !== "idle" ? "var(--text-3)" : "var(--text)",
        fontSize: 13,
        fontFamily: "var(--font-sans)",
        cursor: status !== "idle" ? "wait" : "pointer",
        transition: "all 0.12s",
      }}
    >
      {status !== "idle" ? (
        <Loader size={14} style={{ animation: "spin 1s linear infinite" }} />
      ) : (
        <Download size={14} />
      )}
      {label}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}