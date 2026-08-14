import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    // The image manifest is data, not code — inlining it as a base64 asset
    // would be both larger and slower to parse than leaving it in the chunk.
    assetsInlineLimit: 4096,

    rollupOptions: {
      output: {
        /**
         * Split the dependencies that change on a different cadence than the
         * app code. Two reasons this matters for image speed:
         *
         *  - a returning visitor re-downloads only the app chunk, so more of
         *    their bandwidth budget goes to photographs instead of framework
         *    bytes they already have;
         *  - the browser parses several smaller scripts in parallel rather than
         *    blocking on one 1.3 MB file before it starts fetching images.
         */
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          // Only force a shared chunk for things EVERY route genuinely needs.
          if (id.includes("react-router")) return "vendor-router";
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
            return "vendor-react";
          }
          // Icons are pulled by the header and footer, so they load anyway.
          if (id.includes("lucide-react") || id.includes("react-icons")) return "vendor-icons";

          // Everything else: return nothing and let Rollup decide.
          //
          // This used to end in `return "vendor"`, a catch-all that swept every
          // remaining dependency into one chunk loaded on every page. Once the
          // routes were code-split that became actively harmful — DOMPurify
          // (blog detail only), EmailJS (contact only) and use-gesture (dome
          // gallery only) were all being downloaded and parsed by someone who
          // just opened the homepage. Letting Rollup place them puts each one
          // in the route chunk that actually imports it.
        },
      },
    },

    // The split above intentionally leaves a couple of chunks near the default
    // warning threshold; raising it keeps the build output readable.
    chunkSizeWarningLimit: 700,
  },
});
