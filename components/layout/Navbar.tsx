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
    fetch(`/api/admin?action=users&page=1`)
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
    }}>
      <div style={{
        maxWidth: 1400, margin: "0 auto", padding: "0 16px",
        height: 48, display: "flex", alignItems: "center", gap: 16,
      }}>
        <Link href="/dashboard" style={{
          color: "var(--accent)", fontWeight: "bold", fontSize: 20,
          letterSpacing: "-0.5px", display: "flex", alignItems: "center",
          gap: 6, textDecoration: "none",
        }}>
          <BookImage size={20} />
          PustakaFoto
        </Link>

        <div style={{ flex: 1 }} />

        {session ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {isAdmin && (
              <Link href="/admin" style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "5px 10px",
                background: "transparent",
                border: "1px solid var(--accent-dim)",
                color: "var(--accent)", borderRadius: 3, fontSize: 12,
                textDecoration: "none", fontWeight: "bold",
              }}>
                <Shield size={12} /> Admin
              </Link>
            )}

            <Link href="/upload" style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "5px 12px", background: "var(--accent)", color: "#000",
              borderRadius: 3, fontSize: 13, fontWeight: "bold", textDecoration: "none",
            }}>
              <Upload size={13} /> Upload
            </Link>

            <Link href={`/profile/${session.user.id}`} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "4px 10px", background: "var(--bg-3)",
              border: "1px solid var(--border)", borderRadius: 3,
              fontSize: 13, color: "var(--text-2)", textDecoration: "none",
            }}>
              {session.user.image ? (
                <img
                  src={session.user.image} alt={session.user.name}
                  style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <User size={14} />
              )}
              <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {session.user.name}
              </span>
            </Link>

            <button
              onClick={handleSignOut}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "5px 10px", background: "transparent",
                border: "1px solid var(--border)", color: "var(--text-3)",
                borderRadius: 3, fontSize: 13,
              }}
              title="Sign out"
            >
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <Link href="/auth/login" style={{
            padding: "5px 14px", background: "var(--accent)", color: "#000",
            borderRadius: 3, fontSize: 13, fontWeight: "bold", textDecoration: "none",
          }}>
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}