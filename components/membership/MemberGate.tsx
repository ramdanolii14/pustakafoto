"use client";

import { Crown, Lock } from "lucide-react";
import Link from "next/link";

interface MemberGateProps {
  lockedCount: number;
  totalCount: number;
  isNude?: boolean;
}

export default function MemberGate({ lockedCount, totalCount, isNude }: MemberGateProps) {
  return (
    <div style={{
      border: "1px solid var(--border-2)",
      borderRadius: 3,
      overflow: "hidden",
      background: "var(--bg-2)",
      marginTop: 6,
    }}>
      {/* Blurred preview grid */}
      <div style={{
        position: "relative",
        padding: "20px",
        textAlign: "center",
        background: "linear-gradient(to bottom, var(--bg-3), var(--bg-2))",
      }}>
        {/* Lock icon grid visual */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 4,
          maxWidth: 280,
          margin: "0 auto 20px",
          opacity: 0.25,
          filter: "blur(2px)",
        }}>
          {Array.from({ length: Math.min(lockedCount, 8) }).map((_, i) => (
            <div key={i} style={{
              aspectRatio: "3/4",
              background: "var(--bg-3)",
              borderRadius: 2,
              border: "1px solid var(--border)",
            }} />
          ))}
        </div>

        {/* Overlay */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}>
          <div style={{
            width: 48, height: 48,
            background: "rgba(192,160,96,0.12)",
            border: "1px solid var(--accent-dim)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Lock size={22} color="var(--accent)" />
          </div>

          <div>
            <div style={{ fontSize: 15, fontWeight: "bold", color: "var(--text)", marginBottom: 4 }}>
              {lockedCount} foto dikunci
            </div>
            <div style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.5 }}>
              {isNude
                ? "Konten ini mengandung materi dewasa dan hanya tersedia untuk member."
                : `${lockedCount} dari ${totalCount} foto hanya tersedia untuk member.`}
            </div>
          </div>

          <div style={{
            background: "var(--bg-3)",
            border: "1px solid var(--border)",
            borderRadius: 3,
            padding: "10px 16px",
            fontSize: 13,
            color: "var(--text-2)",
          }}>
            <span style={{ color: "var(--accent)", fontWeight: "bold" }}>Rp 14.999</span>
            {" "}/ bulan — akses semua konten eksklusif
          </div>

          <Link href="/membership" style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "10px 24px",
            background: "var(--accent)",
            color: "#000",
            borderRadius: 3,
            fontWeight: "bold",
            fontSize: 14,
            textDecoration: "none",
          }}>
            <Crown size={15} />
            Jadi Member
          </Link>
        </div>
      </div>
    </div>
  );
}