"use client";

import { useEffect, useState } from "react";
import { Crown, Check, Calendar, MessageCircle } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { authClient } from "@/lib/auth-client";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface SubData {
  is_member: boolean;
  subscription: {
    status: string;
    started_at: string;
    expires_at: string;
    amount: number;
    plan: { name: string; price: number };
  } | null;
}

const BENEFITS = [
  "Akses semua foto di setiap post tanpa batas",
  "Lihat konten eksklusif members-only",
  "Akses konten dewasa (18+)",
  "Multi download all file for easy access",
];

// Ganti nomor WA admin di sini
const ADMIN_WA = "6285796182078";

export default function MembershipPage() {
  const { data: session } = authClient.useSession();
  const [subData, setSubData] = useState<SubData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/membership/status")
      .then((r) => r.json())
      .then(setSubData)
      .finally(() => setLoading(false));
  }, []);

  const waMessage = session
    ? encodeURIComponent(
        `Halo, saya ingin berlangganan PustakaFoto Member.\n\nEmail: ${session.user.email}\nNama: ${session.user.name}\n\nMohon konfirmasi pembayaran Rp 14.999/bulan.`
      )
    : "";

  const waUrl = `https://wa.me/${ADMIN_WA}?text=${waMessage}`;

  return (
    <AppShell>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 0" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56,
            background: "rgba(192,160,96,0.12)",
            border: "1px solid var(--accent-dim)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 12px",
          }}>
            <Crown size={26} color="var(--accent)" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: "bold", color: "var(--text)", marginBottom: 6 }}>
            PustakaFoto Membership
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6 }}>
            Akses penuh ke semua konten eksklusif dari para cosplayer terbaik.
          </p>
        </div>

        {/* Active member banner */}
        {!loading && subData?.is_member && subData.subscription && (
          <div style={{
            background: "rgba(192,160,96,0.08)",
            border: "1px solid var(--accent-dim)",
            borderRadius: 3, padding: "14px 16px", marginBottom: 20,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <Crown size={18} color="var(--accent)" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: "bold", color: "var(--accent)" }}>
                Kamu sudah Member!
              </div>
              <div style={{ fontSize: 12, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                <Calendar size={11} />
                Aktif hingga {formatDate(subData.subscription.expires_at)}
              </div>
            </div>
          </div>
        )}

        {/* Pricing card */}
        <div style={{
          background: "var(--bg-2)",
          border: "1px solid var(--border-2)",
          borderRadius: 4, overflow: "hidden", marginBottom: 16,
        }}>
          {/* Price */}
          <div style={{
            padding: "20px 22px", borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "baseline", gap: 6,
          }}>
            <span style={{ fontSize: 28, fontWeight: "bold", color: "var(--accent)" }}>
              Rp 14.999
            </span>
            <span style={{ fontSize: 14, color: "var(--text-3)" }}>/bulan</span>
            <span style={{
              marginLeft: "auto", fontSize: 11, padding: "2px 8px",
              background: "rgba(68,170,102,0.12)", border: "1px solid var(--green)",
              color: "var(--green)", borderRadius: 2,
            }}>
              30 hari
            </span>
          </div>

          {/* Benefits */}
          <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
            {BENEFITS.map((b) => (
              <div key={b} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                <Check size={14} color="var(--green)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>{b}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ padding: "0 22px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
            {subData?.is_member ? (
              <div style={{
                padding: "11px", textAlign: "center",
                background: "var(--bg-3)", border: "1px solid var(--border)",
                borderRadius: 3, color: "var(--text-3)", fontSize: 13,
              }}>
                Membership aktif — hubungi admin untuk perpanjang
              </div>
            ) : session ? (
              <>
                {/* How to subscribe steps */}
                <div style={{
                  padding: "12px 14px", background: "var(--bg-3)",
                  border: "1px solid var(--border)", borderRadius: 3,
                  fontSize: 12, color: "var(--text-2)", lineHeight: 1.8,
                }}>
                  <div style={{ fontWeight: "bold", color: "var(--text)", marginBottom: 6 }}>Cara berlangganan:</div>
                  <div>1. Transfer <strong style={{ color: "var(--accent)" }}>Rp 14.999</strong> ke rekening admin</div>
                  <div>2. Kirim bukti transfer via WhatsApp</div>
                  <div>3. Membership diaktifkan dalam 1×24 jam</div>
                </div>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "12px",
                    background: "#25D366",
                    color: "white", borderRadius: 3,
                    fontWeight: "bold", fontSize: 14, textDecoration: "none",
                  }}
                >
                  <MessageCircle size={16} />
                  Konfirmasi via WhatsApp
                </a>
              </>
            ) : (
              <Link href="/auth/login" style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "12px", background: "var(--accent)", color: "#000",
                borderRadius: 3, fontWeight: "bold", fontSize: 14, textDecoration: "none",
              }}>
                <Crown size={15} /> Login untuk Berlangganan
              </Link>
            )}
          </div>
        </div>

        <div style={{ fontSize: 11, color: "var(--text-3)", textAlign: "center", lineHeight: 1.6 }}>
          Pembayaran diproses manual oleh admin.<br />
          Hubungi admin via WhatsApp untuk info rekening.
        </div>
      </div>
    </AppShell>
  );
}