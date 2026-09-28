import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "../hooks/useTheme";

const NAV_LINKS = [
  { to: "/about", label: "About" },
  { to: "/talks", label: "Talks" },
  { to: "/trainings", label: "Trainings" },
  { to: "/presentations", label: "Presentations" },
  { to: "/blog", label: "Blog" },
];

export function Header() {
  const { resolvedTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close the mobile menu after navigating
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <header style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-background)' }}>
      <nav className="container mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          <Link to="/" className="flex items-center gap-3 text-2xl md:text-4xl font-bold" style={{ color: 'var(--color-foreground)' }}>
            <img
              src={resolvedTheme === 'dark' ? '/images/dark_ozgun.png' : '/images/light_ozgun.png'}
              alt="Özgün Bal Logo"
              className="h-16 md:h-32 w-auto"
            />
            Özgün Bal
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-6 text-xl">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                style={{ color: 'var(--color-muted-foreground)' }}
                className="hover:opacity-80"
              >
                {label}
              </Link>
            ))}
            <ThemeToggle />
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((open) => !open)}
              className="p-2 hover:opacity-80"
              style={{ color: 'var(--color-foreground)' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {menuOpen ? (
                  <path d="M18 6 6 18M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {menuOpen && (
          <div id="mobile-menu" className="md:hidden flex flex-col gap-4 py-4 text-xl">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                style={{ color: 'var(--color-muted-foreground)' }}
                className="hover:opacity-80"
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
