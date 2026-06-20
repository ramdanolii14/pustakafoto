import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PustakaFoto — Cosplay Archive",
  description: "A community cosplay photo archive",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
