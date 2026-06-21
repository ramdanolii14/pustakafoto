import type { Metadata } from "next";
import { Hash } from "lucide-react";
import ExploreClient from "@/components/dashboard/ExploreClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const name = slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();
  return {
    title: `${name} Cosplay`,
    description: `Browse all cosplay photos tagged with ${name} on PustakaFoto.`,
  };
}

export default async function TagExplorePage({ params }: Props) {
  const { slug } = await params;
  const name = slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();

  return (
    <ExploreClient
      type="tag"
      slug={slug}
      displayName={name}
      icon={<Hash size={20} />}
    />
  );
}