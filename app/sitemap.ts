import { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://pustakafoto.nyanpixel.my.id";

export const dynamic = "force-dynamic";

const ALL_TAGS = ["solo","group","outdoor","indoor","anime","game","original","event","studio","concept"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/dashboard`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/explore`, lastModified: new Date(), changeFrequency: "daily", priority: 0.95 },
  ];

  // Tag explore pages — static, always indexed
  const tagRoutes: MetadataRoute.Sitemap = ALL_TAGS.map((tag) => ({
    url: `${BASE}/explore/tag/${tag}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return [...staticRoutes, ...tagRoutes];
  }

  try {
    const { getAdminClient } = await import("@/lib/supabase");
    const db = getAdminClient();

    // All posts
    const { data: posts } = await db
      .from("posts")
      .select("id, updated_at")
      .order("created_at", { ascending: false })
      .limit(5000);

    const postRoutes: MetadataRoute.Sitemap = (posts || []).map((p: any) => ({
      url: `${BASE}/post/${p.id}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // All unique characters — each gets their own explore page
    const { data: chars } = await db
      .from("posts")
      .select("character_name");

    const uniqueChars = [...new Set((chars || []).map((c: any) =>
      c.character_name?.toLowerCase().replace(/\s+/g, "-")
    ))].filter(Boolean);

    const charRoutes: MetadataRoute.Sitemap = uniqueChars.map((slug: any) => ({
      url: `${BASE}/explore/character/${encodeURIComponent(slug)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));

    return [...staticRoutes, ...tagRoutes, ...charRoutes, ...postRoutes];
  } catch {
    return [...staticRoutes, ...tagRoutes];
  }
}