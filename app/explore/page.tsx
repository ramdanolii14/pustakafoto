import type { Metadata } from "next";
import ExploreOverviewClient from "./ExploreOverviewClient";

const BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://pustakafoto.nyanpixel.my.id";

export const metadata: Metadata = {
  title: "Explore — PustakaFoto",
  description: "Jelajahi semua tag dan karakter cosplay di PustakaFoto. Temukan foto cosplay favorit berdasarkan karakter anime, game, dan film.",
  alternates: { canonical: `${BASE}/explore` },
  openGraph: {
    type: "website",
    url: `${BASE}/explore`,
    title: "Explore Media Cosplay - PustakaFoto",
    description: "Jelajahi semua tag dan karakter cosplay di PustakaFoto.",
    siteName: "PustakaFoto",
  },
  robots: { index: true, follow: true },
};

export default function ExplorePage() {
  return <ExploreOverviewClient />;
}