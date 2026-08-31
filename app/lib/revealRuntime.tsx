import { createContext, useContext, useEffect, useState } from "react";

// Declare Reveal on window
declare global {
  interface Window {
    Reveal: any;
    RevealZoom: any;
    RevealNotes: any;
    RevealMarkdown: any;
    RevealHighlight: any;
  }
}

export type RevealRuntimeStatus =
  | { status: "loading" }
  | { status: "ready" }
  | { status: "error"; message: string };

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load script: ${src}`)), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    });
    script.addEventListener("error", () => reject(new Error(`Failed to load script: ${src}`)));
    document.body.appendChild(script);
  });
}

// Single cached promise for the page's lifetime — reveal.js/reveal-plugins.js
// are only ever injected once, no matter how many presentations get mounted
// or which deck the user navigates to.
let runtimePromise: Promise<void> | null = null;

export function ensureRevealRuntime(): Promise<void> {
  if (!runtimePromise) {
    // reveal-plugins.js relies on window.Reveal existing, so load in order.
    runtimePromise = loadScript("/presentations/lib/reveal.js").then(() =>
      loadScript("/presentations/lib/reveal-plugins.js"),
    );
  }
  return runtimePromise;
}

const RevealRuntimeContext = createContext<RevealRuntimeStatus>({ status: "loading" });

export function RevealRuntimeProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<RevealRuntimeStatus>({ status: "loading" });

  useEffect(() => {
    let active = true;
    ensureRevealRuntime()
      .then(() => {
        if (active) setStatus({ status: "ready" });
      })
      .catch((err) => {
        if (active) {
          setStatus({
            status: "error",
            message: err instanceof Error ? err.message : "Failed to load presentation runtime",
          });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return <RevealRuntimeContext.Provider value={status}>{children}</RevealRuntimeContext.Provider>;
}

export function useRevealRuntime(): RevealRuntimeStatus {
  return useContext(RevealRuntimeContext);
}
