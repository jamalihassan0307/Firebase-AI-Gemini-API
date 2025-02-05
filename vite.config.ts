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
      },
      output: {
        manualChunks: {
          vendor: ['@google/generative-ai'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
