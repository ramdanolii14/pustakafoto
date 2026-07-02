"use client";

import { useEffect, useState } from "react";
import {
  Users, FileText, MessageSquare, Crown, Images,
  ThumbsUp, ThumbsDown, Ban, AlertTriangle, Lock,
  TrendingUp, DollarSign, Loader, Hash, Award, User,
} from "lucide-react";
import StatCard from "./StatCard";
import LineChart from "./LineChart";
import BarChart from "./BarChart";
import { formatDate } from "@/lib/utils";

interface StatsData {
  totals: {
    users: number;
    posts: number;
    comments: number;
    files: number;
    active_members: number;
    banned_users: number;
    nude_posts: number;
    members_only_posts: number;
    total_upvotes: number;
    total_downvotes: number;
    revenue_30d: number;
  };
  series: {
    days: string[];
    signups: number[];
    posts: number[];
    members: number[];
    revenue: number[];
  };
  top_tags: { name: string; count: number }[];
  top_posts: any[];
  top_uploaders: any[];
}

const CDN_HOST = "cdn.pustakafoto.nyanpixel.my.id";
function cfImg(url: string, width: number, quality = 70): string {
  try {
    const u = new URL(url);
    if (u.hostname === CDN_HOST || u.hostname.endsWith(".r2.dev") || u.hostname.endsWith(".r2.cloudflarestorage.com")) {
      return `${u.origin}/cdn-cgi/image/width=${width},quality=${quality},format=webp${u.pathname}`;
    }
  } catch {}
  return url;
}

function sum(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0);
}

function last7(arr: number[]) {
  return arr.slice(-7);
}

export default function AdminOverview() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "60px 0", textAlign: "center" }}>
        <Loader size={22} color="var(--accent)" style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!stats) {
    return <div style={{ padding: "30px", textAlign: "center", color: "var(--text-3)" }}>Failed to load statistics.</div>;
  }

  const { totals, series, top_tags, top_posts, top_uploaders } = stats;
  const newUsers7d = sum(last7(series.signups));
  const newPosts7d = sum(last7(series.posts));
  const newMembers7d = sum(last7(series.members));
  const totalVotes = totals.total_upvotes + totals.total_downvotes;
  const approvalRate = totalVotes > 0 ? Math.round((totals.total_upvotes / totalVotes) * 100) : 0;

  const sectionTitle: React.CSSProperties = {
    fontSize: 13, fontWeight: "bold", color: "var(--text)",
    marginBottom: 12, display: "flex", alignItems: "center", gap: 6,
  };

  const cardStyle: React.CSSProperties = {
    background: "var(--bg-2)", border: "1px solid var(--border)",
    borderRadius: 3, padding: "16px",
  };

  return (
    <div>
      {/* ── Key metrics grid ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 10, marginBottom: 20,
      }}>
        <StatCard icon={<Users size={16} />} label="Total Users" value={totals.users} sublabel={`+${newUsers7d} last 7 days`} />
        <StatCard icon={<FileText size={16} />} label="Total Posts" value={totals.posts} sublabel={`+${newPosts7d} last 7 days`} />
        <StatCard icon={<Images size={16} />} label="Total Photos" value={totals.files} />
        <StatCard icon={<MessageSquare size={16} />} label="Comments" value={totals.comments} />
        <StatCard icon={<Crown size={16} />} label="Active Members" value={totals.active_members} sublabel={`+${newMembers7d} last 7 days`} color="var(--accent)" />
        <StatCard icon={<DollarSign size={16} />} label="Revenue (30d)" value={`Rp ${totals.revenue_30d.toLocaleString("id-ID")}`} color="var(--green)" />
        <StatCard icon={<ThumbsUp size={16} />} label="Approval Rate" value={`${approvalRate}%`} sublabel={`${totals.total_upvotes} up / ${totals.total_downvotes} down`} color="var(--green)" />
        <StatCard icon={<Ban size={16} />} label="Banned Users" value={totals.banned_users} color="var(--red)" />
      </div>

      {/* ── Content flags row ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 10, marginBottom: 24,
      }}>
        <StatCard icon={<AlertTriangle size={14} />} label="18+ Posts" value={totals.nude_posts} color="var(--red)" />
        <StatCard icon={<Lock size={14} />} label="Members-Only Posts" value={totals.members_only_posts} color="var(--accent)" />
      </div>

      {/* ── Charts: 30-day trends ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 12, marginBottom: 24,
      }}>
        <div style={cardStyle}>
          <div style={sectionTitle}>
            <TrendingUp size={13} color="var(--accent)" /> New Users — Last 30 Days
          </div>
          <LineChart data={series.signups} labels={series.days} color="#4488cc" height={100} />
        </div>

        <div style={cardStyle}>
          <div style={sectionTitle}>
            <FileText size={13} color="var(--accent)" /> New Posts — Last 30 Days
          </div>
          <LineChart data={series.posts} labels={series.days} color="var(--accent)" height={100} />
        </div>

        <div style={cardStyle}>
          <div style={sectionTitle}>
            <Crown size={13} color="var(--accent)" /> Memberships Activated — Last 30 Days
          </div>
          <LineChart data={series.members} labels={series.days} color="#cc8844" height={100} />
        </div>

        <div style={cardStyle}>
          <div style={sectionTitle}>
            <DollarSign size={13} color="var(--green)" /> Revenue — Last 30 Days
          </div>
          <LineChart
            data={series.revenue}
            labels={series.days}
            color="var(--green)"
            height={100}
            formatValue={(v) => `Rp ${v.toLocaleString("id-ID")}`}
          />
        </div>
      </div>

      {/* ── Top tags + Top uploaders ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 12, marginBottom: 24,
      }}>
        <div style={cardStyle}>
          <div style={sectionTitle}>
            <Hash size={13} color="var(--accent)" /> Top Tags
          </div>
          <BarChart data={top_tags} color="var(--accent)" />
        </div>

        <div style={cardStyle}>
          <div style={sectionTitle}>
            <Award size={13} color="var(--accent)" /> Top Uploaders
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {top_uploaders.length === 0 ? (
              <div style={{ fontSize: 12, color: "var(--text-3)", padding: "10px 0" }}>No data</div>
            ) : top_uploaders.map((u, i) => (
              <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  width: 18, fontSize: 12, fontWeight: "bold",
                  color: i === 0 ? "var(--accent)" : "var(--text-3)",
                }}>
                  #{i + 1}
                </span>
                {u.image
                  ? <img src={u.image} alt={u.name} style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                  : <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--bg-3)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><User size={11} color="var(--text-3)" /></div>
                }
                <span style={{ flex: 1, fontSize: 12, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {u.name}
                </span>
                <span style={{ fontSize: 12, fontWeight: "bold", color: "var(--text-2)" }}>
                  {u.post_count} posts
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Top posts table ── */}
      <div style={cardStyle}>
        <div style={sectionTitle}>
          <ThumbsUp size={13} color="var(--accent)" /> Most Upvoted Posts
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {top_posts.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--text-3)", padding: "10px 0" }}>No data</div>
          ) : top_posts.map((p: any, i: number) => (
            <div key={p.id} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 0",
              borderBottom: i < top_posts.length - 1 ? "1px solid var(--border)" : "none",
            }}>
              <span style={{ width: 18, fontSize: 12, fontWeight: "bold", color: i === 0 ? "var(--accent)" : "var(--text-3)" }}>
                #{i + 1}
              </span>
              <div style={{
                width: 36, height: 48, borderRadius: 2, overflow: "hidden",
                background: "var(--bg-3)", flexShrink: 0,
              }}>
                <img src={cfImg(p.thumbnail_url, 80, 60)} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: "bold", color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {p.title}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>{p.character_name}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: "var(--text-3)", flexShrink: 0 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 3, color: "var(--green)" }}>
                  <ThumbsUp size={11} /> {p.upvotes}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <ThumbsDown size={11} /> {p.downvotes}
                </span>
                <span>{p.file_count} photos</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}