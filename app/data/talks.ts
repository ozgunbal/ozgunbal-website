export type Talk = {
  title: string;
  subtitle?: string;
  date: string;
  thumbnail?: string;
  youtubeId?: string;
  spotifyId?: string;
  slidesSlug?: string;
};

export const talks: Talk[] = [
  {
    title: "Safely Retrofitting Apps for AI Agents",
    subtitle: "Devfest Baku 2026",
    date: "October 31, 2026",
    slidesSlug: "safely-retrofitting-apps-for-ai-agents",
  },
  {
    title: "From React Native to Flutter: Pros, Cons and Lessons Learned",
    subtitle: "Devfest İzmir 2025",
    date: "December 13, 2025",
    thumbnail: "/images/talk-react-native-to-flutter.jpeg",
    slidesSlug: "react-native-to-flutter",
  },
  {
    title: "Monorepos in Action",
    subtitle: "Geekday 2025",
    date: "February 28, 2025",
    thumbnail: "/images/talk-monorepo-in-action.jpg",
    slidesSlug: "monorepos-in-action",
  },
  {
    title: "CI/CD for Frontend Developers",
    subtitle: "Devfest İzmir 2024",
    date: "December 7, 2024",
    youtubeId: "A8oilYx_uBc",
    slidesSlug: "web-ci-cd-fc0ade",
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
    slidesSlug: "codefiction-javascript-promises",
  },
];
