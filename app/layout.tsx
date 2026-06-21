import type { Metadata } from "next";
import "./globals.css";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pustakafoto.nyanpixel.my.id";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "PustakaFoto — Cosplay Photo Archive",
    template: "%s | PustakaFoto",
  },
  description: "A community-driven cosplay photo archive. Browse, discover, and share cosplay photos.",
  keywords: ["cosplay", "cosplay archive", "cosplay photos", "anime cosplay", "PustakaFoto"],
  openGraph: {
    siteName: "PustakaFoto",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body>{children}</body>
    </html>
  );
}
