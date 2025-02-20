import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    minify: 'terser',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: './index.html',
        api: './api.html',
        developer: './developer.html',
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: true,
    },
  },
  css: {
    postcss: './postcss.config.cjs',
  },
});
