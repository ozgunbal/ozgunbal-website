import fs from "node:fs/promises";
import path from "node:path";
import { useLoaderData } from "react-router";
import type { Route } from "./+types/presentations.$slug";
import { PresentationViewer } from "~/components/PresentationViewer";
import { useEffect } from "react";

// Some slides.com exports leave behind empty <video> blocks (a media
// placeholder that never had a source attached). With no src, the browser
// still renders native controls for it, which shows up as a stray floating
// video player over the slide content — strip those blocks out here.
function removeEmptyVideoBlocks(html: string): string {
  return html.replace(
    /<div class="sl-block" data-block-type="video"[\s\S]*?<video(?![^>]*\ssrc=)[^>]*>[\s\S]*?<\/video><\/div><\/div>/g,
    "",
  );
}

export async function loader({ params }: Route.LoaderArgs) {
  const { slug } = params;

  const contentDir = path.join(process.cwd(), "public", "presentations", "content", slug!);
  const metadataPath = path.join(contentDir, "metadata.json");
  const slidesPath = path.join(contentDir, "slides.html");

  let metadata;
  let html;
  try {
    metadata = JSON.parse(await fs.readFile(metadataPath, "utf-8"));
    html = removeEmptyVideoBlocks(await fs.readFile(slidesPath, "utf-8"));
  } catch (error) {
    throw new Response("Presentation not found", { status: 404 });
  }

  return { metadata, slug, html };
}

export function meta({ data }: Route.MetaArgs) {
  if (!data) {
    return [{ title: "Presentation Not Found" }];
  }

  return [
    { title: `${data.metadata.title} - Özgün Bal` },
    { name: "description", content: data.metadata.description || data.metadata.title },
  ];
}

export default function PresentationPage({ loaderData }: Route.ComponentProps) {
  const { metadata, slug, html } = loaderData;

  useEffect(() => {
    // Add body class for full-screen presentation
    document.body.classList.add('presentation-mode');
    return () => {
      document.body.classList.remove('presentation-mode');
    };
  }, []);

  return (
    <div className="presentation-container">
      <PresentationViewer key={slug} slug={slug} metadata={metadata} html={html} />
    </div>
  );
}
