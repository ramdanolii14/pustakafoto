import Link from "next/link";
import { BookImage } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{
      borderTop: "1px solid var(--border)",
      background: "var(--bg-2)",
      marginTop: 40,
      padding: "20px 16px",
    }}>
      <div style={{
        maxWidth: 1400, margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-3)", fontSize: 12 }}>
          <BookImage size={13} color="var(--accent)" />
          <span>© {year} PustakaFoto</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12 }}>
          <Link href="/privacy-policy" style={{ color: "var(--text-3)", textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}>
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" style={{ color: "var(--text-3)", textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}>
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}