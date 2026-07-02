"use client";

import { useState } from "react";

interface LineChartProps {
  data: number[];
  labels: string[]; // dates, same length as data
  color?: string;
  height?: number;
  formatValue?: (v: number) => string;
}

export default function LineChart({
  data,
  labels,
  color = "var(--accent)",
  height = 120,
  formatValue = (v) => String(v),
}: LineChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (data.length === 0) {
    return <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)", fontSize: 12 }}>No data</div>;
  }

  const W = 600; // viewBox width (scales responsively)
  const H = height;
  const PAD_TOP = 10;
  const PAD_BOTTOM = 4;
  const max = Math.max(...data, 1);
  const min = 0;
  const range = max - min || 1;

  const stepX = data.length > 1 ? W / (data.length - 1) : 0;

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = PAD_TOP + (1 - (v - min) / range) * (H - PAD_TOP - PAD_BOTTOM);
    return { x, y, v };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x.toFixed(1)},${H} L0,${H} Z`;

  const gradId = `grad-${color.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div style={{ position: "relative" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height, display: "block", overflow: "visible" }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path d={areaPath} fill={`url(#${gradId})`} />

        {/* Line */}
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {/* Hover dot + vertical guide */}
        {hoverIdx !== null && (
          <>
            <line
              x1={points[hoverIdx].x} y1={PAD_TOP}
              x2={points[hoverIdx].x} y2={H}
              stroke="var(--border-2)" strokeWidth="1" strokeDasharray="3,3"
            />
            <circle cx={points[hoverIdx].x} cy={points[hoverIdx].y} r="4" fill={color} stroke="var(--bg-2)" strokeWidth="2" />
          </>
        )}

        {/* Invisible hover targets */}
        {points.map((p, i) => (
          <rect
            key={i}
            x={i === 0 ? 0 : p.x - stepX / 2}
            y={0}
            width={stepX || W}
            height={H}
            fill="transparent"
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
            style={{ cursor: "pointer" }}
          />
        ))}
      </svg>

      {/* Tooltip */}
      {hoverIdx !== null && (
        <div style={{
          position: "absolute",
          left: `${(points[hoverIdx].x / W) * 100}%`,
          top: 0,
          transform: "translate(-50%, -100%)",
          background: "var(--bg-3)",
          border: "1px solid var(--border-2)",
          borderRadius: 3,
          padding: "4px 8px",
          fontSize: 11,
          color: "var(--text)",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          marginTop: -6,
          zIndex: 10,
        }}>
          <div style={{ fontWeight: "bold" }}>{formatValue(points[hoverIdx].v)}</div>
          <div style={{ color: "var(--text-3)", fontSize: 10 }}>
            {new Date(labels[hoverIdx]).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </div>
        </div>
      )}
    </div>
  );
}