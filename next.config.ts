// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  async headers() {
    return [
      {
        // Baseline security headers on every route (pages + API).
        source: "/(.*)",
        headers: [
          // Prevent the site from being embedded in an <iframe> on another
          // origin (clickjacking protection).
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Stop browsers from guessing content types away from what the
          // server declared (helps prevent some XSS/MIME-sniffing tricks).
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Don't leak the full referring URL to other origins.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Force HTTPS for this domain (and subdomains) going forward.
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};

export default nextConfig;