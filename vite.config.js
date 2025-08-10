import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3000,
    open: true,
    host: 'localhost'
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'esnext'
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        additionalData: `@charset "UTF-8";\n`
      }
    }
  },
  optimizeDeps: {
    include: []
  }
})