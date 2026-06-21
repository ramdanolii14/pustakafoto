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

      // Download each file sequentially via presigned URLs
      for (const f of files) {
        const link = document.createElement("a");
        link.href = f.url;
        link.download = f.file_name;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // Brief stagger to avoid browser blocking
        await new Promise((r) => setTimeout(r, 300));
      }
    } catch (err) {
      console.error("Download failed", err);
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
        fontFamily: "var(--font-serif)",
        cursor: status !== "idle" ? "wait" : "pointer",
        transition: "all 0.12s",
      }}
    >
      {status !== "idle" ? <Loader size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Download size={14} />}
      {label}
    </button>
  );
}
