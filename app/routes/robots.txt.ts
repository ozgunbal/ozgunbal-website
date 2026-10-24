import { getOrigin } from "~/lib/seo.server";

export function loader({ request }: { request: Request }) {
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${getOrigin(request)}/sitemap.xml\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
