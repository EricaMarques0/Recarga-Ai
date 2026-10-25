// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Project sites are served from /<repository>/. Local dev and Lovable stay at /.
const isGitHubPages = process.env.GITHUB_PAGES === "true";
const pagesRepository = process.env.GITHUB_REPOSITORY?.split("/")[1] || "Recarga-Ai";
const pagesBasepath = `/${pagesRepository}`;

export default defineConfig({
  ...(isGitHubPages ? { vite: { base: `${pagesBasepath}/` } } : {}),
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    ...(isGitHubPages
      ? {
          // Hydration reads this value; the router basepath alone is overwritten.
          router: { basepath: pagesBasepath },
          spa: {
            enabled: true,
            prerender: {
              outputPath: "/index.html",
              crawlLinks: false,
            },
          },
          // Real HTML for routes GitHub Pages can refresh. Query-only routes stay on the SPA shell.
          pages: [
            { path: "/cartoes", prerender: { crawlLinks: false } },
            { path: "/historico", prerender: { crawlLinks: false } },
            { path: "/ajuda", prerender: { crawlLinks: false } },
          ],
        }
      : {}),
  },
});
