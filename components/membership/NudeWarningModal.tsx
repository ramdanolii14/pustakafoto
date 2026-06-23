"use client";

import { AlertTriangle, X } from "lucide-react";

interface NudeWarningModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function NudeWarningModal({ onConfirm, onCancel }: NudeWarningModalProps) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16,
    }}>
      <div style={{
        background: "var(--bg-2)",
        border: "1px solid var(--border-2)",
        borderRadius: 4,
        padding: "28px 24px",
        maxWidth: 380, width: "100%",
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 14, textAlign: "center",
      }}>
        <div style={{
          width: 52, height: 52,
          background: "rgba(204,68,68,0.12)",
          border: "1px solid var(--red)",
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <AlertTriangle size={24} color="var(--red)" />
        </div>

        <div>
          <h2 style={{ fontSize: 17, fontWeight: "bold", color: "var(--text)", marginBottom: 8 }}>
            Konten Dewasa (18+)
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>
            Post ini mengandung konten dewasa. Dengan melanjutkan, kamu menyatakan bahwa kamu berusia 18 tahun atau lebih.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, width: "100%" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: "10px",
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: 3, color: "var(--text-2)",
              fontSize: 13, fontFamily: "var(--font-sans)",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
            }}
          >
            <X size={13} /> Kembali
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: "10px",
              background: "var(--red)",
              border: "none",
              borderRadius: 3, color: "white",
              fontSize: 13, fontWeight: "bold",
              fontFamily: "var(--font-sans)",
              cursor: "pointer",
            }}
          >
            Ya, saya 18+
          </button>
        </div>
      </div>
    </div>
  );
}