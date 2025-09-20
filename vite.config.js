import { defineConfig } from "vite";

export default defineConfig({
  base: "/paintings-artist-gallery-porfolio/",
  server: {
    port: 3000,
    open: true,
    host: "localhost",
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    target: "esnext",
    assetsInclude: ["**/*.svg"],
    assetsInlineLimit: 0, // Don't inline any assets, treat SVGs as separate files
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
        additionalData: `@charset "UTF-8";\n`,
      },
    },
  },
  optimizeDeps: {
    include: [],
  },
});
