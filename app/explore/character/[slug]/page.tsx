import type { Metadata } from "next";
import { Sword } from "lucide-react";
import { getAdminClient } from "@/lib/supabase";
import ExploreClient from "@/components/dashboard/ExploreClient";

interface Props {
  params: Promise<{ slug: string }>;
}

const BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://pustakafoto.nyanpixel.my.id";

function slugToDisplay(slug: string): string {
  return decodeURIComponent(slug)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function getCharacterStats(slug: string) {
  const db = getAdminClient();
  const term = decodeURIComponent(slug).replace(/-/g, " ");

  const { count } = await db
    .from("posts")
    .select("id", { count: "exact", head: true })
    .ilike("character_name", `%${term}%`);

  // Top upvoted thumbnail as OG image
  const { data: samples } = await db
    .from("posts")
    .select("thumbnail_key, character_name")
    .ilike("character_name", `%${term}%`)
    .order("upvotes", { ascending: false })
    .limit(1);

  const r2Dev = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_DEV_URL!;
  const thumbnail = samples?.[0]?.thumbnail_key
    ? `${r2Dev}/${samples[0].thumbnail_key}`
    : null;

  // Use the actual character_name from DB for better display
  const exactName = samples?.[0]?.character_name || slugToDisplay(slug);

  return { count: count || 0, exactName, thumbnail };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { count, exactName, thumbnail } = await getCharacterStats(slug);
  const url = `${BASE}/explore/character/${slug}`;

  const title = `${exactName} Cosplay Photos (${count} posts) — PustakaFoto`;
  const description = `Browse ${count} ${exactName} cosplay photo${count !== 1 ? "s" : ""} on PustakaFoto. Find the best ${exactName} costumes from the cosplay community.`;

  return {
    title,
    description,
    keywords: [
      `${exactName} cosplay`,
      `${exactName} cosplay photos`,
      `${exactName} costume`,
      `${exactName} cosplayer`,
      "cosplay archive",
      "anime cosplay",
      "PustakaFoto",
    ],
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: "PustakaFoto",
      images: thumbnail
        ? [{ url: thumbnail, width: 1200, height: 630, alt: `${exactName} cosplay` }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: thumbnail ? [thumbnail] : [],
    },
    robots: { index: true, follow: true },
  };
}

export default async function CharacterExplorePage({ params }: Props) {
  const { slug } = await params;
  const { count, exactName, thumbnail } = await getCharacterStats(slug);
  const url = `${BASE}/explore/character/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${exactName} Cosplay Photos`,
    description: `${count} ${exactName} cosplay photos on PustakaFoto`,
    url,
    numberOfItems: count,
    image: thumbnail || undefined,
    about: {
      "@type": "Thing",
      name: exactName,
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE },
        { "@type": "ListItem", position: 2, name: "Dashboard", item: `${BASE}/dashboard` },
        { "@type": "ListItem", position: 3, name: `${exactName} Cosplay`, item: url },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ExploreClient
        type="character"
        slug={slug}
        displayName={exactName}
        icon={<Sword size={20} />}
        totalCount={count}
      />
    </>
  );
}