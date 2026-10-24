import type { Route } from "./+types/about";
import { buildMeta } from "~/lib/seo";

export function meta({ matches }: Route.MetaArgs) {
  return buildMeta({
    title: "About - Özgün Bal",
    description: "Learn more about Özgün Bal",
    path: "/about",
    type: "profile",
    matches,
  });
}

export default function About() {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6" style={{ color: 'var(--color-foreground)' }}>About Me</h1>
      <div className="max-w-none space-y-10">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <p className="text-lg flex-1" style={{ color: 'var(--color-muted-foreground)' }}>
            I'm a Software Architect at Innovance Consultancy, a Turkish technology consultancy
            working with mostly fintech and banking clients. Over the past 11+ years I've built my
            career around React, React Native, leading small and mid-level teams and guide as a
            chapter lead of 30–40 engineers through everything from cross-functional architecture
            to client delivery inside heavily regulated environments.
          </p>
          <img
            src="/images/about-coding.jpg"
            alt="Özgün Bal working on a laptop"
            className="w-full md:w-72 shrink-0 rounded-lg"
          />
        </div>

        <div className="flex flex-col md:flex-row-reverse gap-6 items-start">
          <p className="text-lg flex-1" style={{ color: 'var(--color-muted-foreground)' }}>
            These days a growing part of my work is shaping how AI fits into software development.
            I am driving institutional AI adoption, and hold a Google Cloud Generative AI Leader
            certification. Alongside that, I've been deliberately widening my own scope beyond
            frontend and mobile — spending more time in native mobile, backend, and DevOps —
            because I think the architects who'll matter most in the next few years are the ones
            who can reason across the whole stack, not just their original specialty.
          </p>
          <img
            src="/images/about-concert.jpg"
            alt="Özgün Bal at a metal concert"
            className="w-full md:w-72 shrink-0 rounded-lg"
          />
        </div>

        <p className="text-lg" style={{ color: 'var(--color-muted-foreground)' }}>
          I studied at Boğaziçi University, and I still think of myself as someone who's happiest
          a few steps ahead of "settled" — whether that's a new framework, a new part of the
          stack, or a new way of working with AI tools.
        </p>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          <p className="text-lg flex-1" style={{ color: 'var(--color-muted-foreground)' }}>
            Outside of work, I've been a certified scuba diver for over 10 years, I'm a regular at
            metal concerts, and I recently picked up drumming — trading one kind of rhythm section
            for another.
          </p>
          <img
            src="/images/about-diving.jpg"
            alt="Özgün Bal scuba diving by a coral reef"
            className="w-full md:w-72 shrink-0 rounded-lg"
          />
        </div>
      </div>
    </main>
  );
}
