"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Upload, BookImage, User, Shield, Crown, Menu, X, Bookmark } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!session) { setIsAdmin(false); return; }
    fetch("/api/admin?action=users&page=1")
      .then((r) => setIsAdmin(r.ok && r.status !== 403))
      .catch(() => setIsAdmin(false));
  }, [session]);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, []);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <header style={{
        background: "var(--bg-2)",
        borderBottom: "1px solid var(--border)",
        position: "sticky", top: 0, zIndex: 50,
        width: "100%", boxSizing: "border-box",
      }}>
        <div style={{
          width: "100%", maxWidth: 1400, margin: "0 auto",
          padding: "0 12px", height: 48,
          display: "flex", alignItems: "center", gap: 8,
          boxSizing: "border-box",
        }}>
          {/* Logo */}
          <Link href="/dashboard" onClick={() => setMenuOpen(false)} style={{
            color: "var(--accent)", fontWeight: "bold", fontSize: 18,
            letterSpacing: "-0.3px", display: "flex", alignItems: "center",
            gap: 5, textDecoration: "none", flexShrink: 0, whiteSpace: "nowrap",
          }}>
            <BookImage size={18} />
            <span>PustakaFoto</span>
          </Link>

          <div style={{ flex: 1 }} />

          {session ? (
            <>
              {/* ── Desktop nav (hidden on mobile via CSS) ── */}
              <div className="nav-desktop" style={{
                display: "flex", alignItems: "center", gap: 6,
              }}>
                {isAdmin && (
                  <Link href="/admin" style={{
                    display: "flex", alignItems: "center", gap: 4, padding: "5px 8px",
                    background: "transparent", border: "1px solid var(--accent-dim)",
                    color: "var(--accent)", borderRadius: 3, fontSize: 11,
                    textDecoration: "none", fontWeight: "bold",
                  }}>
                    <Shield size={11} /> Admin
                  </Link>
                )}
                <Link href="/membership" style={{
                  display: "flex", alignItems: "center", gap: 4, padding: "5px 8px",
                  background: "transparent", border: "1px solid var(--border)",
                  color: "var(--text-3)", borderRadius: 3, fontSize: 11, textDecoration: "none",
                }}>
                  <Crown size={11} /> Member
                </Link>
                <Link href="/bookmarks" style={{
                  display: "flex", alignItems: "center", gap: 4, padding: "5px 8px",
                  background: "transparent", border: "1px solid var(--border)",
                  color: "var(--text-3)", borderRadius: 3, fontSize: 11, textDecoration: "none",
                }}>
                  <Bookmark size={11} /> Saved
                </Link>
                <Link href="/upload" style={{
                  display: "flex", alignItems: "center", gap: 4, padding: "5px 10px",
                  background: "var(--accent)", color: "#000",
                  borderRadius: 3, fontSize: 12, fontWeight: "bold", textDecoration: "none",
                }}>
                  <Upload size={12} /> Upload
                </Link>
                <Link href={`/profile/${session.user.id}`} style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "4px 8px",
                  background: "var(--bg-3)", border: "1px solid var(--border)",
                  borderRadius: 3, fontSize: 12, color: "var(--text-2)", textDecoration: "none",
                }}>
                  {session.user.image
                    ? <img src={session.user.image} alt={session.user.name} style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover" }} />
                    : <User size={14} />}
                  <span style={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {session.user.name}
                  </span>
                </Link>
                <button onClick={handleSignOut} title="Sign out" style={{
                  display: "flex", alignItems: "center", padding: "5px 8px",
                  background: "transparent", border: "1px solid var(--border)",
                  color: "var(--text-3)", borderRadius: 3, cursor: "pointer",
                }}>
                  <LogOut size={13} />
                </button>
              </div>

              {/* ── Mobile nav — icon-only row + hamburger ── */}
              <div className="nav-mobile" style={{
                display: "none", alignItems: "center", gap: 6,
              }}>
                {/* Upload — always visible on mobile, icon only */}
                <Link href="/upload" style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 34, height: 34,
                  background: "var(--accent)", color: "#000",
                  borderRadius: 3, textDecoration: "none", flexShrink: 0,
                }}>
                  <Upload size={15} />
                </Link>

                {/* Avatar */}
                <Link href={`/profile/${session.user.id}`} style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 34, height: 34,
                  background: "var(--bg-3)", border: "1px solid var(--border)",
                  borderRadius: 3, textDecoration: "none", flexShrink: 0, overflow: "hidden",
                }}>
                  {session.user.image
                    ? <img src={session.user.image} alt={session.user.name} style={{ width: 34, height: 34, objectFit: "cover" }} />
                    : <User size={15} color="var(--text-2)" />}
                </Link>

                {/* Hamburger */}
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 34, height: 34, background: "transparent",
                    border: "1px solid var(--border)", borderRadius: 3,
                    color: "var(--text-2)", cursor: "pointer", flexShrink: 0,
                  }}
                  aria-label="Menu"
                >
                  {menuOpen ? <X size={16} /> : <Menu size={16} />}
                </button>
              </div>
            </>
          ) : (
            <Link href="/auth/login" style={{
              padding: "5px 12px", background: "var(--accent)", color: "#000",
              borderRadius: 3, fontSize: 13, fontWeight: "bold", textDecoration: "none",
            }}>
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && session && (
          <div style={{
            background: "var(--bg-2)",
            borderTop: "1px solid var(--border)",
            padding: "8px 12px",
            display: "flex", flexDirection: "column", gap: 4,
          }}>
            {/* User info */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 4px",
              borderBottom: "1px solid var(--border)", marginBottom: 4,
            }}>
              {session.user.image
                ? <img src={session.user.image} alt={session.user.name} style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} />
                : <User size={18} color="var(--text-3)" />}
              <div>
                <div style={{ fontSize: 13, fontWeight: "bold", color: "var(--text)" }}>{session.user.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>{session.user.email}</div>
              </div>
            </div>

            {/* Menu items */}
            {[
              { href: "/membership", icon: <Crown size={14} />, label: "Membership" },
              { href: "/bookmarks", icon: <Bookmark size={14} />, label: "Saved Posts" },
              ...(isAdmin ? [{ href: "/admin", icon: <Shield size={14} />, label: "Admin Panel" }] : []),
            ].map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 10px", borderRadius: 3,
                color: "var(--text-2)", textDecoration: "none", fontSize: 14,
                background: "transparent",
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-3)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}

            {/* Divider + Sign out */}
            <div style={{ borderTop: "1px solid var(--border)", marginTop: 4, paddingTop: 4 }}>
              <button onClick={handleSignOut} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 10px", width: "100%", borderRadius: 3,
                color: "var(--red)", background: "transparent",
                border: "none", fontSize: 14, cursor: "pointer",
                fontFamily: "var(--font-sans)", textAlign: "left",
              }}>
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* CSS breakpoint — hide/show desktop vs mobile nav */}
      <style>{`
        @media (min-width: 640px) {
          .nav-desktop { display: flex !important; }
          .nav-mobile  { display: none !important; }
        }
        @media (max-width: 639px) {
          .nav-desktop { display: none !important; }
          .nav-mobile  { display: flex !important; }
        }
      `}</style>
    </>
  );
}