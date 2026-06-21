"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Upload, BookImage, User, Shield } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!session) { setIsAdmin(false); return; }
    fetch("/api/admin?action=users&page=1")
      .then((r) => setIsAdmin(r.ok && r.status !== 403))
      .catch(() => setIsAdmin(false));
  }, [session]);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header style={{
      background: "var(--bg-2)",
      borderBottom: "1px solid var(--border)",
      position: "sticky", top: 0, zIndex: 50,
      // Critical for mobile: prevent overflow causing zoom
      width: "100%",
      boxSizing: "border-box",
    }}>
      <div style={{
        // Use 100% width with padding instead of maxWidth centering
        // This prevents the navbar from exceeding viewport on mobile
        width: "100%",
        maxWidth: 1400,
        margin: "0 auto",
        padding: "0 12px",
        height: 48,
        display: "flex",
        alignItems: "center",
        gap: 8,
        boxSizing: "border-box",
        overflow: "hidden",
      }}>
        {/* Logo */}
        <Link href="/dashboard" style={{
          color: "var(--accent)", fontWeight: "bold", fontSize: 18,
          letterSpacing: "-0.3px", display: "flex", alignItems: "center",
          gap: 5, textDecoration: "none", flexShrink: 0,
          whiteSpace: "nowrap",
        }}>
          <BookImage size={18} />
          <span>PustakaFoto</span>
        </Link>

        <div style={{ flex: 1, minWidth: 0 }} />

        {session ? (
          <div style={{
            display: "flex", alignItems: "center",
            gap: 6, flexShrink: 0,
            // Prevent right side from pushing layout wide on mobile
            overflow: "hidden",
          }}>
            {isAdmin && (
              <Link href="/admin" style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "5px 8px",
                background: "transparent",
                border: "1px solid var(--accent-dim)",
                color: "var(--accent)", borderRadius: 3, fontSize: 11,
                textDecoration: "none", fontWeight: "bold",
                flexShrink: 0,
              }}>
                <Shield size={11} />
                <span>Admin</span>
              </Link>
            )}

            <Link href="/upload" style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "5px 10px", background: "var(--accent)", color: "#000",
              borderRadius: 3, fontSize: 12, fontWeight: "bold",
              textDecoration: "none", flexShrink: 0,
            }}>
              <Upload size={12} />
              <span>Upload</span>
            </Link>

            {/* Avatar — mobile: hanya foto, desktop: foto + nama */}
            <Link href={`/profile/${session.user.id}`} style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "4px 8px", background: "var(--bg-3)",
              border: "1px solid var(--border)", borderRadius: 3,
              fontSize: 12, color: "var(--text-2)", textDecoration: "none",
              flexShrink: 0, minWidth: 0,
            }}>
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name}
                  style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                />
              ) : (
                <User size={14} style={{ flexShrink: 0 }} />
              )}
              {/* Name: hidden on very small screens via max-width 0 trick */}
              <span style={{
                maxWidth: "clamp(0px, 20vw, 100px)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {session.user.name}
              </span>
            </Link>

            <button
              onClick={handleSignOut}
              style={{
                display: "flex", alignItems: "center",
                padding: "5px 8px", background: "transparent",
                border: "1px solid var(--border)", color: "var(--text-3)",
                borderRadius: 3, fontSize: 13, flexShrink: 0,
                cursor: "pointer",
              }}
              title="Sign out"
            >
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <Link href="/auth/login" style={{
            padding: "5px 12px", background: "var(--accent)", color: "#000",
            borderRadius: 3, fontSize: 13, fontWeight: "bold",
            textDecoration: "none", flexShrink: 0,
          }}>
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}