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

          if (id.includes("react-router")) return "vendor-router";
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
            return "vendor-react";
          }
          if (id.includes("@tiptap") || id.includes("prosemirror")) return "vendor-editor";
          if (id.includes("gsap") || id.includes("motion")) return "vendor-motion";
          if (id.includes("swiper")) return "vendor-swiper";
          if (id.includes("firebase")) return "vendor-firebase";
          if (id.includes("lucide-react") || id.includes("react-icons")) return "vendor-icons";
          return "vendor";
        },
      },
    },

    // The split above intentionally leaves a couple of chunks near the default
    // warning threshold; raising it keeps the build output readable.
    chunkSizeWarningLimit: 700,
  },
});
