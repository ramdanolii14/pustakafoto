"use client";

interface BarChartProps {
  data: { name: string; count: number }[];
  color?: string;
}

export default function BarChart({ data, color = "var(--accent)" }: BarChartProps) {
  if (data.length === 0) {
    return <div style={{ padding: "20px 0", textAlign: "center", color: "var(--text-3)", fontSize: 12 }}>No data</div>;
  }

  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {data.map((d) => {
        const pct = (d.count / max) * 100;
        return (
          <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 80, fontSize: 12, color: "var(--text-2)",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              flexShrink: 0,
            }}>
              {d.name}
            </div>
            <div style={{ flex: 1, position: "relative", height: 18, background: "var(--bg-3)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                position: "absolute", inset: "0 auto 0 0",
                width: `${pct}%`,
                background: color,
                borderRadius: 2,
                transition: "width 0.3s ease",
              }} />
            </div>
            <div style={{ width: 32, fontSize: 12, color: "var(--text)", fontWeight: "bold", textAlign: "right", flexShrink: 0 }}>
              {d.count}
            </div>
          </div>
        );
      })}
    </div>
  );
}