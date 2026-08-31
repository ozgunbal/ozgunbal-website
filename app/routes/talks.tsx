import type { Route } from "./+types/talks";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Talks - Özgün Bal" },
    { name: "description", content: "Public talks and speaking engagements" },
  ];
}

const talks = [
  {
    title: "From React Native to Flutter: Pros, Cons and Lessons Learned",
    subtitle: "Devfest İzmir 2025",
    date: "December 13, 2025",
    thumbnail: "/images/talk-react-native-to-flutter.jpeg",
  },
  {
    title: "Monorepos in Action",
    subtitle: "Geekday 2025",
    date: "February 28, 2025",
    thumbnail: "/images/talk-monorepo-in-action.jpg",
  },
  {
    title: "CI/CD for Frontend Developers",
    subtitle: "Devfest İzmir 2024",
    date: "December 7, 2024",
    youtubeId: "A8oilYx_uBc",
  },
  {
    title: "Kodun Ardındaki Sırlar: Innovance'te Frontend Geliştirme",
    subtitle: "Coderspace Podcast",
    date: "March 12, 2024",
    spotifyId: "5LKKWQagehSMq9xqDFkm28",
  },
  {
    title: "Promises in Javascript",
    subtitle: "Codefiction Meetup İstanbul",
    date: "January 6, 2018",
    youtubeId: "40YcabXaRTc",
  },
];

export default function Talks() {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6" style={{ color: 'var(--color-foreground)' }}>Talks</h1>
      <p className="text-lg mb-12" style={{ color: 'var(--color-muted-foreground)' }}>
        Public talks and speaking engagements
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {talks.map((talk, index) => (
          <div
            key={index}
            className="rounded-lg border transition-all hover:shadow-lg overflow-hidden"
            style={{
              backgroundColor: 'var(--color-card)',
              borderColor: 'var(--color-border)',
            }}
          >
            {talk.thumbnail && !talk.youtubeId && !talk.spotifyId && (
              <div className="aspect-video">
                <img
                  src={talk.thumbnail}
                  alt={talk.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}

            {talk.youtubeId && (
              <div className="aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${talk.youtubeId}`}
                  title={talk.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {talk.spotifyId && (
              <div>
                <iframe
                  src={`https://open.spotify.com/embed/episode/${talk.spotifyId}?utm_source=generator`}
                  width="100%"
                  height="152"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
              </div>
            )}

            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-foreground)' }}>
                {talk.title}
              </h2>
              {talk.subtitle && (
                <p className="text-sm mb-3" style={{ color: 'var(--color-muted-foreground)' }}>
                  {talk.subtitle}
                </p>
              )}
              <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                {talk.date}
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
