# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start dev server (React Router / Vite, HMR) at `http://localhost:5173`
- `npm run build` — production build (SSR by default, see `react-router.config.ts`)
- `npm run start` — serve the production build (`react-router-serve ./build/server/index.js`)
- `npm run typecheck` — runs `react-router typegen` then `tsc` (regenerates route types before checking — run this after adding/changing routes)
- `npm run convert-presentation <path-to-slides-folder>` — converts a Slides.com HTML export into this site's presentation format (see below)
- `npm run generate-thumbnails` — extracts a thumbnail image for each presentation from its first slide

There is no test suite and no linter configured in this repo.

## Architecture

This is a React Router v7 (framework mode, SSR enabled) personal site, styled with Tailwind CSS v4 (via `@tailwindcss/vite`). Routes are declared explicitly in `app/routes.ts` (not file-system routing) and mapped to files in `app/routes/`.

Path alias `~/*` maps to `./app/*` (see `tsconfig.json`).

### Theming

Dark/light/system theme is handled by `app/hooks/useTheme.tsx` (`ThemeProvider`/`useTheme`), wrapped around the app in `app/root.tsx`. To avoid a flash of incorrect theme on load, `app/root.tsx`'s `Layout` inlines a synchronous script in `<head>` that reads `localStorage.theme` and applies the `dark` class to `<html>` before hydration — the `ThemeProvider` then takes over for reactive updates and system-preference listening. Keep both in sync if changing theme logic.

### Presentations subsystem

This is the most involved part of the codebase. Presentations originate as Slides.com HTML exports and are converted offline into a static format served from `public/presentations/`:

```
public/presentations/
├── lib/                  # shared reveal.js runtime (CSS/JS/fonts), copied once, used by all presentations
└── content/<slug>/
    ├── slides.html       # extracted <section> fragments only (not a full HTML doc)
    ├── metadata.json     # title, description, date, tags, theme, revealConfig
    └── assets/           # images etc., referenced via absolute /presentations/content/<slug>/assets/... paths
```

- `scripts/convert-presentation.cjs` does the one-time conversion from a Slides.com export folder into this structure (extracts slide sections, theme info, and reveal config from the exported `index.html`; rewrites asset paths to absolute).
- `scripts/generate-thumbnails.cjs` scans a presentation's `slides.html` for the first background/inline image and records it in `metadata.json` as the card thumbnail.
- reveal.js CSS is loaded globally in `app/root.tsx`'s `links()`; the JS is expected under `/presentations/lib/`.
- `app/components/PresentationViewer.tsx` fetches a given slug's `slides.html` at runtime, injects it into a `.reveal > .slides` container, and initializes `window.Reveal` with the presentation's `revealConfig`.
- Routes: `app/routes/presentations.tsx` (gallery, loader fetches metadata for a **hardcoded list of slugs**) and `app/routes/presentations.$slug.tsx` (single presentation).

When adding a new presentation, after conversion you must also add its slug to the hardcoded `slugs` array in `app/routes/presentations.tsx`'s loader — nothing auto-discovers `public/presentations/content/`.

Note: `presentations.tsx`'s loader currently fetches metadata via `http://localhost:5173/...`, which only works when the dev server is running on that exact origin/port — be aware of this when touching that loader (e.g. for production or a different port).
