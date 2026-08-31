import type { Route } from "./+types/blog";
import { useLoaderData } from "react-router";

interface BlogPost {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  categories: string[];
}

export async function loader() {
  try {
    const response = await fetch("https://medium.com/feed/@ozgunbal");
    const xmlText = await response.text();

    // Parse XML RSS feed
    const posts: BlogPost[] = [];
    const itemRegex = /<item>[\s\S]*?<\/item>/g;
    const items = xmlText.match(itemRegex) || [];

    items.forEach((item) => {
      const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
      const linkMatch = item.match(/<link>(.*?)<\/link>/);
      const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
      const descriptionMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/);
      const categoryMatches = item.matchAll(/<category><!\[CDATA\[(.*?)\]\]><\/category>/g);

      if (titleMatch && linkMatch && pubDateMatch) {
        posts.push({
          title: titleMatch[1],
          link: linkMatch[1],
          pubDate: pubDateMatch[1],
          description: descriptionMatch ? descriptionMatch[1] : "",
          categories: Array.from(categoryMatches).map(match => match[1]),
        });
      }
    });

    return { posts };
  } catch (error) {
    console.error("Error fetching Medium posts:", error);
    return { posts: [] };
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Blog - Özgün Bal" },
    { name: "description", content: "Articles and blog posts from Medium" },
  ];
}

export default function Blog() {
  const { posts } = useLoaderData<typeof loader>();

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8" style={{ color: 'var(--color-foreground)' }}>Blog</h1>

      <div className="mb-6">
        <p className="text-lg mb-2" style={{ color: 'var(--color-muted-foreground)' }}>
          Articles and thoughts about web development, React, and JavaScript.
        </p>
        <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
          Read more on <a
            href="https://medium.com/@ozgunbal"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80"
          >
            Medium
          </a>
        </p>
      </div>

      {posts.length === 0 ? (
        <p style={{ color: 'var(--color-muted-foreground)' }}>
          No posts available at the moment.
        </p>
      ) : (
        <div className="space-y-8">
          {posts.map((post) => (
            <article
              key={post.link}
              className="border-b pb-8 last:border-b-0"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <h2 className="text-2xl font-bold mb-3">
                <a
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--color-foreground)' }}
                >
                  {post.title}
                </a>
              </h2>

              <time
                className="text-sm mb-3 block"
                style={{ color: 'var(--color-muted-foreground)' }}
              >
                {new Date(post.pubDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>

              {post.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.categories.map((category) => (
                    <span
                      key={category}
                      className="text-xs px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: 'var(--color-accent)',
                        color: 'var(--color-accent-foreground)'
                      }}
                    >
                      {category}
                    </span>
                  ))}
                </div>
              )}

              {post.description && (
                <div
                  className="prose dark:prose-invert max-w-none"
                  style={{ color: 'var(--color-muted-foreground)' }}
                  dangerouslySetInnerHTML={{
                    __html: post.description.substring(0, 300) + '...'
                  }}
                />
              )}

              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 font-medium hover:opacity-80 transition-opacity"
                style={{ color: 'var(--color-foreground)' }}
              >
                Read more →
              </a>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
