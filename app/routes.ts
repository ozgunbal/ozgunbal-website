import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("about", "routes/about.tsx"),
  route("talks", "routes/talks.tsx"),
  route("trainings", "routes/trainings.tsx"),
  layout("routes/presentations.layout.tsx", [
    route("presentations", "routes/presentations.tsx"),
    route("presentations/:slug", "routes/presentations.$slug.tsx"),
  ]),
  route("fun-stuff", "routes/fun-stuff.tsx"),
  route("blog", "routes/blog.tsx"),
  route("robots.txt", "routes/robots.txt.ts"),
  route("sitemap.xml", "routes/sitemap.xml.ts"),
] satisfies RouteConfig;
