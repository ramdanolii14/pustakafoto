"use client";

import { useState, useRef } from "react";
import { Download, X, CheckCircle, AlertCircle, Package } from "lucide-react";

interface DownloadAllButtonProps {
  postId: string;
  fileCount: number;
  postTitle?: string;
}

type Phase = "idle" | "fetching" | "downloading" | "zipping" | "done" | "error";

interface ProgressState {
  phase: Phase;
  current: number;   // files fetched so far
  total: number;     // total files
  percent: number;   // 0–100
  errorMsg?: string;
}

export default function DownloadAllButton({ postId, fileCount, postTitle }: DownloadAllButtonProps) {
  const [prog, setProg] = useState<ProgressState>({
    phase: "idle", current: 0, total: 0, percent: 0,
  });
  const abortRef = useRef<AbortController | null>(null);

  const cancel = () => {
    abortRef.current?.abort();
    setProg({ phase: "idle", current: 0, total: 0, percent: 0 });
  };

  const handleDownload = async () => {
    if (prog.phase !== "idle") return;

    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    setProg({ phase: "fetching", current: 0, total: fileCount, percent: 0 });

    try {
      // 1. Get presigned download URLs from server
      const res = await fetch(`/api/r2?post_id=${postId}`, { signal });
      if (!res.ok) throw new Error("Failed to get download URLs");
      const { files } = await res.json();

      if (!files || files.length === 0) throw new Error("No files found");

      const total = files.length;
      setProg({ phase: "downloading", current: 0, total, percent: 0 });

      // 2. Fetch all blobs in parallel (batch of 4 at a time to avoid overwhelming)
      const blobs: { name: string; blob: Blob }[] = [];

      const BATCH = 4;
      for (let i = 0; i < files.length; i += BATCH) {
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");

        const batch = files.slice(i, i + BATCH);
        const results = await Promise.all(
          batch.map(async (f: { url: string; file_name: string }) => {
            const r = await fetch(f.url, { signal });
            if (!r.ok) throw new Error(`Failed to fetch ${f.file_name}`);
            const blob = await r.blob();
            return { name: f.file_name, blob };
          })
        );

        blobs.push(...results);
        const done = Math.min(i + BATCH, total);
        setProg({
          phase: "downloading",
          current: done,
          total,
          percent: Math.round((done / total) * 80), // 0–80% for downloading
        });
      }

      // 3. Zip everything in-browser using JSZip
      setProg({ phase: "zipping", current: total, total, percent: 85 });

      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      for (const { name, blob } of blobs) {
        zip.file(name, blob);
      }

      const zipBlob = await zip.generateAsync(
        { type: "blob", compression: "DEFLATE", compressionOptions: { level: 3 } },
        (meta) => {
          setProg({
            phase: "zipping",
            current: total,
            total,
            percent: 85 + Math.round(meta.percent * 0.14), // 85–99%
          });
        }
      );

      setProg({ phase: "done", current: total, total, percent: 100 });

      // 4. Trigger single ZIP download
      const zipName = postTitle
        ? `${postTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.zip`
        : `pustakafoto_${postId.slice(0, 8)}.zip`;

      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = zipName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 5000);

      // Reset after short delay
      setTimeout(() => setProg({ phase: "idle", current: 0, total: 0, percent: 0 }), 3000);

    } catch (err: any) {
      if (err.name === "AbortError") return; // cancelled, already reset
      setProg({
        phase: "error",
        current: 0, total: 0, percent: 0,
        errorMsg: err.message || "Download failed",
      });
      setTimeout(() => setProg({ phase: "idle", current: 0, total: 0, percent: 0 }), 4000);
    }
  };

  const { phase, current, total, percent, errorMsg } = prog;
  const isActive = phase !== "idle" && phase !== "done" && phase !== "error";

  const phaseLabel: Record<Phase, string> = {
    idle:        `Download All (${fileCount})`,
    fetching:    "Getting files...",
    downloading: `Downloading ${current}/${total}`,
    zipping:     "Zipping...",
    done:        "Done!",
    error:       "Failed",
  };

  const phaseColor: Partial<Record<Phase, string>> = {
    done:  "var(--green)",
    error: "var(--red)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 200 }}>
      {/* Button */}
      <div style={{ display: "flex", gap: 6 }}>
        <button
          onClick={handleDownload}
          disabled={isActive || phase === "done"}
          style={{
            flex: 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            padding: "8px 14px",
            background: phase === "done"
              ? "rgba(68,170,102,0.12)"
              : phase === "error"
              ? "rgba(204,68,68,0.12)"
              : "var(--bg-2)",
            border: `1px solid ${phaseColor[phase] || "var(--border-2)"}`,
            borderRadius: 3,
            color: phaseColor[phase] || (isActive ? "var(--text-3)" : "var(--text)"),
            fontSize: 13,
            fontFamily: "var(--font-sans)",
            cursor: isActive || phase === "done" ? "default" : "pointer",
            transition: "all 0.12s",
          }}
        >
          {phase === "done" ? (
            <CheckCircle size={14} />
          ) : phase === "error" ? (
            <AlertCircle size={14} />
          ) : phase === "zipping" ? (
            <Package size={14} />
          ) : (
            <Download size={14} />
          )}
          {phaseLabel[phase]}
        </button>

        {/* Cancel button — only while active */}
        {isActive && (
          <button
            onClick={cancel}
            title="Cancel"
            style={{
              padding: "8px 10px",
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: 3,
              color: "var(--text-3)",
              cursor: "pointer",
              display: "flex", alignItems: "center",
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Progress bar — visible while active or done */}
      {(isActive || phase === "done" || phase === "error") && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {/* Track */}
          <div style={{
            height: 3,
            background: "var(--bg-3)",
            borderRadius: 2,
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${percent}%`,
              background: phase === "error"
                ? "var(--red)"
                : phase === "done"
                ? "var(--green)"
                : "var(--accent)",
              borderRadius: 2,
              transition: "width 0.3s ease",
            }} />
          </div>

          {/* Labels */}
          <div style={{
            display: "flex", justifyContent: "space-between",
            fontSize: 10, color: phase === "error" ? "var(--red)" : "var(--text-3)",
          }}>
            <span>
              {phase === "downloading" && `${current} of ${total} files`}
              {phase === "zipping" && "Building ZIP..."}
              {phase === "fetching" && "Preparing..."}
              {phase === "done" && "ZIP downloaded"}
              {phase === "error" && (errorMsg || "Something went wrong")}
            </span>
            <span>{percent}%</span>
          </div>
        </div>
      )}
    </div>
  );
}