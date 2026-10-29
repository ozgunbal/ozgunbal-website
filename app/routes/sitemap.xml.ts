import { getOrigin, listVisiblePresentations } from "~/lib/seo.server";

export async function loader({ request }: { request: Request }) {
  const origin = getOrigin(request);
  const presentations = await listVisiblePresentations();

  const urls: { loc: string; lastmod?: string }[] = [
    ...["/", "/about", "/talks", "/trainings", "/presentations", "/fun-stuff", "/blog"].map((loc) => ({ loc })),
    ...presentations.map((p) => ({ loc: `/presentations/${p.slug}`, lastmod: p.date })),
  ];

  const entries = urls
    .map((u) => `  <url><loc>${origin}${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}</url>`)
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
