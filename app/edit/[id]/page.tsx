"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Save, ArrowLeft, Loader, CheckCircle, AlertCircle, Tag, Crown, AlertTriangle, Lock } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { authClient } from "@/lib/auth-client";

const ALL_TAGS = ["Solo","Group","Outdoor","Indoor","Anime","Game","Original","Event","Studio","Concept"];

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
  const [isNude, setIsNude] = useState(false);
  const [isMembersOnly, setIsMembersOnly] = useState(false);
  const [isFreeAll, setIsFreeAll] = useState(true);
  const [freePercent, setFreePercent] = useState(30);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/posts/${id}`)
      .then((r) => r.json())
      .then(({ post }) => {
        setTitle(post.title);
        setCharacter(post.character_name);
        setDescription(post.description || "");
        setTags(post.tags || []);
        setIsNude(post.is_nude === true);
        setIsMembersOnly(post.is_members_only === true);
        // is_free_all: default true if null/undefined (old posts), false only if explicitly false
        setIsFreeAll(post.is_free_all !== false);
        setFreePercent(typeof post.free_percent === "number" && post.free_percent < 100 ? post.free_percent : 30);
        setLoading(false);
      })
      .catch(() => router.push("/dashboard"));
  }, [id, router]);

  const handleSave = async () => {
    if (!title.trim() || !character.trim()) { setError("Title and character name are required."); return; }
    setError(""); setSaving(true);

    const res = await fetch(`/api/posts/${id}/edit`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(), character_name: character.trim(),
        description: description.trim(), tags,
        is_nude: isNude,
        is_members_only: isMembersOnly || isNude,
        is_free_all: isFreeAll,
        free_percent: !isFreeAll ? freePercent : 100,
      }),
    });

    if (res.ok) { setSaved(true); setTimeout(() => router.push(`/post/${id}`), 1000); }
    else { const d = await res.json(); setError(d.error || "Failed to save."); setSaving(false); }
  };

  const inputStyle: React.CSSProperties = { width: "100%", padding: "9px 12px", borderRadius: 3, fontSize: 15 };
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: "bold", color: "var(--text-3)", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 5 };

  const toggleStyle = (active: boolean, color = "var(--accent)"): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
    border: `1px solid ${active ? color : "var(--border)"}`,
    borderRadius: 3, background: active ? `${color}12` : "transparent",
    cursor: "pointer", transition: "all 0.12s", width: "100%",
  });

  if (loading) return <AppShell><div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-3)" }}>Loading...</div></AppShell>;

  return (
    <AppShell>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <button onClick={() => router.push(`/post/${id}`)} style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: "var(--text-3)", fontSize: 13, cursor: "pointer", marginBottom: 16, padding: 0, fontFamily: "var(--font-sans)" }}>
          <ArrowLeft size={14} /> Back to post
        </button>
        <h1 style={{ fontSize: 20, fontWeight: "bold", color: "var(--text)", marginBottom: 16 }}>Edit Post</h1>

        {saved && <div style={{ padding: "12px 16px", marginBottom: 14, background: "#1a3a2a", border: "1px solid var(--green)", borderRadius: 3, display: "flex", alignItems: "center", gap: 8, color: "var(--green)", fontSize: 13 }}><CheckCircle size={15} /> Saved. Redirecting...</div>}
        {error && <div style={{ padding: "12px 16px", marginBottom: 14, background: "#3a1a1a", border: "1px solid var(--red)", borderRadius: 3, display: "flex", alignItems: "center", gap: 8, color: "var(--red)", fontSize: 13 }}><AlertCircle size={15} /> {error}</div>}

        <div style={{ display: "grid", gap: 12 }}>
          {/* Metadata */}
          <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 3, padding: "18px", display: "grid", gap: 14 }}>
            <div><label style={labelStyle}>Title *</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} maxLength={120} /></div>
            <div><label style={labelStyle}>Character Name *</label><input type="text" value={character} onChange={(e) => setCharacter(e.target.value)} style={inputStyle} maxLength={80} /></div>
            <div><label style={labelStyle}>Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} style={{ ...inputStyle, resize: "vertical", minHeight: 88 }} maxLength={1000} /></div>
            <div>
              <label style={labelStyle}><span style={{ display: "flex", alignItems: "center", gap: 5 }}><Tag size={11} /> Tags</span></label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {ALL_TAGS.map((t) => {
                  const active = tags.includes(t);
                  return <button key={t} type="button" onClick={() => setTags((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])} style={{ padding: "4px 12px", border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`, borderRadius: 2, background: active ? "var(--accent)" : "transparent", color: active ? "#000" : "var(--text-2)", fontSize: 12, fontFamily: "var(--font-sans)", cursor: "pointer" }}>{t}</button>;
                })}
              </div>
            </div>
          </div>

          {/* Content Settings */}
          <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 3, padding: "14px 18px" }}>
            <div style={{ fontSize: 12, fontWeight: "bold", color: "var(--text-3)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>Content Settings</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

              <button type="button" onClick={() => { setIsNude(!isNude); if (!isNude) setIsMembersOnly(true); }} style={toggleStyle(isNude, "var(--red)")}>
                <AlertTriangle size={15} color={isNude ? "var(--red)" : "var(--text-3)"} />
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ fontSize: 13, fontWeight: "bold", color: isNude ? "var(--red)" : "var(--text)" }}>Konten Dewasa (18+)</div>
                  <div style={{ fontSize: 11, color: "var(--text-3)" }}>Tampilkan badge 18+ dan wajib login untuk melihat</div>
                </div>
                <div style={{ width: 32, height: 18, borderRadius: 9, background: isNude ? "var(--red)" : "var(--bg-3)", border: `1px solid ${isNude ? "var(--red)" : "var(--border)"}`, position: "relative", transition: "all 0.15s", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: 2, left: isNude ? 14 : 2, width: 12, height: 12, borderRadius: "50%", background: "white", transition: "left 0.15s" }} />
                </div>
              </button>

              <button type="button" onClick={() => setIsMembersOnly(!isMembersOnly)} style={toggleStyle(isMembersOnly)}>
                <Crown size={15} color={isMembersOnly ? "var(--accent)" : "var(--text-3)"} />
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ fontSize: 13, fontWeight: "bold", color: isMembersOnly ? "var(--accent)" : "var(--text)" }}>Members Only</div>
                  <div style={{ fontSize: 11, color: "var(--text-3)" }}>Batasi akses hanya untuk member berbayar</div>
                </div>
                <div style={{ width: 32, height: 18, borderRadius: 9, background: isMembersOnly ? "var(--accent)" : "var(--bg-3)", border: `1px solid ${isMembersOnly ? "var(--accent)" : "var(--border)"}`, position: "relative", transition: "all 0.15s", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: 2, left: isMembersOnly ? 14 : 2, width: 12, height: 12, borderRadius: "50%", background: "white", transition: "left 0.15s" }} />
                </div>
              </button>

              {isMembersOnly && (
                <div style={{ marginLeft: 14, padding: "12px 14px", background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 3 }}>
                  <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 10 }}><Lock size={11} style={{ display: "inline", marginRight: 5 }} />Berapa % konten yang bisa dilihat user biasa?</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[{ label: "Semua gratis", value: "free_all" }, { label: "Sebagian gratis", value: "partial" }, { label: "Semua dikunci", value: "locked" }].map((opt) => {
                      const active = opt.value === "free_all" ? isFreeAll : opt.value === "locked" ? !isFreeAll && freePercent === 0 : !isFreeAll && freePercent > 0;
                      return <button key={opt.value} type="button" onClick={() => { if (opt.value === "free_all") { setIsFreeAll(true); setFreePercent(100); } else if (opt.value === "locked") { setIsFreeAll(false); setFreePercent(0); } else { setIsFreeAll(false); setFreePercent(30); } }} style={{ padding: "5px 12px", border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`, borderRadius: 2, background: active ? "var(--accent)" : "transparent", color: active ? "#000" : "var(--text-2)", fontSize: 12, fontFamily: "var(--font-sans)", cursor: "pointer" }}>{opt.label}</button>;
                    })}
                  </div>
                  {!isFreeAll && freePercent > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-3)", marginBottom: 5 }}>
                        <span>User biasa bisa lihat {freePercent}% foto</span>
                      </div>
                      <input type="range" min={5} max={95} step={5} value={freePercent} onChange={(e) => setFreePercent(parseInt(e.target.value))} style={{ width: "100%", accentColor: "var(--accent)" }} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <button onClick={handleSave} disabled={saving || saved} style={{ padding: "11px", background: saving || saved ? "var(--bg-3)" : "var(--accent)", color: saving || saved ? "var(--text-3)" : "#000", border: "none", borderRadius: 3, fontSize: 14, fontWeight: "bold", fontFamily: "var(--font-sans)", cursor: saving || saved ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
            {saving ? <><Loader size={14} style={{ animation: "spin 1s linear infinite" }} /> Saving...</> : saved ? <><CheckCircle size={14} /> Saved</> : <><Save size={14} /> Save Changes</>}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AppShell>
  );
}