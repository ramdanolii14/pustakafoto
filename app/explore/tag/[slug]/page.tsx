import type { Metadata } from "next";
import { Hash } from "lucide-react";
import { getAdminClient } from "@/lib/supabase";
import ExploreClient from "@/components/dashboard/ExploreClient";

interface Props {
  params: Promise<{ slug: string }>;
}

const BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://pustakafoto.nyanpixel.my.id";

async function getTagStats(slug: string) {
  const db = getAdminClient();
  const tagName = slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();

  const { count } = await db
    .from("posts")
    .select("id", { count: "exact", head: true })
    .overlaps("tags", [tagName]);

  // Get a few thumbnails for OG image fallback
  const { data: samples } = await db
    .from("posts")
    .select("thumbnail_key")
    .overlaps("tags", [tagName])
    .order("upvotes", { ascending: false })
    .limit(1);

  const r2Dev = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_DEV_URL!;
  const thumbnail = samples?.[0]?.thumbnail_key
    ? `${r2Dev}/${samples[0].thumbnail_key}`
    : null;

  return { count: count || 0, tagName, thumbnail };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { count, tagName, thumbnail } = await getTagStats(slug);

  const title = `${tagName} Cosplay Photos (${count} posts) — PustakaFoto`;
  const description = `Browse ${count} cosplay photo${count !== 1 ? "s" : ""} tagged "${tagName}" on PustakaFoto. Discover the best ${tagName} cosplay from the community.`;
  const url = `${BASE}/explore/tag/${slug}`;

  return {
    title,
    description,
    keywords: [
      `${tagName} cosplay`,
      `${tagName} cosplay photos`,
      `${tagName} cosplay gallery`,
      "cosplay archive",
      "PustakaFoto",
      tagName,
    ],
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: "PustakaFoto",
      images: thumbnail
        ? [{ url: thumbnail, width: 1200, height: 630, alt: `${tagName} cosplay photos` }]
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

export default async function TagExplorePage({ params }: Props) {
  const { slug } = await params;
  const { count, tagName, thumbnail } = await getTagStats(slug);
  const url = `${BASE}/explore/tag/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${tagName} Cosplay Photos`,
    description: `${count} cosplay photos tagged ${tagName} on PustakaFoto`,
    url,
    numberOfItems: count,
    image: thumbnail || undefined,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE },
        { "@type": "ListItem", position: 2, name: "Dashboard", item: `${BASE}/dashboard` },
        { "@type": "ListItem", position: 3, name: `${tagName} Cosplay`, item: url },
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
        type="tag"
        slug={slug}
        displayName={tagName}
        icon={<Hash size={20} />}
        totalCount={count}
      />
    </>
  );
}