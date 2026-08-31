import { useEffect, useState } from "react";
import fs from "node:fs/promises";
import path from "node:path";
import { Link } from "react-router";
import type { Route } from "./+types/home";
import { ThemeToggle } from "~/components/ThemeToggle";
import { useTheme } from "~/hooks/useTheme";

// Stats data
const STATS = {
  talks: 5,
  trainingHours: 52,
};

async function countVisiblePresentations(): Promise<number> {
  const contentDir = path.join(process.cwd(), "public", "presentations", "content");
  let slugs: string[] = [];
  try {
    const entries = await fs.readdir(contentDir, { withFileTypes: true });
    slugs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  } catch (error) {
    console.error("Failed to read presentations content directory:", error);
    return 0;
  }

  let count = 0;
  for (const slug of slugs) {
    try {
      const raw = await fs.readFile(path.join(contentDir, slug, "metadata.json"), "utf-8");
      const metadata = JSON.parse(raw);
      if (!metadata.hidden) count++;
    } catch (error) {
      console.error(`Failed to load metadata for ${slug}:`, error);
    }
  }
  return count;
}

export async function loader() {
  const presentationCount = await countVisiblePresentations();

  try {
    const response = await fetch("https://medium.com/feed/@ozgunbal");
    const xmlText = await response.text();

    // Count blog posts
    const itemRegex = /<item>[\s\S]*?<\/item>/g;
    const items = xmlText.match(itemRegex) || [];
    const blogPostCount = items.length;

    return { blogPostCount, presentationCount };
  } catch (error) {
    console.error("Error fetching Medium posts:", error);
    return { blogPostCount: 0, presentationCount };
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Özgün Bal - Software Engineer & Tech Educator" },
    { name: "description", content: "Senior Software Engineer specializing in React Native, Flutter, and Monorepos. Tech educator and public speaker." },
  ];
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { blogPostCount, presentationCount } = loaderData;
  const { resolvedTheme } = useTheme();

  // Check if animation has already played in this session
  const animationPlayed = typeof window !== 'undefined'
    ? sessionStorage.getItem('terminalAnimationPlayed') === 'true'
    : false;

  const [currentLine, setCurrentLine] = useState(animationPlayed ? 4 : 0);
  const [showCursor, setShowCursor] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Wait for client-side mount to avoid theme flash
  useEffect(() => {
    setMounted(true);
  }, []);

  // Terminal lines animation
  const terminalLines = [
    { command: "$ whoami", output: "Özgün Bal" },
    { command: "$ cat role.txt", output: "Software Architect/Engineer & Tech Educator" },
    { command: "$ ls expertise/", output: "Javascript, React, React Native, AI stuff" },
    { command: "$ cat mission.txt", output: "Building better software through code, teaching and community" },
  ];

  useEffect(() => {
    if (currentLine < terminalLines.length) {
      const timer = setTimeout(() => {
        setCurrentLine(currentLine + 1);

        // Mark animation as played when it completes
        if (currentLine + 1 === terminalLines.length) {
          sessionStorage.setItem('terminalAnimationPlayed', 'true');
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentLine]);

  // Blinking cursor
  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(cursorTimer);
  }, []);

  return (
    <main className="container mx-auto px-4">
      {/* Theme Toggle - Fixed Top Right */}
      <div className="fixed top-8 right-8 z-50">
        <ThemeToggle />
      </div>

      {/* CLI Hero Section */}
      <section className="py-4 md:py-8">
        {/* Logo - Centered above terminal */}
        <div className="flex justify-center mb-0">
          {mounted && (
            <img
              src={resolvedTheme === 'dark' ? '/images/dark_ozgun.png' : '/images/light_ozgun.png'}
              alt="Özgün Bal"
              className="h-64 w-auto"
            />
          )}
          {!mounted && (
            <div className="h-64 w-auto" style={{ minWidth: '256px' }} />
          )}
        </div>

        <div
          className="rounded-lg p-8 md:p-12 font-mono text-sm md:text-base shadow-2xl"
          style={{
            backgroundColor: 'var(--color-card)',
            borderColor: 'var(--color-border)',
          }}
        >
          {/* Terminal Header */}
          <div className="flex items-center gap-2 mb-6 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="ml-4 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
              terminal
            </span>
          </div>

          {/* Terminal Content */}
          <div className="space-y-4">
            {terminalLines.slice(0, currentLine).map((line, index) => (
              <div key={index}>
                <div style={{ color: 'var(--color-primary)' }}>
                  {line.command}
                </div>
                <div className="mt-1 ml-0 md:ml-4" style={{ color: 'var(--color-foreground)' }}>
                  {line.output}
                </div>
              </div>
            ))}
            {currentLine >= terminalLines.length && (
              <div className="mt-6 flex items-center gap-2">
                <span style={{ color: 'var(--color-primary)' }}>$ ./explore</span>
                <span
                  className="inline-block w-2 h-4 ml-1"
                  style={{
                    backgroundColor: showCursor ? 'var(--color-primary)' : 'transparent'
                  }}
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {currentLine >= terminalLines.length && (
            <div className="mt-8 flex flex-wrap gap-4 opacity-0 animate-fade-in" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
              <Link
                to="/about"
                className="px-6 py-2 rounded border font-sans text-sm font-medium transition-all hover:shadow-md"
                style={{
                  borderColor: 'var(--color-primary)',
                  color: 'var(--color-primary)',
                  backgroundColor: 'transparent',
                }}
              >
                About Me
              </Link>
              <Link
                to="/talks"
                className="px-6 py-2 rounded border font-sans text-sm font-medium transition-all hover:shadow-md"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-foreground)',
                  backgroundColor: 'var(--color-muted)',
                }}
              >
                View Talks
              </Link>
              <Link
                to="/trainings"
                className="px-6 py-2 rounded border font-sans text-sm font-medium transition-all hover:shadow-md"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-foreground)',
                  backgroundColor: 'var(--color-muted)',
                }}
              >
                Trainings
              </Link>
              <Link
                to="/presentations"
                className="px-6 py-2 rounded border font-sans text-sm font-medium transition-all hover:shadow-md"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-foreground)',
                  backgroundColor: 'var(--color-muted)',
                }}
              >
                See Presentations
              </Link>
              <Link
                to="/blog"
                className="px-6 py-2 rounded border font-sans text-sm font-medium transition-all hover:shadow-md"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-foreground)',
                  backgroundColor: 'var(--color-muted)',
                }}
              >
                Blog
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Quick Stats Bar */}
      {currentLine >= terminalLines.length && (
        <section
          className="py-12 opacity-0 animate-fade-in"
          style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {/* Talks */}
            <Link
              to="/talks"
              className="rounded-lg p-6 text-center transition-all hover:shadow-lg hover:scale-105"
              style={{
                backgroundColor: 'var(--color-card)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="text-4xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
                {STATS.talks}
              </div>
              <div className="text-sm font-medium" style={{ color: 'var(--color-muted-foreground)' }}>
                Public Talks
              </div>
            </Link>

            {/* Training Hours */}
            <Link
              to="/trainings"
              className="rounded-lg p-6 text-center transition-all hover:shadow-lg hover:scale-105"
              style={{
                backgroundColor: 'var(--color-card)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="text-4xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
                {STATS.trainingHours}+
              </div>
              <div className="text-sm font-medium" style={{ color: 'var(--color-muted-foreground)' }}>
                Training Hours
              </div>
            </Link>

            {/* Blog Posts */}
            <Link
              to="/blog"
              className="rounded-lg p-6 text-center transition-all hover:shadow-lg hover:scale-105"
              style={{
                backgroundColor: 'var(--color-card)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="text-4xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
                {blogPostCount}
              </div>
              <div className="text-sm font-medium" style={{ color: 'var(--color-muted-foreground)' }}>
                Blog Posts
              </div>
            </Link>

            {/* Presentations */}
            <Link
              to="/presentations"
              className="rounded-lg p-6 text-center transition-all hover:shadow-lg hover:scale-105"
              style={{
                backgroundColor: 'var(--color-card)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="text-4xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
                {presentationCount}
              </div>
              <div className="text-sm font-medium" style={{ color: 'var(--color-muted-foreground)' }}>
                Presentations
              </div>
            </Link>
          </div>
        </section>
      )}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </main>
  );
}
