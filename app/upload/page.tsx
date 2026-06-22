"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, ImagePlus, Tag, Loader, CheckCircle, AlertCircle } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { authClient } from "@/lib/auth-client";
import { generatePostId, isValidImageType, formatBytes } from "@/lib/utils";

interface FileEntry {
  file: File;
  preview: string;
  status: "pending" | "uploading" | "done" | "error";
}

const ALL_TAGS = [
  "Solo","Group","Outdoor","Indoor","Anime","Game","Original","Event","Studio","Concept"
];

const BATCH_SIZE = 3; // upload 3 file sekaligus, sequential per batch

async function uploadBatch(
  batch: { url: string; file: File }[],
  onDone: (idx: number) => void,
  onError: (idx: number) => void,
  startIdx: number
) {
  await Promise.all(
    batch.map(async ({ url, file }, batchIdx) => {
      const globalIdx = startIdx + batchIdx;
      try {
        const res = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        onDone(globalIdx);
      } catch {
        onError(globalIdx);
        throw new Error(`Failed: ${file.name}`);
      }
    })
  );
}

export default function UploadPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [character, setCharacter] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "creating" | "uploading" | "done" | "error">("idle");
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isPending && !session) router.push("/auth/login");
  }, [session, isPending, router]);

  const addFiles = (incoming: File[]) => {
    const valid = incoming.filter((f) => isValidImageType(f.type));
    const entries: FileEntry[] = valid.map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
      status: "pending",
    }));
    setFiles((prev) => [...prev, ...entries]);
  };

  const removeFile = (i: number) => {
    setFiles((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[i].preview);
      next.splice(i, 1);
      return next;
    });
    if (thumbnailIndex >= i && thumbnailIndex > 0) setThumbnailIndex(thumbnailIndex - 1);
  };

  const toggleTag = (t: string) => {
    setSelectedTags((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    addFiles(Array.from(e.dataTransfer.files));
  };

  const setFileStatus = (i: number, status: FileEntry["status"]) => {
    setFiles((prev) => {
      const next = [...prev];
      if (next[i]) next[i] = { ...next[i], status };
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!title.trim() || !character.trim() || files.length === 0) {
      setErrorMsg("Title, character name, and at least one photo are required.");
      return;
    }
    setErrorMsg("");
    setSubmitting(true);
    setSubmitStatus("creating");

    const postId = generatePostId();

    try {
      // ── Step 1: Get all presigned URLs at once ──
      const urlRes = await fetch("/api/r2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: postId,
          files: files.map((f) => ({
            name: f.file.name,
            type: f.file.type,
            size: f.file.size,
          })),
        }),
      });

      if (!urlRes.ok) {
        const err = await urlRes.json().catch(() => ({}));
        throw new Error(err.error || "Failed to get upload URLs");
      }
      const { urls } = await urlRes.json();
      if (!urls?.length) throw new Error("No upload URLs returned");

      // ── Step 2: Upload in batches of BATCH_SIZE ──
      setSubmitStatus("uploading");
      setUploadProgress({ done: 0, total: files.length });

      let doneCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < urls.length; i += BATCH_SIZE) {
        const batchUrls = urls.slice(i, i + BATCH_SIZE);
        const batchFiles = files.slice(i, i + BATCH_SIZE);

        // Mark batch as uploading
        batchFiles.forEach((_, bi) => setFileStatus(i + bi, "uploading"));

        try {
          await uploadBatch(
            batchUrls.map((u: any, bi: number) => ({ url: u.upload_url, file: batchFiles[bi].file })),
            (globalIdx) => {
              setFileStatus(globalIdx, "done");
              doneCount++;
              setUploadProgress({ done: doneCount, total: files.length });
            },
            (globalIdx) => {
              setFileStatus(globalIdx, "error");
              errors.push(files[globalIdx].file.name);
            },
            i
          );
        } catch {
          // Continue with next batch even if this one partially failed
        }

        // Small delay between batches to avoid overwhelming R2
        if (i + BATCH_SIZE < urls.length) {
          await new Promise((r) => setTimeout(r, 200));
        }
      }

      if (errors.length === files.length) {
        throw new Error("All files failed to upload. Check your R2 CORS settings.");
      }

      // ── Step 3: Create post record ──
      const thumbIdx = thumbnailIndex < urls.length ? thumbnailIndex : 0;
      const thumbnailKey = urls[thumbIdx]?.file_key || urls[0].file_key;

      const postRes = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: postId,
          title: title.trim(),
          character_name: character.trim(),
          description: description.trim() || null,
          tags: selectedTags,
          thumbnail_key: thumbnailKey,
        }),
      });

      if (!postRes.ok) {
        const err = await postRes.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create post");
      }

      // ── Step 4: Register files that succeeded ──
      const successfulFiles = urls
        .map((u: any, i: number) => ({ u, i }))
        .filter(({ i }: any) => files[i]?.status !== "error" || true) // include all, DB ignores errors
        .map(({ u, i }: any) => ({
          file_key: u.file_key,
          file_name: files[i].file.name,
          file_size: files[i].file.size,
          mime_type: files[i].file.type,
          sort_order: i,
        }));

      await fetch(`/api/posts/${postId}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: successfulFiles }),
      });

      setSubmitStatus("done");

      if (errors.length > 0) {
        setErrorMsg(`${errors.length} file(s) failed but post was created. You can re-upload them later.`);
      }

      setTimeout(() => router.push(`/post/${postId}`), 1500);

    } catch (err: any) {
      setErrorMsg(err.message || "Upload failed. Please try again.");
      setSubmitStatus("error");
      setSubmitting(false);
    }
  };

  if (isPending || !session) {
    return (
      <AppShell>
        <div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-3)" }}>Loading...</div>
      </AppShell>
    );
  }

  const inputStyle: React.CSSProperties = { width: "100%", padding: "9px 12px", borderRadius: 3, fontSize: 15 };
  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: "bold", color: "var(--text-3)",
    letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 5,
  };

  const uploadPct = uploadProgress.total > 0
    ? Math.round((uploadProgress.done / uploadProgress.total) * 100)
    : 0;

  return (
    <AppShell>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: "bold", marginBottom: 16, color: "var(--text)" }}>
          Upload Post
        </h1>

        {/* Success */}
        {submitStatus === "done" && (
          <div style={{
            padding: "14px 18px", marginBottom: 14,
            background: "#1a3a2a", border: "1px solid var(--green)",
            borderRadius: 3, display: "flex", alignItems: "center", gap: 8,
            color: "var(--green)", fontSize: 14,
          }}>
            <CheckCircle size={16} /> Post created. Redirecting...
          </div>
        )}

        {/* Error */}
        {errorMsg && (
          <div style={{
            padding: "12px 16px", marginBottom: 14,
            background: "#3a1a1a", border: "1px solid var(--red)",
            borderRadius: 3, display: "flex", alignItems: "center", gap: 8,
            color: "var(--red)", fontSize: 13,
          }}>
            <AlertCircle size={15} /> {errorMsg}
          </div>
        )}

        {/* Upload progress bar */}
        {submitStatus === "uploading" && (
          <div style={{ marginBottom: 14 }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              fontSize: 12, color: "var(--text-3)", marginBottom: 5,
            }}>
              <span>Uploading {uploadProgress.done} of {uploadProgress.total} files...</span>
              <span>{uploadPct}%</span>
            </div>
            <div style={{ height: 4, background: "var(--bg-3)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${uploadPct}%`,
                background: "var(--accent)", borderRadius: 2,
                transition: "width 0.3s ease",
              }} />
            </div>
          </div>
        )}

        <div style={{ display: "grid", gap: 12 }}>
          {/* Metadata */}
          <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 3, padding: "16px 18px" }}>
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <label style={labelStyle}>Title *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Spring Blossom Shoot 2024" style={inputStyle} maxLength={120} />
              </div>
              <div>
                <label style={labelStyle}>Character Name *</label>
                <input type="text" value={character} onChange={(e) => setCharacter(e.target.value)}
                  placeholder="e.g. Rem from Re:Zero" style={inputStyle} maxLength={80} />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional — event details, costume notes, photographer credits..."
                  rows={3} style={{ ...inputStyle, resize: "vertical", minHeight: 72 }} maxLength={1000} />
              </div>
              <div>
                <label style={labelStyle}>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Tag size={11} /> Tags
                  </span>
                </label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {ALL_TAGS.map((t) => {
                    const active = selectedTags.includes(t);
                    return (
                      <button key={t} type="button" onClick={() => toggleTag(t)} style={{
                        padding: "4px 12px",
                        border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                        borderRadius: 2,
                        background: active ? "var(--accent)" : "transparent",
                        color: active ? "#000" : "var(--text-2)",
                        fontSize: 12, fontFamily: "var(--font-sans)", cursor: "pointer",
                      }}>
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => !submitting && fileInputRef.current?.click()}
            style={{
              border: "2px dashed var(--border-2)", borderRadius: 3,
              padding: "28px 16px", textAlign: "center",
              cursor: submitting ? "default" : "pointer",
              background: "var(--bg-2)", transition: "border-color 0.15s",
            }}
            onMouseEnter={(e) => { if (!submitting) (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-dim)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-2)"; }}
          >
            <input ref={fileInputRef} type="file" multiple accept="image/*,.heic,.heif"
              style={{ display: "none" }}
              onChange={(e) => addFiles(Array.from(e.target.files || []))} />
            <ImagePlus size={28} color="var(--text-3)" style={{ margin: "0 auto 8px" }} />
            <p style={{ color: "var(--text-2)", fontSize: 14 }}>Drop photos here or click to browse</p>
            <p style={{ color: "var(--text-3)", fontSize: 11, marginTop: 4 }}>
              JPEG, PNG, WebP, GIF, HEIC — no limit
            </p>
          </div>

          {/* File previews */}
          {files.length > 0 && (
            <div>
              <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 8 }}>
                {files.length} file{files.length !== 1 ? "s" : ""} — click to set thumbnail
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 5 }}>
                {files.map((f, i) => (
                  <div
                    key={i}
                    onClick={() => !submitting && setThumbnailIndex(i)}
                    style={{
                      position: "relative", aspectRatio: "3/4", borderRadius: 2,
                      overflow: "hidden",
                      border: `2px solid ${i === thumbnailIndex ? "var(--accent)" : "var(--border)"}`,
                      cursor: submitting ? "default" : "pointer",
                      background: "var(--bg-3)",
                    }}
                  >
                    <img src={f.preview} alt={f.file.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />

                    {i === thumbnailIndex && (
                      <div style={{
                        position: "absolute", top: 4, left: 4,
                        background: "var(--accent)", color: "#000",
                        fontSize: 9, fontWeight: "bold", padding: "1px 5px", borderRadius: 2,
                      }}>
                        THUMB
                      </div>
                    )}

                    {/* Status overlay */}
                    {f.status === "uploading" && (
                      <div style={{
                        position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Loader size={18} color="white" style={{ animation: "spin 1s linear infinite" }} />
                      </div>
                    )}
                    {f.status === "done" && (
                      <div style={{
                        position: "absolute", bottom: 4, right: 4,
                        background: "var(--green)", borderRadius: "50%", width: 18, height: 18,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <CheckCircle size={11} color="white" />
                      </div>
                    )}
                    {f.status === "error" && (
                      <div style={{
                        position: "absolute", inset: 0, background: "rgba(204,68,68,0.3)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <AlertCircle size={18} color="var(--red)" />
                      </div>
                    )}

                    {!submitting && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                        style={{
                          position: "absolute", top: 3, right: 3,
                          background: "rgba(0,0,0,0.7)", border: "none", borderRadius: "50%",
                          width: 18, height: 18, color: "white", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <X size={11} />
                      </button>
                    )}

                    <div style={{
                      position: "absolute", bottom: 4, left: 4,
                      background: "rgba(0,0,0,0.6)", fontSize: 9, color: "white",
                      padding: "1px 4px", borderRadius: 2,
                    }}>
                      {formatBytes(f.file.size)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || submitStatus === "done"}
            style={{
              padding: "12px",
              background: submitting || submitStatus === "done" ? "var(--bg-3)" : "var(--accent)",
              color: submitting || submitStatus === "done" ? "var(--text-3)" : "#000",
              border: "none", borderRadius: 3, fontSize: 15, fontWeight: "bold",
              fontFamily: "var(--font-sans)",
              cursor: submitting || submitStatus === "done" ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {submitting ? (
              <>
                <Loader size={16} style={{ animation: "spin 1s linear infinite" }} />
                {submitStatus === "creating" ? "Creating post..." : `Uploading... ${uploadPct}%`}
              </>
            ) : submitStatus === "done" ? (
              <><CheckCircle size={16} /> Done</>
            ) : (
              <><Upload size={16} /> Publish Post ({files.length} file{files.length !== 1 ? "s" : ""})</>
            )}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AppShell>
  );
}