import { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pustakafoto.nyanpixel.my.id";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  // Only fetch posts if Supabase is configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return staticRoutes;
  }

  try {
    const { getAdminClient } = await import("@/lib/supabase");
    const db = getAdminClient();

    const { data: posts } = await db
      .from("posts")
      .select("id, updated_at")
      .order("created_at", { ascending: false })
      .limit(1000);

    const postUrls: MetadataRoute.Sitemap = (posts || []).map((p: any) => ({
      url: `${baseUrl}/post/${p.id}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [...staticRoutes, ...postUrls];
  } catch {
    return staticRoutes;
  }
}
