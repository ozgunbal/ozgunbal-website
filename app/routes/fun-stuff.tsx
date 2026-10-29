import { Link } from "react-router";
import type { Route } from "./+types/fun-stuff";
import { buildMeta } from "~/lib/seo";

export function meta({ matches }: Route.MetaArgs) {
  return buildMeta({
    title: "Fun Stuff - Özgün Bal",
    description: "Side projects and experiments",
    path: "/fun-stuff",
    matches,
  });
}

type Project = {
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  tags?: string[];
  slidesSlug?: string;
};

const projects: Project[] = [
  {
    title: "Web AI Agent — Mock Bank",
    description:
      "An in-browser AI agent powered by WebLLM that runs fully on-device and operates a mock banking web app: checking balances, browsing transactions, making transfers and payments, with confirmations for risky actions.",
    url: "https://ozgunbal.github.io/web-ai/",
    thumbnail: "/images/project-web-ai.jpg",
    tags: ["WebLLM", "AI Agent", "WebGPU"],
    slidesSlug: "safely-retrofitting-apps-for-ai-agents",
  },
];

export default function FunStuff() {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6" style={{ color: 'var(--color-foreground)' }}>Fun Stuff</h1>
      <p className="text-lg mb-12" style={{ color: 'var(--color-muted-foreground)' }}>
        Side projects and experiments
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.url}
            className="rounded-lg border transition-all hover:shadow-lg overflow-hidden flex flex-col"
            style={{
              backgroundColor: 'var(--color-card)',
              borderColor: 'var(--color-border)',
            }}
          >
            <a href={project.url} target="_blank" rel="noopener noreferrer" className="block aspect-video">
              <img
                src={project.thumbnail}
                alt={project.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </a>

            <div className="p-6 flex flex-col flex-1">
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-foreground)' }}>
                <a href={project.url} target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                  {project.title}
                </a>
              </h2>
              <p className="text-sm mb-4" style={{ color: 'var(--color-muted-foreground)' }}>
                {project.description}
              </p>
              {project.tags && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded text-xs"
                      style={{ backgroundColor: 'var(--color-muted)', color: 'var(--color-muted-foreground)' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-3 mt-auto">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm font-medium transition-colors hover:opacity-80"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                    aria-hidden="true"
                  >
                    <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  </svg>
                  Open project
                </a>
                {project.slidesSlug && (
                  <Link
                    to={`/presentations/${project.slidesSlug}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm font-medium transition-colors hover:opacity-80"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                      aria-hidden="true"
                    >
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <path d="M8 21h8M12 17v4" />
                    </svg>
                    Slides
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
