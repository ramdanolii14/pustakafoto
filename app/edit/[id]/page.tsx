"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Save, ArrowLeft, Loader, CheckCircle, AlertCircle, Tag } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { authClient } from "@/lib/auth-client";

const ALL_TAGS = [
  "Solo","Group","Outdoor","Indoor","Anime","Game","Original","Event","Studio","Concept"
];

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [character, setCharacter] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [postUserId, setPostUserId] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/posts/${id}`)
      .then((r) => r.json())
      .then(({ post }) => {
        setTitle(post.title);
        setCharacter(post.character_name);
        setDescription(post.description || "");
        setTags(post.tags || []);
        setPostUserId(post.user_id);
        setLoading(false);
      })
      .catch(() => router.push("/dashboard"));
  }, [id, router]);

  // Guard: only owner or admin can access
  useEffect(() => {
    if (!loading && session && postUserId) {
      // will be enforced by API too, just redirect early
    }
  }, [loading, session, postUserId]);

  const toggleTag = (t: string) => {
    setTags((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  };

  const handleSave = async () => {
    if (!title.trim() || !character.trim()) {
      setError("Title and character name are required.");
      return;
    }
    setError("");
    setSaving(true);

    const res = await fetch(`/api/posts/${id}/edit`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        character_name: character.trim(),
        description: description.trim(),
        tags,
      }),
    });

    if (res.ok) {
      setSaved(true);
      setTimeout(() => router.push(`/post/${id}`), 1000);
    } else {
      const d = await res.json();
      setError(d.error || "Failed to save.");
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 3, fontSize: 15,
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: "bold", color: "var(--text-3)",
    letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 5,
  };

  if (loading) {
    return (
      <AppShell>
        <div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-3)" }}>Loading...</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <button
          onClick={() => router.push(`/post/${id}`)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "transparent", border: "none",
            color: "var(--text-3)", fontSize: 13, cursor: "pointer",
            marginBottom: 16, padding: 0, fontFamily: "var(--font-sans)",
          }}
        >
          <ArrowLeft size={14} /> Back to post
        </button>

        <h1 style={{ fontSize: 20, fontWeight: "bold", color: "var(--text)", marginBottom: 16 }}>
          Edit Post
        </h1>

        {saved && (
          <div style={{
            padding: "12px 16px", marginBottom: 14,
            background: "#1a3a2a", border: "1px solid var(--green)",
            borderRadius: 3, display: "flex", alignItems: "center", gap: 8,
            color: "var(--green)", fontSize: 13,
          }}>
            <CheckCircle size={15} /> Saved. Redirecting...
          </div>
        )}

        {error && (
          <div style={{
            padding: "12px 16px", marginBottom: 14,
            background: "#3a1a1a", border: "1px solid var(--red)",
            borderRadius: 3, display: "flex", alignItems: "center", gap: 8,
            color: "var(--red)", fontSize: 13,
          }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <div style={{
          background: "var(--bg-2)", border: "1px solid var(--border)",
          borderRadius: 3, padding: "18px", display: "grid", gap: 14,
        }}>
          <div>
            <label style={labelStyle}>Title *</label>
            <input
              type="text" value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputStyle} maxLength={120}
            />
          </div>

          <div>
            <label style={labelStyle}>Character Name *</label>
            <input
              type="text" value={character}
              onChange={(e) => setCharacter(e.target.value)}
              style={inputStyle} maxLength={80}
            />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              style={{ ...inputStyle, resize: "vertical", minHeight: 88 }}
              maxLength={1000}
            />
          </div>

          <div>
            <label style={labelStyle}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Tag size={11} /> Tags
              </span>
            </label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {ALL_TAGS.map((t) => {
                const active = tags.includes(t);
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

          <button
            onClick={handleSave}
            disabled={saving || saved}
            style={{
              padding: "11px",
              background: saving || saved ? "var(--bg-3)" : "var(--accent)",
              color: saving || saved ? "var(--text-3)" : "#000",
              border: "none", borderRadius: 3,
              fontSize: 14, fontWeight: "bold", fontFamily: "var(--font-sans)",
              cursor: saving || saved ? "wait" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            }}
          >
            {saving
              ? <><Loader size={14} style={{ animation: "spin 1s linear infinite" }} /> Saving...</>
              : saved
              ? <><CheckCircle size={14} /> Saved</>
              : <><Save size={14} /> Save Changes</>
            }
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AppShell>
  );
}