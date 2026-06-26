"use client";

import Navbar from "./Navbar";
import Footer from "./Footer";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "16px", width: "100%", flex: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}