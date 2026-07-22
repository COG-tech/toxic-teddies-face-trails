import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      input: {
        app: resolve(process.cwd(), 'index.html'),
        privacy: resolve(process.cwd(), 'privacy.html'),
        support: resolve(process.cwd(), 'support.html'),
      },
    },
  },
});
