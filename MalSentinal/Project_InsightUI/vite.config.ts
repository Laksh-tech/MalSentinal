// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// GitHub Pages project site (Laksh-tech/MalSentinal) is served from a subpath:
//   https://laksh-tech.github.io/MalSentinal/
// The build is gated on GITHUB_PAGES=true so the Lovable preview (Cloudflare SSR,
// base "/") stays exactly as-is. TanStack derives the router basepath from the
// vite `base`, so both asset URLs and client routing resolve under /MalSentinal/.
const GITHUB_PAGES = process.env["GITHUB_PAGES"] === "true";

export default defineConfig(
  GITHUB_PAGES
    ? {
        // Static build for GitHub Pages: prerender "/" to HTML + nitro "static" (no server).
        tanstackStart: {
          server: { entry: "server" },
          prerender: { enabled: true, autoStaticPathsDiscovery: false },
          pages: [{ path: "/" }, { path: "/demo" }],
        },
        nitro: { preset: "static" },
        vite: { base: "/MalSentinal/" },
      }
    : {
        // Lovable preview: Cloudflare SSR, base "/" (defaults — unchanged from the template).
        tanstackStart: { server: { entry: "server" } },
        vite: { base: "/" },
      },
);
