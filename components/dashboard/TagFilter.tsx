"use client";

import { useEffect, useState } from "react";
import { Tag } from "lucide-react";

interface TagItem {
  id: string;
  name: string;
  slug: string;
}

interface TagFilterProps {
  selected: string[];
  onChange: (tags: string[]) => void;
}

export default function TagFilter({ selected, onChange }: TagFilterProps) {
  const [tags, setTags] = useState<TagItem[]>([]);

  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then((d) => setTags(d.tags || []));
  }, []);

  if (tags.length === 0) return null;

  // Kirim name (Title Case) bukan slug
  const toggle = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter((s) => s !== name));
    } else {
      onChange([...selected, name]);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <Tag size={13} color="var(--text-3)" />
      {tags.map((t) => {
        const active = selected.includes(t.name);
        return (
          <button
            key={t.id}
            onClick={() => toggle(t.name)}
            style={{
              padding: "3px 10px",
              borderRadius: 2,
              border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
              background: active ? "var(--accent)" : "transparent",
              color: active ? "#000" : "var(--text-2)",
              fontSize: 12,
              fontWeight: active ? "bold" : "normal",
              fontFamily: "var(--font-sans)",
              cursor: "pointer",
              transition: "all 0.12s",
            }}
          >
            {t.name}
          </button>
        );
      })}
      {selected.length > 0 && (
        <button
          onClick={() => onChange([])}
          style={{
            padding: "3px 8px",
            borderRadius: 2,
            border: "1px solid var(--border)",
            background: "transparent",
            color: "var(--text-3)",
            fontSize: 11,
            fontFamily: "var(--font-sans)",
            cursor: "pointer",
          }}
        >
          Clear
        </button>
      )}
    </div>
  );
}