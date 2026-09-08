import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: "/MalSentinal/",
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  build: {
    outDir: ".pages-dist",
    emptyOutDir: true,
    rollupOptions: {
      input: "index.html",
    },
  },
});
