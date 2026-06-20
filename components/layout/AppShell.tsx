"use client";

import Navbar from "./Navbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "16px" }}>
        {children}
      </main>
    </div>
  );
}
