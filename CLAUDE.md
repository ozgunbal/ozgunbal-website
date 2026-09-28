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
- Server-side loaders read presentation data straight from disk via `path.join(process.cwd(), "public", "presentations", "content")`:
  - `app/routes/presentations.tsx` (gallery) scans the `content/` directory for slug folders and reads each `metadata.json`; presentations with `"hidden": true` are filtered out.
  - `app/routes/presentations.$slug.tsx` reads that slug's `metadata.json` and `slides.html` and passes the HTML to the viewer.
  - `app/routes/home.tsx` counts the visible presentations the same way.
- `app/components/PresentationViewer.tsx` receives the slide HTML as a prop, renders it into a `.reveal > .slides` container, and initializes `window.Reveal` with the presentation's `revealConfig`.

A new presentation shows up automatically once its folder exists under `public/presentations/content/`; no slug list needs updating. Because the loaders read `public/` at request time (not just the built `build/client` copy), the production runtime must have `public/presentations/content` next to `build/`. The Dockerfile copies it in for this reason.

## Deployment

The site runs on Google Cloud Run as a Docker image.

- `Dockerfile` is a multi-stage build. The final stage contains production `node_modules`, `build/` and `public/presentations/content`, and runs `npm run start`. `react-router-serve` listens on `$PORT`, which Cloud Run sets (8080).
- `.dockerignore` excludes `slides-backup/` (the raw Slides.com exports, ~170 MB), `.git`, tooling folders and Markdown docs. Keep large or local-only folders out of the build context.
- `.github/workflows/deploy.yml` runs on every push to `main` (and on manual dispatch). It typechecks, builds a `linux/amd64` image, pushes it to Artifact Registry tagged with the commit SHA and `latest`, and deploys it to the `ozgunbal-website` Cloud Run service.
- The workflow authenticates with Workload Identity Federation, so no JSON key is stored. It reads these GitHub repository **variables**: `GCP_PROJECT_ID`, `GCP_REGION`, `GCP_ARTIFACT_REPO`, `GCP_WORKLOAD_IDENTITY_PROVIDER`, `GCP_SERVICE_ACCOUNT`.
- `.github/workflows/preview.yml` deploys every same-repo PR to its own public Cloud Run service `ozgunbal-website-pr-<N>` (image `ozgunbal-website-preview`, scale-to-zero, max 1 instance) and keeps the URL in a single PR comment. `preview-cleanup.yml` deletes that service when the PR is merged or closed. Fork PRs are never deployed. Old preview images are removed by an Artifact Registry cleanup policy, not by the workflow.
- `.env.example` documents those variables. Copy it to `.env` (gitignored, and excluded from the Docker build), fill it in, and run `gh variable set -f .env` to push the values to GitHub. The app itself reads no env vars at runtime, so only add a variable here if the workflow uses it. Any variable Vite should expose to the client must be prefixed `VITE_`.

## Claude agent

`.github/workflows/claude.yml` runs Claude Code (`anthropics/claude-code-action`, authenticated with the `CLAUDE_CODE_OAUTH_TOKEN` secret from `claude setup-token`). It starts when an issue gets the `claude` label, or when an `@claude` comment or review is posted by someone whose `author_association` is in the `CLAUDE_ALLOWED_ASSOCIATIONS` repo variable. The action also requires the actor to have write access, so contributors are enabled by inviting them as collaborators with Write. Commits and PRs are made with the Claude GitHub App token, which is what lets them trigger `preview.yml` (the default `GITHUB_TOKEN` can't trigger other workflows).

### Agent rules

When running as the CI agent:

- Work on the branch the action created (`claude/issue-<N>`). From an issue, open one PR against `main` whose body ends with `Closes #<N>`. On an existing PR, push to its branch and don't open another PR.
- Run `npm run typecheck` and make sure it passes before pushing. Run `npm run build` too when routes, loaders or config change.
- Don't edit `.github/workflows/`, `Dockerfile`, `.dockerignore` or `react-router.config.ts`. If the issue needs that, say so in the PR instead.
- Keep changes scoped to the issue and match the surrounding code's style. Don't add dependencies unless the issue needs them, and explain why in the PR.
- Never merge PRs, force-push, or push to `main`.
