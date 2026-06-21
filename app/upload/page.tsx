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
  progress: number;
}

const ALL_TAGS = [
  "Solo","Group","Outdoor","Indoor","Anime","Game","Original","Event","Studio","Concept"
];

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
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth/login");
    }
  }, [session, isPending, router]);

  const addFiles = (incoming: File[]) => {
    const valid = incoming.filter((f) => isValidImageType(f.type));
    const entries: FileEntry[] = valid.map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
      status: "pending",
      progress: 0,
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
    if (thumbnailIndex >= i && thumbnailIndex > 0) {
      setThumbnailIndex(thumbnailIndex - 1);
    }
  };

  const toggleTag = (t: string) => {
    setSelectedTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    addFiles(dropped);
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
    const thumbnailFile = files[thumbnailIndex] || files[0];

    try {
      // 1. Get presigned upload URLs from server
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

      if (!urlRes.ok) throw new Error("Failed to get upload URLs");
      const { urls } = await urlRes.json();

      setSubmitStatus("uploading");

      // 2. Upload all files directly to R2
      await Promise.all(
        urls.map(async (u: any, i: number) => {
          setFiles((prev) => {
            const next = [...prev];
            next[i] = { ...next[i], status: "uploading" };
            return next;
          });
          try {
            await fetch(u.upload_url, {
              method: "PUT",
              headers: { "Content-Type": files[i].file.type },
              body: files[i].file,
            });
            setFiles((prev) => {
              const next = [...prev];
              next[i] = { ...next[i], status: "done", progress: 100 };
              return next;
            });
          } catch {
            setFiles((prev) => {
              const next = [...prev];
              next[i] = { ...next[i], status: "error" };
              return next;
            });
            throw new Error(`Failed to upload ${files[i].file.name}`);
          }
        })
      );

      // 3. Create post record
      const thumbnailKey = urls[thumbnailIndex]?.file_key || urls[0].file_key;

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

      if (!postRes.ok) throw new Error("Failed to create post");

      // 4. Register files in DB
      const fileRecords = urls.map((u: any, i: number) => ({
        file_key: u.file_key,
        file_name: files[i].file.name,
        file_size: files[i].file.size,
        mime_type: files[i].file.type,
        sort_order: i,
      }));

      await fetch(`/api/posts/${postId}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: fileRecords }),
      });

      setSubmitStatus("done");
      setTimeout(() => router.push(`/post/${postId}`), 1200);
    } catch (err: any) {
      setErrorMsg(err.message || "Upload failed. Please try again.");
      setSubmitStatus("error");
      setSubmitting(false);
    }
  };

  if (isPending || !session) {
    return (
      <AppShell>
        <div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-3)" }}>
          Loading...
        </div>
      </AppShell>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 3,
    fontSize: 15,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: "bold",
    color: "var(--text-3)",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    display: "block",
    marginBottom: 5,
  };

  return (
    <AppShell>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: "bold", marginBottom: 16, color: "var(--text)" }}>
          Upload Post
        </h1>

        {/* Success overlay */}
        {submitStatus === "done" && (
          <div style={{
            padding: "14px 18px", marginBottom: 14,
            background: "#1a3a2a", border: "1px solid var(--green)",
            borderRadius: 3, display: "flex", alignItems: "center", gap: 8,
            color: "var(--green)", fontSize: 14,
          }}>
            <CheckCircle size={16} />
            Post created successfully. Redirecting...
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
            <AlertCircle size={15} />
            {errorMsg}
          </div>
        )}

        <div style={{ display: "grid", gap: 12 }}>
          {/* Metadata card */}
          <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 3, padding: "16px 18px" }}>
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <label style={labelStyle}>Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Spring Blossom Shoot 2024"
                  style={inputStyle}
                  maxLength={120}
                />
              </div>
              <div>
                <label style={labelStyle}>Character Name *</label>
                <input
                  type="text"
                  value={character}
                  onChange={(e) => setCharacter(e.target.value)}
                  placeholder="e.g. Rem from Re:Zero"
                  style={inputStyle}
                  maxLength={80}
                />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional — event details, costume notes, photographer credits..."
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical", minHeight: 72 }}
                  maxLength={1000}
                />
              </div>

              {/* Tags */}
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
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTag(t)}
                        style={{
                          padding: "4px 12px",
                          border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                          borderRadius: 2,
                          background: active ? "var(--accent)" : "transparent",
                          color: active ? "#000" : "var(--text-2)",
                          fontSize: 12,
                          fontFamily: "var(--font-sans)",
                          cursor: "pointer",
                        }}
                      >
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
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: "2px dashed var(--border-2)",
              borderRadius: 3,
              padding: "28px 16px",
              textAlign: "center",
              cursor: "pointer",
              background: "var(--bg-2)",
              transition: "border-color 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-dim)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-2)"; }}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => addFiles(Array.from(e.target.files || []))}
            />
            <ImagePlus size={28} color="var(--text-3)" style={{ margin: "0 auto 8px" }} />
            <p style={{ color: "var(--text-2)", fontSize: 14 }}>
              Drop photos here or click to browse
            </p>
            <p style={{ color: "var(--text-3)", fontSize: 11, marginTop: 4 }}>
              JPEG, PNG, WebP, GIF — unlimited files
            </p>
          </div>

          {/* File previews */}
          {files.length > 0 && (
            <div>
              <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 8 }}>
                {files.length} file{files.length !== 1 ? "s" : ""} selected — click a photo to set as thumbnail
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: 6,
              }}>
                {files.map((f, i) => (
                  <div
                    key={i}
                    onClick={() => setThumbnailIndex(i)}
                    style={{
                      position: "relative",
                      aspectRatio: "3/4",
                      borderRadius: 2,
                      overflow: "hidden",
                      border: `2px solid ${i === thumbnailIndex ? "var(--accent)" : "var(--border)"}`,
                      cursor: "pointer",
                      background: "var(--bg-3)",
                    }}
                  >
                    <img
                      src={f.preview}
                      alt={f.file.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />

                    {/* Thumbnail badge */}
                    {i === thumbnailIndex && (
                      <div style={{
                        position: "absolute", top: 4, left: 4,
                        background: "var(--accent)", color: "#000",
                        fontSize: 9, fontWeight: "bold",
                        padding: "1px 5px", borderRadius: 2,
                      }}>
                        THUMB
                      </div>
                    )}

                    {/* Upload status */}
                    {f.status === "uploading" && (
                      <div style={{
                        position: "absolute", inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Loader size={20} color="white" style={{ animation: "spin 1s linear infinite" }} />
                      </div>
                    )}
                    {f.status === "done" && (
                      <div style={{
                        position: "absolute", bottom: 4, right: 4,
                        background: "var(--green)", borderRadius: "50%",
                        width: 18, height: 18,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <CheckCircle size={12} color="white" />
                      </div>
                    )}
                    {f.status === "error" && (
                      <div style={{
                        position: "absolute", bottom: 4, right: 4,
                        background: "var(--red)", borderRadius: "50%",
                        width: 18, height: 18,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <AlertCircle size={12} color="white" />
                      </div>
                    )}

                    {/* Remove btn */}
                    {!submitting && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                        style={{
                          position: "absolute", top: 3, right: 3,
                          background: "rgba(0,0,0,0.7)", border: "none",
                          borderRadius: "50%", width: 18, height: 18,
                          color: "white", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <X size={11} />
                      </button>
                    )}

                    {/* File size */}
                    <div style={{
                      position: "absolute", bottom: 4, left: 4,
                      background: "rgba(0,0,0,0.6)",
                      fontSize: 9, color: "white",
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
              border: "none",
              borderRadius: 3,
              fontSize: 15,
              fontWeight: "bold",
              fontFamily: "var(--font-sans)",
              cursor: submitting ? "wait" : submitStatus === "done" ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.15s",
            }}
          >
            {submitting ? (
              <>
                <Loader size={16} style={{ animation: "spin 1s linear infinite" }} />
                {submitStatus === "creating" ? "Creating post..." : "Uploading files..."}
              </>
            ) : submitStatus === "done" ? (
              <><CheckCircle size={16} /> Done</>
            ) : (
              <><Upload size={16} /> Publish Post</>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </AppShell>
  );
}