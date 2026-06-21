"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookImage } from "lucide-react";
import { authClient } from "@/lib/auth-client";

// Google brand color SVG icon
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session) router.push("/dashboard");
  }, [session, router]);

  const handleGoogleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    }}>
      <div style={{
        width: "100%",
        maxWidth: 360,
        background: "var(--bg-2)",
        border: "1px solid var(--border)",
        borderRadius: 4,
        padding: 32,
        display: "flex",
        flexDirection: "column",
        gap: 24,
        alignItems: "center",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, marginBottom: 4,
            color: "var(--accent)", fontSize: 26, fontWeight: "bold",
          }}>
            <BookImage size={28} />
            PustakaFoto
          </div>
          <p style={{ color: "var(--text-3)", fontSize: 13 }}>
            Cosplay photo archive
          </p>
        </div>

        <div style={{ width: "100%", borderTop: "1px solid var(--border)" }} />

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: 14, color: "var(--text-2)", textAlign: "center" }}>
            Sign in to upload and interact
          </p>

          <button
            onClick={handleGoogleLogin}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "11px 16px",
              background: "var(--bg-3)",
              border: "1px solid var(--border-2)",
              borderRadius: 3,
              color: "var(--text)",
              fontSize: 14,
              fontWeight: "bold",
              fontFamily: "var(--font-sans)",
              cursor: "pointer",
              transition: "border-color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-dim)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border-2)";
            }}
          >
            <GoogleIcon />
            Continue with Google
          </button>
        </div>

        <p style={{ fontSize: 11, color: "var(--text-3)", textAlign: "center", lineHeight: 1.6 }}>
          By signing in you agree to share your Google account name and profile photo with PustakaFoto.
        </p>
      </div>
    </div>
  );
}