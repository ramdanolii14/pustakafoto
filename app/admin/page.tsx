"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield, Users, FileText, MessageSquare,
  Trash2, Ban, CheckCircle, Search, Loader,
  ChevronRight, UserCheck, Crown
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { authClient } from "@/lib/auth-client";
import { formatDate } from "@/lib/utils";

type Tab = "posts" | "comments" | "users";

export default function AdminPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("posts");
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [banReason, setBanReason] = useState("");
  const [banTarget, setBanTarget] = useState<string | null>(null);

  // Check admin
  useEffect(() => {
    if (isPending) return;
    if (!session) { router.push("/auth/login"); return; }

    fetch(`/api/admin?action=users&page=1`)
      .then((r) => {
        if (r.status === 403) { setIsAdmin(false); router.push("/dashboard"); }
        else setIsAdmin(true);
      })
      .catch(() => setIsAdmin(false));
  }, [session, isPending, router]);

  const fetchData = async (t: Tab, p: number, q = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ action: t, page: String(p) });
      if (q) params.set("q", q);
      const res = await fetch(`/api/admin?${params}`);
      const d = await res.json();
      const key = t === "posts" ? "posts" : t === "comments" ? "comments" : "users";
      setData(d[key] || []);
      setTotal(d.total || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchData(tab, 1, search);
  }, [isAdmin, tab]);

  const adminAction = async (action: string, target_id: string, extra?: any) => {
    setActionLoading(target_id + action);
    try {
      await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, target_id, ...extra }),
      });
      fetchData(tab, page, search);
    } finally {
      setActionLoading(null);
      setBanTarget(null);
      setBanReason("");
    }
  };

  const tabStyle = (t: Tab): React.CSSProperties => ({
    padding: "8px 16px",
    border: "none",
    borderBottom: `2px solid ${tab === t ? "var(--accent)" : "transparent"}`,
    background: "transparent",
    color: tab === t ? "var(--accent)" : "var(--text-2)",
    fontSize: 13,
    fontWeight: tab === t ? "bold" : "normal",
    fontFamily: "var(--font-sans)",
    cursor: "pointer",
  });

  const perPage = 30;
  const hasMore = page * perPage < total;

  if (isPending || isAdmin === null) {
    return (
      <AppShell>
        <div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-3)" }}>Loading...</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Ban modal */}
      {banTarget && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.8)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        }}>
          <div style={{
            background: "var(--bg-2)", border: "1px solid var(--border)",
            borderRadius: 4, padding: 24, width: "100%", maxWidth: 380,
          }}>
            <h3 style={{ fontSize: 16, fontWeight: "bold", color: "var(--text)", marginBottom: 12 }}>
              Ban User
            </h3>
            <input
              type="text"
              placeholder="Reason (optional)"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              style={{ width: "100%", padding: "8px 10px", borderRadius: 3, fontSize: 13, marginBottom: 12 }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => adminAction("ban_user", banTarget, { reason: banReason || "Banned by admin" })}
                style={{
                  flex: 1, padding: "9px",
                  background: "var(--red)", border: "none", borderRadius: 3,
                  color: "white", fontSize: 13, fontWeight: "bold",
                  fontFamily: "var(--font-sans)", cursor: "pointer",
                }}
              >
                Confirm Ban
              </button>
              <button
                onClick={() => { setBanTarget(null); setBanReason(""); }}
                style={{
                  flex: 1, padding: "9px",
                  background: "var(--bg-3)", border: "1px solid var(--border)",
                  borderRadius: 3, color: "var(--text-2)", fontSize: 13,
                  fontFamily: "var(--font-sans)", cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Shield size={18} color="var(--accent)" />
        <h1 style={{ fontSize: 20, fontWeight: "bold", color: "var(--text)" }}>Admin Panel</h1>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", borderBottom: "1px solid var(--border)",
        marginBottom: 14, background: "var(--bg-2)",
        border: "1px solid var(--border)", borderRadius: "3px 3px 0 0",
      }}>
        <button onClick={() => { setTab("posts"); setPage(1); }} style={tabStyle("posts")}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <FileText size={13} /> Posts
          </span>
        </button>
        <button onClick={() => { setTab("comments"); setPage(1); }} style={tabStyle("comments")}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <MessageSquare size={13} /> Comments
          </span>
        </button>
        <button onClick={() => { setTab("users"); setPage(1); }} style={tabStyle("users")}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Users size={13} /> Users
          </span>
        </button>
      </div>

      {/* Search (users only) */}
      {tab === "users" && (
        <div style={{ position: "relative", marginBottom: 10 }}>
          <Search size={13} color="var(--text-3)"
            style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text" placeholder="Search users by name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); fetchData("users", 1, e.target.value); }}
            style={{ width: "100%", padding: "8px 10px 8px 30px", borderRadius: 3, fontSize: 13 }}
          />
        </div>
      )}

      {/* Count */}
      <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 8 }}>
        {total.toLocaleString()} {tab}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-3)" }}>
          <Loader size={20} style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
        </div>
      ) : (
        <div style={{
          background: "var(--bg-2)", border: "1px solid var(--border)",
          borderRadius: 3, overflow: "hidden",
        }}>
          {data.length === 0 && (
            <div style={{ padding: "30px", textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>
              No {tab} found.
            </div>
          )}

          {/* Posts table */}
          {tab === "posts" && data.map((p: any) => (
            <div key={p.id} style={{
              padding: "10px 14px",
              borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: "bold", color: "var(--text)", marginBottom: 2 }}>
                  {p.title}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>
                  {p.character_name} · by {(p.user as any)?.name || "Unknown"} · {formatDate(p.created_at)} · {p.file_count} files · {p.upvotes} up
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => window.open(`/post/${p.id}`, "_blank")}
                  style={{
                    padding: "4px 10px", background: "transparent",
                    border: "1px solid var(--border)", borderRadius: 3,
                    color: "var(--text-2)", fontSize: 11, cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                    display: "flex", alignItems: "center", gap: 4,
                  }}
                >
                  <ChevronRight size={11} /> View
                </button>
                <button
                  onClick={() => adminAction("delete_post", p.id)}
                  disabled={actionLoading === p.id + "delete_post"}
                  style={{
                    padding: "4px 10px", background: "transparent",
                    border: "1px solid var(--red)", borderRadius: 3,
                    color: "var(--red)", fontSize: 11, cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                    display: "flex", alignItems: "center", gap: 4,
                  }}
                >
                  <Trash2 size={11} /> Delete
                </button>
              </div>
            </div>
          ))}

          {/* Comments table */}
          {tab === "comments" && data.map((c: any) => (
            <div key={c.id} style={{
              padding: "10px 14px",
              borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "flex-start", gap: 12,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: "var(--text)", marginBottom: 3, lineHeight: 1.5 }}>
                  {c.content}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>
                  by {(c.author as any)?.name || "Unknown"} · {formatDate(c.created_at)}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => window.open(`/post/${c.post_id}`, "_blank")}
                  style={{
                    padding: "4px 10px", background: "transparent",
                    border: "1px solid var(--border)", borderRadius: 3,
                    color: "var(--text-2)", fontSize: 11, cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                    display: "flex", alignItems: "center", gap: 4,
                  }}
                >
                  <ChevronRight size={11} /> Post
                </button>
                <button
                  onClick={() => adminAction("delete_comment", c.id)}
                  disabled={actionLoading === c.id + "delete_comment"}
                  style={{
                    padding: "4px 10px", background: "transparent",
                    border: "1px solid var(--red)", borderRadius: 3,
                    color: "var(--red)", fontSize: 11, cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                    display: "flex", alignItems: "center", gap: 4,
                  }}
                >
                  <Trash2 size={11} /> Delete
                </button>
              </div>
            </div>
          ))}

          {/* Users table */}
          {tab === "users" && data.map((u: any) => (
            <div key={u.id} style={{
              padding: "10px 14px",
              borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
              background: u.banned ? "rgba(204,68,68,0.05)" : "transparent",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                {u.image ? (
                  <img src={u.image} alt={u.name} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "var(--bg-3)", border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <Users size={14} color="var(--text-3)" />
                  </div>
                )}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: "bold", color: u.banned ? "var(--red)" : "var(--text)" }}>
                      {u.name}
                    </span>
                    {u.role === "admin" && (
                      <span style={{ fontSize: 9, fontWeight: "bold", padding: "1px 5px", background: "var(--accent)", color: "#000", borderRadius: 2 }}>
                        ADMIN
                      </span>
                    )}
                    {u.banned && (
                      <span style={{ fontSize: 9, fontWeight: "bold", padding: "1px 5px", background: "var(--red)", color: "white", borderRadius: 2 }}>
                        BANNED
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-3)" }}>
                    {u.email} · Joined {formatDate(u.createdAt)}
                    {u.banned_reason && ` · Reason: ${u.banned_reason}`}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
                <button
                  onClick={() => window.open(`/profile/${u.id}`, "_blank")}
                  style={{
                    padding: "4px 8px", background: "transparent",
                    border: "1px solid var(--border)", borderRadius: 3,
                    color: "var(--text-2)", fontSize: 11, cursor: "pointer",
                    fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", gap: 3,
                  }}
                >
                  <ChevronRight size={11} /> Profile
                </button>

                {u.id !== session?.user.id && (
                  <>
                    {u.banned ? (
                      <button
                        onClick={() => adminAction("unban_user", u.id)}
                        style={{
                          padding: "4px 8px", background: "transparent",
                          border: "1px solid var(--green)", borderRadius: 3,
                          color: "var(--green)", fontSize: 11, cursor: "pointer",
                          fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", gap: 3,
                        }}
                      >
                        <CheckCircle size={11} /> Unban
                      </button>
                    ) : (
                      <button
                        onClick={() => setBanTarget(u.id)}
                        style={{
                          padding: "4px 8px", background: "transparent",
                          border: "1px solid var(--red)", borderRadius: 3,
                          color: "var(--red)", fontSize: 11, cursor: "pointer",
                          fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", gap: 3,
                        }}
                      >
                        <Ban size={11} /> Ban
                      </button>
                    )}

                    {u.role !== "admin" ? (
                      <button
                        onClick={() => adminAction("set_role", u.id, { role: "admin" })}
                        style={{
                          padding: "4px 8px", background: "transparent",
                          border: "1px solid var(--accent-dim)", borderRadius: 3,
                          color: "var(--accent)", fontSize: 11, cursor: "pointer",
                          fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", gap: 3,
                        }}
                      >
                        <Crown size={11} /> Make Admin
                      </button>
                    ) : (
                      <button
                        onClick={() => adminAction("set_role", u.id, { role: "user" })}
                        style={{
                          padding: "4px 8px", background: "transparent",
                          border: "1px solid var(--border)", borderRadius: 3,
                          color: "var(--text-3)", fontSize: 11, cursor: "pointer",
                          fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", gap: 3,
                        }}
                      >
                        <UserCheck size={11} /> Remove Admin
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {(hasMore || page > 1) && (
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 14 }}>
          {page > 1 && (
            <button
              onClick={() => { const p = page - 1; setPage(p); fetchData(tab, p, search); }}
              style={{
                padding: "7px 16px", background: "var(--bg-2)",
                border: "1px solid var(--border-2)", borderRadius: 3,
                color: "var(--text)", fontSize: 12, fontFamily: "var(--font-sans)", cursor: "pointer",
              }}
            >
              Prev
            </button>
          )}
          <span style={{ padding: "7px 12px", fontSize: 12, color: "var(--text-3)" }}>
            Page {page}
          </span>
          {hasMore && (
            <button
              onClick={() => { const p = page + 1; setPage(p); fetchData(tab, p, search); }}
              style={{
                padding: "7px 16px", background: "var(--bg-2)",
                border: "1px solid var(--border-2)", borderRadius: 3,
                color: "var(--text)", fontSize: 12, fontFamily: "var(--font-sans)", cursor: "pointer",
              }}
            >
              Next
            </button>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AppShell>
  );
}