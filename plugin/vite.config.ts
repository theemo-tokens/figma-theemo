import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    outDir: '../dist',
    emptyOutDir: false,
    target: 'es2015',
    minify: false,
    rollupOptions: {
      input: 'src/main.ts',
      output: {
        format: 'iife',
        entryFileNames: 'main.js',
      },
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
  },
});
