import { Link } from "react-router";

interface PresentationCardProps {
  slug: string;
  title: string;
  description?: string;
  date: string;
  tags: string[];
  thumbnail?: string;
}

export function PresentationCard({
  slug,
  title,
  description,
  date,
  tags,
  thumbnail,
}: PresentationCardProps) {
  return (
    <Link
      to={`/presentations/${slug}`}
      className="group block rounded-lg overflow-hidden border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-card)',
      }}
    >
      {/* Thumbnail */}
      <div
        className="relative w-full h-48 overflow-hidden"
        style={{ backgroundColor: 'var(--color-muted)' }}
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-16 h-16 opacity-30"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"
              />
            </svg>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-5">
        <h2
          className="text-xl font-bold mb-2 group-hover:text-opacity-80 transition-colors line-clamp-2"
          style={{ color: 'var(--color-foreground)' }}
        >
          {title}
        </h2>

        {description && (
          <p
            className="mb-3 text-sm line-clamp-2"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            {description}
          </p>
        )}

        <div className="flex items-center justify-between mt-4">
          <span
            className="text-xs"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            {new Date(date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>

          {tags.length > 0 && (
            <div className="flex gap-1.5">
              {tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: 'var(--color-muted)',
                    color: 'var(--color-muted-foreground)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
