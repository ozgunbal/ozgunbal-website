import { Outlet } from "react-router";
import { RevealRuntimeProvider } from "~/lib/revealRuntime";

export function links() {
  return [
    { rel: "stylesheet", href: "/presentations/lib/reveal.css" },
    { rel: "stylesheet", href: "/presentations/lib/offline-v2.css" },
  ];
}

export default function PresentationsLayout() {
  return (
    <RevealRuntimeProvider>
      <Outlet />
    </RevealRuntimeProvider>
  );
}
