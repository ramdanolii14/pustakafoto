interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sublabel?: string;
  color?: string;
}

export default function StatCard({ icon, label, value, sublabel, color = "var(--accent)" }: StatCardProps) {
  return (
    <div style={{
      background: "var(--bg-2)", border: "1px solid var(--border)",
      borderRadius: 3, padding: "14px 16px",
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </span>
        <div style={{ color, opacity: 0.8 }}>{icon}</div>
      </div>
      <div style={{ fontSize: 24, fontWeight: "bold", color: "var(--text)" }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      {sublabel && (
        <div style={{ fontSize: 11, color: "var(--text-3)" }}>{sublabel}</div>
      )}
    </div>
  );
}