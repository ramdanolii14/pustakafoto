import { Crown, AlertTriangle } from "lucide-react";

interface MemberBadgeProps {
  isMembersOnly?: boolean;
  isNude?: boolean;
  small?: boolean;
}

export default function MemberBadge({ isMembersOnly, isNude, small }: MemberBadgeProps) {
  if (!isMembersOnly && !isNude) return null;
  const size = small ? 9 : 10;
  const pad = small ? "1px 5px" : "2px 7px";
  const fs = small ? 9 : 10;

  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {isMembersOnly && (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 3,
          fontSize: fs, fontWeight: "bold", padding: pad,
          background: "rgba(192,160,96,0.15)",
          border: "1px solid var(--accent-dim)",
          color: "var(--accent)", borderRadius: 2,
        }}>
          <Crown size={size} /> MEMBER
        </span>
      )}
      {isNude && (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 3,
          fontSize: fs, fontWeight: "bold", padding: pad,
          background: "rgba(204,68,68,0.12)",
          border: "1px solid var(--red)",
          color: "var(--red)", borderRadius: 2,
        }}>
          <AlertTriangle size={size} /> 18+
        </span>
      )}
    </div>
  );
}