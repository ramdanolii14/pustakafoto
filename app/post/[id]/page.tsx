import type { Metadata } from "next";
import { getAdminClient } from "@/lib/supabase";
import PostDetailClient from "./PostDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

// Fetch post server-side for metadata
async function getPost(id: string) {
  const db = getAdminClient();
  const r2Dev = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_DEV_URL!;

  const { data: post } = await db
    .from("posts")
    .select(`id, title, character_name, description, tags, thumbnail_key, file_count, upvotes, downvotes, created_at, user:user_id (id, name, image)`)
    .eq("id", id)
    .single();

  if (!post) return null;

  return {
    ...post,
    thumbnail_url: `${r2Dev}/${(post as any).thumbnail_key}`,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pustakafoto.nyanpixel.my.id";

  if (!post) {
    return {
      title: "Post Not Found — PustakaFoto",
    };
  }

  const p = post as any;
  const title = `${p.title} — ${p.character_name} | PustakaFoto`;
  const description = [
    p.description,
    `${p.file_count} photo${p.file_count !== 1 ? "s" : ""}`,
    `${p.upvotes} upvote${p.upvotes !== 1 ? "s" : ""}`,
    p.tags?.length > 0 ? `Tags: ${p.tags.join(", ")}` : null,
    `By ${p.user?.name || "Unknown"}`,
    `Uploaded on ${new Date(p.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const url = `${baseUrl}/post/${id}`;

  return {
    title,
    description,
    keywords: [
      "cosplay",
      "cosplay photo",
      p.character_name,
      p.title,
      ...(p.tags || []),
      "PustakaFoto",
      p.user?.name,
    ].filter(Boolean),
    authors: [{ name: p.user?.name || "Unknown" }],
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: "PustakaFoto",
      images: p.thumbnail_url
        ? [
            {
              url: p.thumbnail_url,
              width: 1200,
              height: 630,
              alt: `${p.title} — ${p.character_name}`,
            },
          ]
        : [],
      publishedTime: p.created_at,
      tags: p.tags || [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: p.thumbnail_url ? [p.thumbnail_url] : [],
    },
    alternates: {
      canonical: url,
    },
    other: {
      // Extra Open Graph
      "og:image:width": "1200",
      "og:image:height": "630",
      // Schema.org structured data embedded as JSON-LD
    },
  };
}

export default async function PostDetailPage({ params }: Props) {
  const { id } = await params;
  const post = await getPost(id);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pustakafoto.nyanpixel.my.id";

  // JSON-LD structured data
  const jsonLd = post
    ? {
        "@context": "https://schema.org",
        "@type": "ImageGallery",
        name: (post as any).title,
        description: (post as any).description || `${(post as any).character_name} cosplay`,
        url: `${baseUrl}/post/${id}`,
        image: (post as any).thumbnail_url,
        author: {
          "@type": "Person",
          name: (post as any).user?.name || "Unknown",
        },
        datePublished: (post as any).created_at,
        interactionStatistic: [
          {
            "@type": "InteractionCounter",
            interactionType: "https://schema.org/LikeAction",
            userInteractionCount: (post as any).upvotes,
          },
        ],
        keywords: (post as any).tags?.join(", "),
        numberOfItems: (post as any).file_count,
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <PostDetailClient id={id} />
    </>
  );
}
