import { Outlet } from "react-router";
import { RevealRuntimeProvider } from "~/lib/revealRuntime";

export default function PresentationsLayout() {
  return (
    <RevealRuntimeProvider>
      <Outlet />
    </RevealRuntimeProvider>
  );
}
