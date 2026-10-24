export const SITE_NAME = "Özgün Bal";
export const DEFAULT_IMAGE = "/images/light_ozgun.png";

interface SeoOptions {
  title: string;
  description: string;
  path: string;
  matches: ReadonlyArray<{ id: string; data?: unknown } | undefined>;
  image?: string;
  type?: "website" | "article" | "profile";
}

/** Origin of the current deployment, provided by the root loader. */
export function getOrigin(matches: SeoOptions["matches"]): string {
  const root = matches.find((m) => m?.id === "root")?.data as
    | { origin?: string }
    | undefined;
  return root?.origin ?? "";
}

export function buildMeta({ title, description, path, matches, image, type = "website" }: SeoOptions) {
  const origin = getOrigin(matches);
  const url = `${origin}${path}`;
  const imageUrl = `${origin}${image ?? DEFAULT_IMAGE}`;

  return [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:type", content: type },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: imageUrl },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
  ];
}
