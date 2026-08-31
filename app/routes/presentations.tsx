import fs from "node:fs/promises";
import path from "node:path";
import { useLoaderData } from "react-router";
import type { Route } from "./+types/presentations";
import { PresentationCard } from "~/components/PresentationCard";

interface PresentationMetadata {
  title: string;
  slug: string;
  description: string;
  date: string;
  tags: string[];
  thumbnail?: string;
  hidden?: boolean;
  theme: {
    font: string;
    color: string;
  };
}

export async function loader() {
  // Discover all converted presentations by scanning the content directory
  const contentDir = path.join(process.cwd(), "public", "presentations", "content");
  let slugs: string[] = [];
  try {
    const entries = await fs.readdir(contentDir, { withFileTypes: true });
    slugs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  } catch (error) {
    console.error("Failed to read presentations content directory:", error);
  }

  const presentations: PresentationMetadata[] = [];

  for (const slug of slugs) {
    try {
      const metadataPath = path.join(contentDir, slug, "metadata.json");
      const raw = await fs.readFile(metadataPath, "utf-8");
      presentations.push(JSON.parse(raw));
    } catch (error) {
      console.error(`Failed to load metadata for ${slug}:`, error);
    }
  }

  // Sort by date (newest first)
  presentations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Hidden presentations stay reachable at their direct /presentations/<slug>
  // URL but are omitted from this gallery listing.
  const visiblePresentations = presentations.filter((p) => !p.hidden);

  return { presentations: visiblePresentations };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Presentations - Özgün Bal" },
    { name: "description", content: "Presentations and slide decks" },
  ];
}

export default function Presentations({ loaderData }: Route.ComponentProps) {
  const { presentations } = loaderData;

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--color-foreground)' }}>
          Presentations
        </h1>
        <p className="text-lg" style={{ color: 'var(--color-muted-foreground)' }}>
          Browse through my presentations and slide decks
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {presentations.map((presentation) => (
          <PresentationCard
            key={presentation.slug}
            slug={presentation.slug}
            title={presentation.title}
            description={presentation.description}
            date={presentation.date}
            tags={presentation.tags}
            thumbnail={presentation.thumbnail}
          />
        ))}
      </div>

      {presentations.length === 0 && (
        <div className="text-center py-12">
          <p style={{ color: 'var(--color-muted-foreground)' }}>
            No presentations available yet.
          </p>
        </div>
      )}
    </main>
  );
}
