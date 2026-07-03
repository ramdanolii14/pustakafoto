"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Tag, Trash2, Images, Pencil, Crown, Shield } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import PhotoGrid from "@/components/post/PhotoGrid";
import VoteBar from "@/components/post/VoteBar";
import CommentSection from "@/components/post/CommentSection";
import DownloadAllButton from "@/components/post/DownloadAllButton";
import BookmarkButton from "@/components/post/BookmarkButton";
import RelatedPosts from "@/components/post/RelatedPosts";
import MemberGate from "@/components/membership/MemberGate";
import MemberBadge from "@/components/membership/MemberBadge";
import NudeWarningModal from "@/components/membership/NudeWarningModal";
import { authClient } from "@/lib/auth-client";
import { formatDate } from "@/lib/utils";

const CDN_HOST = "cdn.pustakafoto.nyanpixel.my.id";
function cfImg(url: string, width: number, quality = 70): string {
  try {
    const u = new URL(url);
    if (u.hostname === CDN_HOST || u.hostname.endsWith(".r2.dev") || u.hostname.endsWith(".r2.cloudflarestorage.com")) {
      return `${u.origin}/cdn-cgi/image/width=${width},quality=${quality},format=webp${u.pathname}`;
    }
  } catch {}
  return url;
}

function toCharSlug(name: string): string {
  return encodeURIComponent(name.toLowerCase().replace(/\s+/g, "-"));
}

export default function PostDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [nudeConfirmed, setNudeConfirmed] = useState(false);
  const [showNudeModal, setShowNudeModal] = useState(false);

  // Check sessionStorage on mount — once confirmed 18+, don't ask again this session
  useEffect(() => {
    if (typeof window === "undefined") return;
    const confirmed = sessionStorage.getItem("pustakafoto_18_confirmed");
    if (confirmed === "true") setNudeConfirmed(true);
  }, []);
  const [forcingMembersOnly, setForcingMembersOnly] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/posts/${id}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setData)
      .catch(() => router.push("/dashboard"))
      .finally(() => setLoading(false));
  }, [id, router]);

  useEffect(() => {
    if (!session) return;
    fetch("/api/admin?action=users&page=1").then((r) => setIsAdmin(r.ok && r.status !== 403));
    fetch("/api/membership/status").then((r) => r.json()).then((d) => setIsMember(d.is_member));
  }, [session]);

  // Show nude modal if needed
  useEffect(() => {
    if (data?.post?.is_nude && session && !nudeConfirmed) {
      setShowNudeModal(true);
    }
  }, [data, session, nudeConfirmed]);

  const handleDelete = async () => {
    if (!confirm("Delete this post and all its files?")) return;
    setDeleting(true);
    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/dashboard");
    else { alert("Failed to delete."); setDeleting(false); }
  };

  const handleForceMembers = async (force: boolean) => {
    setForcingMembersOnly(true);
    await fetch(`/api/admin/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ forced_members_only: force }),
    });
    setData((prev: any) => ({
      ...prev,
      post: { ...prev.post, forced_members_only: force, is_members_only: force },
    }));
    setForcingMembersOnly(false);
  };

  if (loading) return <AppShell><div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-3)" }}>Loading...</div></AppShell>;
  if (!data) return null;

  const { post, files, comments } = data;
  const isOwner = session?.user.id === post.user_id;
  const canEdit = isOwner || isAdmin;

  // Gating logic
  const effectiveMembersOnly = post.is_members_only || post.forced_members_only;
  const canSeeAll = isMember || isOwner || isAdmin;

  // Nude: must be logged in
  const nudeBlocked = post.is_nude && !session;
  const nudeNeedsConfirm = post.is_nude && session && !nudeConfirmed;

  // How many files to show
  let visibleFiles = files;
  let lockedCount = 0;

  if (!canSeeAll) {
    // Post has any restriction
    if (effectiveMembersOnly || post.is_nude) {
      if (post.is_free_all) {
        // All free — show everything even to non-members
        visibleFiles = files;
        lockedCount = 0;
      } else if ((post.free_percent || 0) === 0) {
        // All locked
        visibleFiles = [];
        lockedCount = files.length;
      } else {
        // Partial — show free_percent
        const freeCount = Math.floor((files.length * (post.free_percent || 0)) / 100);
        visibleFiles = files.slice(0, Math.max(freeCount, 0));
        lockedCount = files.length - visibleFiles.length;
      }
    }
  }

  const showGate = lockedCount > 0 && !canSeeAll;

  return (
    <AppShell>
      {/* Nude warning modal */}
      {showNudeModal && (
        <NudeWarningModal
          onConfirm={() => {
            setNudeConfirmed(true);
            setShowNudeModal(false);
            if (typeof window !== "undefined") {
              sessionStorage.setItem("pustakafoto_18_confirmed", "true");
            }
          }}
          onCancel={() => router.back()}
        />
      )}

      <button onClick={() => router.back()} style={{
        display: "flex", alignItems: "center", gap: 6,
        background: "transparent", border: "none",
        color: "var(--text-3)", fontSize: 13, cursor: "pointer",
        marginBottom: 14, padding: 0, fontFamily: "var(--font-sans)",
      }}>
        <ArrowLeft size={14} /> Back
      </button>

      {/* Banner */}
      {post.thumbnail_url && !nudeNeedsConfirm && (
        <div style={{
          width: "100%", height: 340, overflow: "hidden",
          borderRadius: 4, marginBottom: 12, position: "relative",
          background: "var(--bg-3)",
        }}>
          <img
            src={cfImg(post.thumbnail_url, 1200, 80)}
            alt={post.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
          />
          {/* Blur if nude and not confirmed */}
          {post.is_nude && !nudeConfirmed && (
            <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(20px)", background: "rgba(0,0,0,0.5)" }} />
          )}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.1) 50%, transparent 100%)",
          }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 22px" }}>
            <h1 style={{ fontSize: 26, fontWeight: "bold", color: "#fff", lineHeight: 1.2, marginBottom: 4, textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
              {post.title}
            </h1>
            <Link href={`/explore/character/${toCharSlug(post.character_name)}`} style={{ fontSize: 15, color: "var(--accent)", fontStyle: "italic", textDecoration: "none", textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>
              {post.character_name}
            </Link>
          </div>
        </div>
      )}

      {/* Header card */}
      <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 3, padding: "14px 18px", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {!post.thumbnail_url && (
              <>
                <h1 style={{ fontSize: 24, fontWeight: "bold", color: "var(--text)", lineHeight: 1.2, marginBottom: 4 }}>{post.title}</h1>
                <Link href={`/explore/character/${toCharSlug(post.character_name)}`} style={{ fontSize: 16, color: "var(--accent)", fontStyle: "italic", marginBottom: 10, display: "block", textDecoration: "none" }}>
                  {post.character_name}
                </Link>
              </>
            )}

            {/* Badges */}
            <div style={{ marginBottom: 8 }}>
              <MemberBadge isMembersOnly={effectiveMembersOnly} isNude={post.is_nude} />
              {post.forced_members_only && (
                <span style={{ fontSize: 10, color: "var(--text-3)", marginTop: 3, display: "block" }}>
                  ⚡ Set members-only oleh admin
                </span>
              )}
            </div>

            {post.description && <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 12 }}>{post.description}</p>}

            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 14, fontSize: 12, color: "var(--text-3)" }}>
              <Link href={`/profile/${post.user_id}`} style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-2)", textDecoration: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-2)")}>
                {post.author?.image
                  ? <img src={post.author.image} alt={post.author.name} style={{ width: 18, height: 18, borderRadius: "50%", objectFit: "cover" }} />
                  : <User size={12} />}
                {post.author?.name || "Unknown"}
              </Link>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={12} /> {formatDate(post.created_at)}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Images size={12} /> {post.file_count} file{post.file_count !== 1 ? "s" : ""}</span>
            </div>

            {post.tags?.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                <Tag size={11} color="var(--text-3)" />
                {post.tags.map((t: string) => (
                  <Link key={t} href={`/explore/tag/${t.toLowerCase()}`} style={{
                    fontSize: 11, padding: "2px 8px", border: "1px solid var(--border)",
                    borderRadius: 2, color: "var(--text-3)", textDecoration: "none",
                  }}
                    onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--accent-dim)"; el.style.color = "var(--accent)"; }}
                    onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--border)"; el.style.color = "var(--text-3)"; }}>
                    {t}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
            <VoteBar postId={post.id} initialUpvotes={post.upvotes} initialDownvotes={post.downvotes} initialVote={post.user_vote} isLoggedIn={!!session} />

            <BookmarkButton postId={post.id} isLoggedIn={!!session} />
            {canSeeAll && files.length > 0 && <DownloadAllButton postId={post.id} fileCount={files.length} postTitle={post.title} />}

            {!canSeeAll && !session && (
              <Link href="/auth/login" style={{
                display: "flex", alignItems: "center", gap: 5, padding: "7px 12px",
                background: "transparent", border: "1px solid var(--accent-dim)",
                color: "var(--accent)", borderRadius: 3, fontSize: 12, textDecoration: "none",
              }}>
                <Crown size={12} /> Login untuk akses penuh
              </Link>
            )}

            {!canSeeAll && session && !isMember && (
              <Link href="/membership" style={{
                display: "flex", alignItems: "center", gap: 5, padding: "7px 12px",
                background: "var(--accent)", color: "#000",
                borderRadius: 3, fontSize: 12, fontWeight: "bold", textDecoration: "none",
              }}>
                <Crown size={12} /> Jadi Member
              </Link>
            )}

            {canEdit && (
              <Link href={`/edit/${post.id}`} style={{
                display: "flex", alignItems: "center", gap: 5, padding: "7px 12px",
                background: "transparent", border: "1px solid var(--border-2)",
                color: "var(--text-2)", borderRadius: 3, fontSize: 12, textDecoration: "none",
              }}>
                <Pencil size={12} /> Edit Post
              </Link>
            )}

            {/* Admin: force members only toggle */}
            {isAdmin && (
              <button
                onClick={() => handleForceMembers(!post.forced_members_only)}
                disabled={forcingMembersOnly}
                style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "7px 12px",
                  background: post.forced_members_only ? "rgba(192,160,96,0.12)" : "transparent",
                  border: `1px solid ${post.forced_members_only ? "var(--accent)" : "var(--border)"}`,
                  color: post.forced_members_only ? "var(--accent)" : "var(--text-3)",
                  borderRadius: 3, fontSize: 11, cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                }}
              >
                <Shield size={11} />
                {post.forced_members_only ? "Unforce Members Only" : "Force Members Only"}
              </button>
            )}

            {canEdit && (
              <button onClick={handleDelete} disabled={deleting} style={{
                display: "flex", alignItems: "center", gap: 5, padding: "7px 12px",
                background: "transparent", border: "1px solid var(--red)",
                color: "var(--red)", borderRadius: 3, fontSize: 12,
                fontFamily: "var(--font-sans)", cursor: deleting ? "wait" : "pointer",
              }}>
                <Trash2 size={12} /> {deleting ? "Deleting..." : "Delete Post"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Nude login gate */}
      {nudeBlocked && (
        <div style={{
          padding: "30px", textAlign: "center",
          border: "1px solid var(--border)", borderRadius: 3,
          background: "var(--bg-2)", marginBottom: 12,
        }}>
          <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 14 }}>
            Konten ini memerlukan login untuk ditampilkan.
          </p>
          <Link href="/auth/login" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "9px 20px", background: "var(--accent)", color: "#000",
            borderRadius: 3, fontWeight: "bold", fontSize: 13, textDecoration: "none",
          }}>
            Login untuk melihat
          </Link>
        </div>
      )}

      {/* Photo grid */}
      {!nudeBlocked && !nudeNeedsConfirm && (
        <>
          {visibleFiles.length > 0 ? (
            <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 3, padding: "14px", marginBottom: 12 }}>
              <PhotoGrid files={visibleFiles} pageSize={27} />
            </div>
          ) : (
            <div style={{ padding: "30px", textAlign: "center", border: "1px solid var(--border)", borderRadius: 3, color: "var(--text-3)", fontSize: 13, marginBottom: 12, background: "var(--bg-2)" }}>
              No photos attached to this post.
            </div>
          )}

          {/* Member gate */}
          {showGate && (
            <div style={{ marginBottom: 12 }}>
              <MemberGate lockedCount={lockedCount} totalCount={files.length} isNude={post.is_nude} />
            </div>
          )}
        </>
      )}

      {/* Comments */}
      <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 3, padding: "16px 18px" }}>
        <CommentSection postId={post.id} initialComments={comments} currentUserId={session?.user.id} isAdmin={isAdmin} />
      </div>

      {/* Related Posts */}
      <RelatedPosts
        postId={post.id}
        character={post.character_name}
        tags={post.tags || []}
      />
    </AppShell>
  );
}