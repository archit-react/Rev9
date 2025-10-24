// vite.config.ts
import { defineConfig } from "vitest/config"; // keep this so the `test` block is typed
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173, // always run frontend on http://localhost:5173
    strictPort: true, // fail if port 5173 is already in use (no auto 5174)
  },
  // ⬇️ Suppress the chunk-size warning and split large deps
  build: {
    chunkSizeWarningLimit: 1200, // raise limit (KB); purely a warning, no behavior change
    rollupOptions: {
      output: {
        // group big libs into separate chunks for better caching
        manualChunks: {
          react: ["react", "react-dom"],
          vendor: ["framer-motion", "recharts", "lucide-react"],
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/vitest.setup.ts",
  },
});
