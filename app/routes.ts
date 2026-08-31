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
  route("blog", "routes/blog.tsx"),
] satisfies RouteConfig;
