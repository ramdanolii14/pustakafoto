import type { Metadata } from "next";
import DashboardClient from "./DashboardClient";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pustakafoto.nyanpixel.my.id";

export const metadata: Metadata = {
  title: "PustakaFoto - Cosplay Photo Archive",
  description:
    "Browse and discover thousands of cosplay photos. Search by character, series, tags, and more. A community-driven cosplay photo archive.",
  keywords: [
    "cosplay", "cosplay photos", "cosplay archive", "cosplay gallery",
    "anime cosplay", "game cosplay", "cosplay community",
    "cosplay photography", "costume", "cosplayer",
    "PustakaFoto", "cosplay leaked gallery", "cosplay leak gallery",
    "cosplay stuff"
  ],
  authors: [{ name: "Ramdan Olii" }],
  creator: "PustakaFoto",
  publisher: "PustakaFoto",
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: `${baseUrl}/dashboard`,
  },
  openGraph: {
    type: "website",
    url: `${baseUrl}/dashboard`,
    title: "PustakaFoto - Cosplay Photo Archive",
    description:
      "Browse and discover cosplay photos. Search by character, series, and tags. A community cosplay photo archive.",
    siteName: "PustakaFoto",
    images: [
      {
        url: `${baseUrl}/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: "PustakaFoto - Cosplay Photo Archive",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PustakaFoto - Cosplay Photo Archive",
    description: "Browse and discover cosplay photos. A community cosplay photo archive.",
    images: [`${baseUrl}/og-default.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    // Isi setelah dapet kode verifikasi Google Search Console
    // google: "VERIFICATION_CODE_HERE",
  },
};

export default function DashboardPage() {
  return <DashboardClient />;
}
