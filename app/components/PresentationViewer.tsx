import { useEffect, useRef, useState } from "react";
import { useRevealRuntime } from "~/lib/revealRuntime";

interface PresentationMetadata {
  title: string;
  slug: string;
  description: string;
  date: string;
  tags: string[];
  theme: {
    font: string;
    color: string;
  };
  revealConfig: {
    width: number;
    height: number;
    margin: number;
    controls: boolean;
    progress: boolean;
    center: boolean;
    transition: string;
    backgroundTransition: string;
  };
}

interface PresentationViewerProps {
  slug: string;
  metadata: PresentationMetadata;
  html: string;
}

type InitState =
  | { status: "waiting-runtime" }
  | { status: "initializing" }
  | { status: "ready" }
  | { status: "error"; message: string };

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function PresentationViewer({ slug, metadata, html }: PresentationViewerProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<HTMLDivElement>(null);
  const runtime = useRevealRuntime();
  const [state, setState] = useState<InitState>({ status: "waiting-runtime" });
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    if (runtime.status === "loading") {
      setState({ status: "waiting-runtime" });
      return;
    }

    if (runtime.status === "error") {
      setState({ status: "error", message: runtime.message });
      return;
    }

    // runtime.status === "ready" from here on — the reveal.js script has
    // loaded and window.Reveal (its constructor) is defined.
    let active = true;
    let instance: any = null;
    let watchdogTimer: ReturnType<typeof setInterval> | null = null;
    setState({ status: "initializing" });

    (async () => {
      try {
        if (!window.Reveal || !revealRef.current) {
          throw new Error("Reveal.js failed to load");
        }

        // Construct a fresh, independent Reveal instance scoped to this
        // mount's own .reveal element, rather than calling the legacy
        // window.Reveal.initialize()/destroy() singleton shim. That shim
        // always targets document.querySelector(".reveal") (the first
        // match in the whole page) and mutates one shared object in
        // place — repeated destroy()/initialize() cycles against
        // different decks' DOM subtrees can leave residue in that shared
        // object that a subsequent initialize() doesn't fully clear, with
        // no way to recover short of a full page reload. Reveal.js 5.x's
        // bundle exposes its real constructor directly on window.Reveal
        // (the legacy singleton methods are a compatibility shim bolted
        // onto it), so `new window.Reveal(element, options)` gives every
        // deck its own instance with nothing to corrupt across
        // navigations.
        //
        // The .reveal element must stay a separate node nested inside
        // .reveal-viewport (not merged into one element) — reveal.css's
        // per-theme font/color rules are written as descendant selectors
        // like `.theme-font-x .reveal { ... }`, which only match when
        // .reveal is a descendant of the themed element, not when it IS
        // the themed element.
        instance = new window.Reveal(revealRef.current, {
          ...metadata.revealConfig,
          embedded: false,
          // The bundled public/presentations/lib/reveal-plugins.js is a
          // concatenation of the Zoom/Notes/Markdown/Highlight plugin
          // bundles that got mis-assembled: every one of window.RevealZoom
          // / RevealNotes / RevealMarkdown / RevealHighlight ends up as the
          // plugin's UMD factory function itself rather than the {id,init}
          // object the factory returns. None of our converted decks
          // currently rely on speaker notes, Markdown slides, or
          // highlight.js, so omit plugins entirely rather than fix the
          // broken bundle.
          plugins: [],
        });

        await instance.initialize();

        // Reveal.js's own post-initialize slide-selection can still be
        // briefly in flight right after initialize() resolves. Poll for a
        // genuinely settled state (present for a few consecutive checks)
        // rather than trusting a single signal.
        let stableChecks = 0;
        const requiredStableChecks = 3;
        const maxAttempts = 20; // ~2s worst case
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          if (!active) return;
          const isPresent = !!slidesRef.current?.querySelector("section.present");
          if (isPresent) {
            stableChecks++;
            if (stableChecks >= requiredStableChecks) break;
          } else {
            stableChecks = 0;
            instance.slide(0, 0, 0);
          }
          await delay(100);
        }

        if (!active) return;

        if (!slidesRef.current?.querySelector("section.present")) {
          setState({
            status: "error",
            message: "Failed to load this presentation.",
          });
          return;
        }

        setState({ status: "ready" });

        // Belt-and-braces: keep watching for the rest of this deck's
        // lifetime and re-assert the current slide if it's ever found
        // completely unmarked again.
        watchdogTimer = setInterval(() => {
          const container = slidesRef.current;
          if (!container || container.querySelector("section.present")) return;
          const indices = instance?.getIndices?.() ?? { h: 0, v: 0 };
          instance?.slide?.(indices.h ?? 0, indices.v ?? 0);
        }, 500);
      } catch (err) {
        if (!active) return;
        console.error("Failed to initialize presentation:", err);
        setState({
          status: "error",
          message: "Failed to load this presentation.",
        });
      }
    })();

    return () => {
      active = false;
      if (watchdogTimer) clearInterval(watchdogTimer);
      if (instance) {
        try {
          instance.destroy();
        } catch {
          // Ignore cleanup errors.
        }
      }
    };
  }, [slug, metadata, runtime.status, retryToken]);

  const showOverlay = state.status === "waiting-runtime" || state.status === "initializing";

  return (
    <div
      ref={viewportRef}
      className={`reveal-viewport theme-font-${metadata.theme.font} theme-color-${metadata.theme.color}`}
      style={{ width: "100%", height: "100vh", position: "relative" }}
    >
      <div className="reveal" ref={revealRef}>
        <div className="slides" ref={slidesRef} dangerouslySetInnerHTML={{ __html: html }} />
      </div>

      {showOverlay && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            background: "rgba(0, 0, 0, 0.35)",
            pointerEvents: "none",
          }}
        >
          Loading presentation…
        </div>
      )}

      {state.status === "error" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            textAlign: "center",
            padding: "1rem",
            background: "rgba(0, 0, 0, 0.85)",
          }}
        >
          <p>{state.message}</p>
          <button
            type="button"
            onClick={() => setRetryToken((n) => n + 1)}
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: "0.375rem",
              border: "1px solid #fff",
              background: "transparent",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
