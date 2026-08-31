import { Link } from "react-router";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "../hooks/useTheme";

export function Header() {
  const { resolvedTheme } = useTheme();

  return (
    <header style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-background)' }}>
      <nav className="container mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          <Link to="/" className="flex items-center gap-3 text-4xl font-bold" style={{ color: 'var(--color-foreground)' }}>
            <img
              src={resolvedTheme === 'dark' ? '/images/dark_ozgun.png' : '/images/light_ozgun.png'}
              alt="Özgün Bal Logo"
              className="h-32 w-auto"
            />
            Özgün Bal
          </Link>
          <div className="flex items-center gap-6 text-xl">
            <Link
              to="/about"
              style={{ color: 'var(--color-muted-foreground)' }}
              className="hover:opacity-80"
            >
              About
            </Link>
            <Link
              to="/talks"
              style={{ color: 'var(--color-muted-foreground)' }}
              className="hover:opacity-80"
            >
              Talks
            </Link>
            <Link
              to="/trainings"
              style={{ color: 'var(--color-muted-foreground)' }}
              className="hover:opacity-80"
            >
              Trainings
            </Link>
            <Link
              to="/presentations"
              style={{ color: 'var(--color-muted-foreground)' }}
              className="hover:opacity-80"
            >
              Presentations
            </Link>
            <Link
              to="/blog"
              style={{ color: 'var(--color-muted-foreground)' }}
              className="hover:opacity-80"
            >
              Blog
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}
