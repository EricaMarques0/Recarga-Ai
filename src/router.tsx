import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// "/" in dev; "/Recarga-Ai" when Vite base is the GitHub Pages project path.
const pagesBasepath = import.meta.env.BASE_URL.replace(/\/$/, "");

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    ...(pagesBasepath ? { basepath: pagesBasepath } : {}),
  });

  return router;
};
