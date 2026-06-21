import { ShieldOff } from "lucide-react";

export default function BannedPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    }}>
      <div style={{
        textAlign: "center",
        maxWidth: 400,
      }}>
        <ShieldOff size={48} color="var(--red)" style={{ margin: "0 auto 16px" }} />
        <h1 style={{ fontSize: 22, fontWeight: "bold", color: "var(--text)", marginBottom: 8 }}>
          Account Banned
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6 }}>
          Your account has been banned from PustakaFoto. If you believe this is a mistake, contact the administrator at developer@nyanpixel.my.id.
        </p>
      </div>
    </div>
  );
}