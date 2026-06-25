"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload, X, ImagePlus, Tag, Loader, CheckCircle,
  AlertCircle, Crown, AlertTriangle, Lock, File,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { authClient } from "@/lib/auth-client";
import { generatePostId, isValidImageType, formatBytes } from "@/lib/utils";

interface FileEntry {
  file: File;
  previewUrl: string | null; // null = no preview generated (RAM saving)
  status: "pending" | "uploading" | "done" | "error";
}

const ALL_TAGS = ["Solo","Group","Outdoor","Indoor","Anime","Game","Original","Event","Studio","Concept"];
const BATCH_SIZE = 3;
const MAX_PREVIEWS = 20; // only generate object URLs for first N files

async function uploadBatch(
  batch: { url: string; file: File }[],
  onDone: (i: number) => void,
  onError: (i: number) => void,
  startIdx: number
): Promise<{ failed: number[] }> {
  const failed: number[] = [];
  await Promise.allSettled(
    batch.map(async ({ url, file }, bi) => {
      const gi = startIdx + bi;
      try {
        const res = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        onDone(gi);
      } catch {
        onError(gi);
        failed.push(gi);
      }
    })
  );
  return { failed };
}

export default function UploadPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Track object URLs for cleanup
  const objectUrlsRef = useRef<Set<string>>(new Set());

  // ── All state before any return ──
  const [title, setTitle] = useState("");
  const [character, setCharacter] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle"|"creating"|"uploading"|"done"|"error">("idle");
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0, failed: 0 });
  const [errorMsg, setErrorMsg] = useState("");
  const [isNude, setIsNude] = useState(false);
  const [isMembersOnly, setIsMembersOnly] = useState(false);
  const [isFreeAll, setIsFreeAll] = useState(true);
  const [freePercent, setFreePercent] = useState(30);

  useEffect(() => {
    if (!isPending && !session) router.push("/auth/login");
  }, [session, isPending, router]);

  // Cleanup all object URLs on unmount
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const createPreview = useCallback((file: File, index: number): string | null => {
    // Only generate preview for first MAX_PREVIEWS files
    if (index >= MAX_PREVIEWS) return null;
    const url = URL.createObjectURL(file);
    objectUrlsRef.current.add(url);
    return url;
  }, []);

  const addFiles = useCallback((incoming: File[]) => {
    const valid = incoming.filter((f) => isValidImageType(f.type));
    setFiles((prev) => {
      const newEntries: FileEntry[] = valid.map((f, i) => ({
        file: f,
        previewUrl: createPreview(f, prev.length + i),
        status: "pending",
      }));
      return [...prev, ...newEntries];
    });
  }, [createPreview]);

  const removeFile = useCallback((i: number) => {
    setFiles((prev) => {
      const next = [...prev];
      // Revoke and cleanup preview URL
      const url = next[i].previewUrl;
      if (url) {
        URL.revokeObjectURL(url);
        objectUrlsRef.current.delete(url);
      }
      next.splice(i, 1);
      return next;
    });
    setThumbnailIndex((prev) => (prev >= i && prev > 0 ? prev - 1 : prev));
  }, []);

  const setFileStatus = useCallback((i: number, status: FileEntry["status"]) => {
    setFiles((prev) => {
      const next = [...prev];
      if (!next[i]) return prev;
      // Revoke preview URL after done to free RAM
      if (status === "done" && next[i].previewUrl) {
        URL.revokeObjectURL(next[i].previewUrl!);
        objectUrlsRef.current.delete(next[i].previewUrl!);
        next[i] = { ...next[i], status, previewUrl: null };
      } else {
        next[i] = { ...next[i], status };
      }
      return next;
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    addFiles(Array.from(e.dataTransfer.files));
  }, [addFiles]);

  const toggleNude = useCallback(() => {
    setIsNude((prev) => {
      if (!prev) setIsMembersOnly(true);
      return !prev;
    });
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !character.trim() || files.length === 0) {
      setErrorMsg("Title, character name, and at least one photo are required.");
      return;
    }
    setErrorMsg("");
    setSubmitting(true);
    setSubmitStatus("creating");

    const postId = generatePostId();
    const allFailedIndices: number[] = [];

    try {
      // Step 1: Get presigned URLs
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

      // Step 2: Upload in batches
      setSubmitStatus("uploading");
      setUploadProgress({ done: 0, total: files.length, failed: 0 });
      let doneCount = 0;
      let failCount = 0;

      for (let i = 0; i < urls.length; i += BATCH_SIZE) {
        const batchUrls = urls.slice(i, i + BATCH_SIZE);
        const batchFiles = files.slice(i, i + BATCH_SIZE);

        batchFiles.forEach((_, bi) => setFileStatus(i + bi, "uploading"));

        const { failed } = await uploadBatch(
          batchUrls.map((u: any, bi: number) => ({
            url: u.upload_url,
            file: batchFiles[bi].file,
          })),
          (gi) => {
            setFileStatus(gi, "done");
            doneCount++;
            setUploadProgress({ done: doneCount, total: files.length, failed: failCount });
          },
          (gi) => {
            setFileStatus(gi, "error");
            allFailedIndices.push(gi);
            failCount++;
            setUploadProgress({ done: doneCount, total: files.length, failed: failCount });
          },
          i
        );

        if (i + BATCH_SIZE < urls.length) {
          await new Promise((r) => setTimeout(r, 200));
        }
      }

      // Step 3: Check if too many failed — abort if ALL failed
      if (doneCount === 0) {
        throw new Error(
          "All files failed to upload. Check your R2 CORS settings and try again."
        );
      }

      // Step 4: Create post record (only if at least some files uploaded)
      const thumbIdx = thumbnailIndex < urls.length ? thumbnailIndex : 0;
      // If thumbnail file failed, find first successful file as thumb
      let effectiveThumbIdx = thumbIdx;
      if (allFailedIndices.includes(thumbIdx)) {
        for (let i = 0; i < urls.length; i++) {
          if (!allFailedIndices.includes(i)) { effectiveThumbIdx = i; break; }
        }
      }
      const thumbnailKey = urls[effectiveThumbIdx]?.file_key || urls[0].file_key;

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
          is_nude: isNude,
          is_members_only: isMembersOnly || isNude,
          is_free_all: isMembersOnly ? isFreeAll : true,
          free_percent: isMembersOnly && !isFreeAll ? freePercent : 100,
        }),
      });
      if (!postRes.ok) {
        const err = await postRes.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create post record");
      }

      // Step 5: Register only successful files in DB
      const successfulFileRecords = urls
        .map((u: any, i: number) => ({ u, i }))
        .filter(({ i }: any) => !allFailedIndices.includes(i))
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
        body: JSON.stringify({ files: successfulFileRecords }),
      });

      // Step 6: Show result
      if (failCount > 0) {
        setErrorMsg(
          `${failCount} of ${files.length} file(s) failed to upload. Post created with ${doneCount} photo(s).`
        );
        setSubmitStatus("done");
        // Delay redirect longer so user sees the warning
        setTimeout(() => router.push(`/post/${postId}`), 4000);
      } else {
        setSubmitStatus("done");
        setTimeout(() => router.push(`/post/${postId}`), 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Upload failed. Please try again.");
      setSubmitStatus("error");
      setSubmitting(false);
    }
  };

  // ── Styles ──
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 3, fontSize: 15,
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: "bold", color: "var(--text-3)",
    letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 5,
  };
  const uploadPct = uploadProgress.total > 0
    ? Math.round((uploadProgress.done / uploadProgress.total) * 100)
    : 0;
  const toggleBtn = (active: boolean, color = "var(--accent)"): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
    border: `1px solid ${active ? color : "var(--border)"}`,
    borderRadius: 3, background: active ? `${color}12` : "transparent",
    cursor: "pointer", transition: "all 0.12s", width: "100%",
    fontFamily: "var(--font-sans)",
  });

  if (isPending) {
    return (
      <AppShell>
        <div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-3)" }}>
          Loading...
        </div>
      </AppShell>
    );
  }
  if (!session) return null;

  return (
    <AppShell>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: "bold", marginBottom: 16, color: "var(--text)" }}>
          Upload Post
        </h1>

        {/* Success */}
        {submitStatus === "done" && !errorMsg && (
          <div style={{ padding: "14px 18px", marginBottom: 14, background: "#1a3a2a", border: "1px solid var(--green)", borderRadius: 3, display: "flex", alignItems: "center", gap: 8, color: "var(--green)", fontSize: 14 }}>
            <CheckCircle size={16} /> Post created. Redirecting...
          </div>
        )}

        {/* Partial success warning */}
        {submitStatus === "done" && errorMsg && (
          <div style={{ padding: "14px 18px", marginBottom: 14, background: "#2a2a1a", border: "1px solid var(--accent)", borderRadius: 3, display: "flex", alignItems: "center", gap: 8, color: "var(--accent)", fontSize: 13 }}>
            <AlertCircle size={15} /> {errorMsg} Redirecting in 4s...
          </div>
        )}

        {/* Error */}
        {submitStatus === "error" && errorMsg && (
          <div style={{ padding: "12px 16px", marginBottom: 14, background: "#3a1a1a", border: "1px solid var(--red)", borderRadius: 3, display: "flex", alignItems: "center", gap: 8, color: "var(--red)", fontSize: 13 }}>
            <AlertCircle size={15} /> {errorMsg}
          </div>
        )}

        {/* Progress */}
        {submitStatus === "uploading" && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-3)", marginBottom: 5 }}>
              <span>
                Uploading {uploadProgress.done} of {uploadProgress.total} files
                {uploadProgress.failed > 0 && (
                  <span style={{ color: "var(--red)", marginLeft: 8 }}>
                    ({uploadProgress.failed} failed)
                  </span>
                )}
              </span>
              <span>{uploadPct}%</span>
            </div>
            <div style={{ height: 4, background: "var(--bg-3)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${uploadPct}%`, background: uploadProgress.failed > 0 ? "var(--accent)" : "var(--green)", borderRadius: 2, transition: "width 0.3s" }} />
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
                  placeholder="Optional — event details, costume notes..."
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
                      <button key={t} type="button"
                        onClick={() => setSelectedTags((prev) =>
                          prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
                        )}
                        style={{ padding: "4px 12px", border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`, borderRadius: 2, background: active ? "var(--accent)" : "transparent", color: active ? "#000" : "var(--text-2)", fontSize: 12, fontFamily: "var(--font-sans)", cursor: "pointer" }}>
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Content Settings */}
          <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 3, padding: "14px 18px" }}>
            <div style={{ fontSize: 12, fontWeight: "bold", color: "var(--text-3)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>
              Content Settings
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button type="button" onClick={toggleNude} style={toggleBtn(isNude, "var(--red)")}>
                <AlertTriangle size={15} color={isNude ? "var(--red)" : "var(--text-3)"} />
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ fontSize: 13, fontWeight: "bold", color: isNude ? "var(--red)" : "var(--text)" }}>Konten Dewasa (18+)</div>
                  <div style={{ fontSize: 11, color: "var(--text-3)" }}>Badge 18+, wajib login untuk melihat</div>
                </div>
                <div style={{ width: 32, height: 18, borderRadius: 9, background: isNude ? "var(--red)" : "var(--bg-3)", border: `1px solid ${isNude ? "var(--red)" : "var(--border)"}`, position: "relative", transition: "all 0.15s", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: 2, left: isNude ? 14 : 2, width: 12, height: 12, borderRadius: "50%", background: "white", transition: "left 0.15s" }} />
                </div>
              </button>

              <button type="button" onClick={() => setIsMembersOnly((v) => !v)} style={toggleBtn(isMembersOnly)}>
                <Crown size={15} color={isMembersOnly ? "var(--accent)" : "var(--text-3)"} />
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ fontSize: 13, fontWeight: "bold", color: isMembersOnly ? "var(--accent)" : "var(--text)" }}>Members Only</div>
                  <div style={{ fontSize: 11, color: "var(--text-3)" }}>Akses hanya untuk member berbayar</div>
                </div>
                <div style={{ width: 32, height: 18, borderRadius: 9, background: isMembersOnly ? "var(--accent)" : "var(--bg-3)", border: `1px solid ${isMembersOnly ? "var(--accent)" : "var(--border)"}`, position: "relative", transition: "all 0.15s", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: 2, left: isMembersOnly ? 14 : 2, width: 12, height: 12, borderRadius: "50%", background: "white", transition: "left 0.15s" }} />
                </div>
              </button>

              {isMembersOnly && (
                <div style={{ marginLeft: 14, padding: "12px 14px", background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 3 }}>
                  <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 10 }}>
                    <Lock size={11} style={{ display: "inline", marginRight: 5 }} />
                    Berapa % konten yang bisa dilihat user biasa?
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[
                      { label: "Semua gratis", value: "free_all" },
                      { label: "Sebagian gratis", value: "partial" },
                      { label: "Semua dikunci", value: "locked" },
                    ].map((opt) => {
                      const active =
                        opt.value === "free_all" ? isFreeAll :
                        opt.value === "locked" ? (!isFreeAll && freePercent === 0) :
                        (!isFreeAll && freePercent > 0);
                      return (
                        <button key={opt.value} type="button" onClick={() => {
                          if (opt.value === "free_all") { setIsFreeAll(true); setFreePercent(100); }
                          else if (opt.value === "locked") { setIsFreeAll(false); setFreePercent(0); }
                          else { setIsFreeAll(false); setFreePercent(30); }
                        }} style={{ padding: "5px 12px", border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`, borderRadius: 2, background: active ? "var(--accent)" : "transparent", color: active ? "#000" : "var(--text-2)", fontSize: 12, fontFamily: "var(--font-sans)", cursor: "pointer" }}>
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                  {!isFreeAll && freePercent > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-3)", marginBottom: 5 }}>
                        <span>User biasa bisa lihat {freePercent}% foto</span>
                        <span>{files.length > 0 ? `${Math.floor(files.length * freePercent / 100)} dari ${files.length}` : `${freePercent}%`}</span>
                      </div>
                      <input type="range" min={5} max={95} step={5} value={freePercent}
                        onChange={(e) => setFreePercent(parseInt(e.target.value))}
                        style={{ width: "100%", accentColor: "var(--accent)" }} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => !submitting && fileInputRef.current?.click()}
            style={{ border: "2px dashed var(--border-2)", borderRadius: 3, padding: "28px 16px", textAlign: "center", cursor: submitting ? "default" : "pointer", background: "var(--bg-2)", transition: "border-color 0.15s" }}
            onMouseEnter={(e) => { if (!submitting) (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-dim)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-2)"; }}
          >
            <input ref={fileInputRef} type="file" multiple accept="image/*,.heic,.heif"
              style={{ display: "none" }}
              onChange={(e) => addFiles(Array.from(e.target.files || []))} />
            <ImagePlus size={28} color="var(--text-3)" style={{ margin: "0 auto 8px" }} />
            <p style={{ color: "var(--text-2)", fontSize: 14 }}>Drop photos here or click to browse</p>
            <p style={{ color: "var(--text-3)", fontSize: 11, marginTop: 4 }}>
              JPEG, PNG, WebP, GIF, HEIC — Preview hanya untuk {MAX_PREVIEWS} foto pertama
            </p>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                  {files.length} file{files.length !== 1 ? "s" : ""} selected
                  {files.length > MAX_PREVIEWS && (
                    <span style={{ color: "var(--accent)", marginLeft: 6 }}>
                      · Preview untuk {MAX_PREVIEWS} pertama saja (hemat RAM)
                    </span>
                  )}
                </span>
                {!submitting && (
                  <button
                    onClick={() => {
                      files.forEach((f) => { if (f.previewUrl) { URL.revokeObjectURL(f.previewUrl); objectUrlsRef.current.delete(f.previewUrl); } });
                      setFiles([]);
                      setThumbnailIndex(0);
                    }}
                    style={{ fontSize: 11, color: "var(--text-3)", background: "transparent", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)" }}
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 5 }}>
                {files.map((f, i) => (
                  <div
                    key={i}
                    onClick={() => !submitting && setThumbnailIndex(i)}
                    style={{
                      position: "relative", aspectRatio: "3/4", borderRadius: 2, overflow: "hidden",
                      border: `2px solid ${i === thumbnailIndex ? "var(--accent)" : f.status === "error" ? "var(--red)" : "var(--border)"}`,
                      cursor: submitting ? "default" : "pointer",
                      background: "var(--bg-3)",
                    }}
                  >
                    {/* Preview or placeholder */}
                    {f.previewUrl ? (
                      <img
                        src={f.previewUrl}
                        alt={f.file.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      // No preview — show file info instead (saves RAM)
                      <div style={{
                        width: "100%", height: "100%",
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        gap: 4, padding: 6,
                      }}>
                        <File size={20} color="var(--text-3)" />
                        <span style={{
                          fontSize: 9, color: "var(--text-3)",
                          textAlign: "center", wordBreak: "break-all",
                          lineHeight: 1.3,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}>
                          {f.file.name}
                        </span>
                        <span style={{ fontSize: 9, color: "var(--text-3)" }}>
                          {formatBytes(f.file.size)}
                        </span>
                      </div>
                    )}

                    {/* Thumbnail badge */}
                    {i === thumbnailIndex && (
                      <div style={{ position: "absolute", top: 4, left: 4, background: "var(--accent)", color: "#000", fontSize: 9, fontWeight: "bold", padding: "1px 5px", borderRadius: 2 }}>
                        THUMB
                      </div>
                    )}

                    {/* Status overlays */}
                    {f.status === "uploading" && (
                      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Loader size={18} color="white" style={{ animation: "spin 1s linear infinite" }} />
                      </div>
                    )}
                    {f.status === "done" && (
                      <div style={{ position: "absolute", bottom: 4, right: 4, background: "var(--green)", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <CheckCircle size={11} color="white" />
                      </div>
                    )}
                    {f.status === "error" && (
                      <div style={{ position: "absolute", inset: 0, background: "rgba(204,68,68,0.25)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                        <AlertCircle size={18} color="var(--red)" />
                        <span style={{ fontSize: 9, color: "var(--red)", fontWeight: "bold" }}>FAILED</span>
                      </div>
                    )}

                    {/* Size badge (only on previews, not placeholders) */}
                    {f.previewUrl && f.status === "pending" && (
                      <div style={{ position: "absolute", bottom: 4, left: 4, background: "rgba(0,0,0,0.6)", fontSize: 9, color: "white", padding: "1px 4px", borderRadius: 2 }}>
                        {formatBytes(f.file.size)}
                      </div>
                    )}

                    {/* Remove button */}
                    {!submitting && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                        style={{ position: "absolute", top: 3, right: 3, background: "rgba(0,0,0,0.7)", border: "none", borderRadius: "50%", width: 18, height: 18, color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <X size={11} />
                      </button>
                    )}
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
              <><CheckCircle size={16} /> Done — Redirecting...</>
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