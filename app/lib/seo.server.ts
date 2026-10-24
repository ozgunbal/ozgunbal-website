import fs from "node:fs/promises";
import path from "node:path";

/** Public origin of the request, honouring proxy headers (Cloud Run). */
export function getOrigin(request: Request): string {
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? url.host;
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0].trim() ?? url.protocol.replace(":", "");
  return `${proto}://${host.split(",")[0].trim()}`;
}

export async function listVisiblePresentations(): Promise<{ slug: string; date?: string }[]> {
  const contentDir = path.join(process.cwd(), "public", "presentations", "content");
  const result: { slug: string; date?: string }[] = [];
  try {
    const entries = await fs.readdir(contentDir, { withFileTypes: true });
    for (const entry of entries.filter((e) => e.isDirectory())) {
      try {
        const raw = await fs.readFile(path.join(contentDir, entry.name, "metadata.json"), "utf-8");
        const metadata = JSON.parse(raw);
        if (!metadata.hidden) result.push({ slug: entry.name, date: metadata.date });
      } catch (error) {
        console.error(`Failed to load metadata for ${entry.name}:`, error);
      }
    }
  } catch (error) {
    console.error("Failed to read presentations content directory:", error);
  }
  return result;
}
