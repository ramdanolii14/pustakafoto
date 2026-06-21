import type { Metadata } from "next";
import { Sword } from "lucide-react";
import ExploreClient from "@/components/dashboard/ExploreClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const name = decodeURIComponent(slug).replace(/-/g, " ");
  const display = name.replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title: `${display} Cosplay`,
    description: `Browse all ${display} cosplay photos on PustakaFoto.`,
  };
}

export default async function CharacterExplorePage({ params }: Props) {
  const { slug } = await params;
  const name = decodeURIComponent(slug).replace(/-/g, " ");
  const display = name.replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <ExploreClient
      type="character"
      slug={slug}
      displayName={display}
      icon={<Sword size={20} />}
    />
  );
}