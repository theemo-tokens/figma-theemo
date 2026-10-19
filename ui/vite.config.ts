import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { viteSingleFile } from 'vite-plugin-singlefile';
import svg from 'vite-plugin-svgo';

// alternative to write-to-disk while running in dev mode:
// https://stackoverflow.com/a/72695336/483492

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    svelte(),
    viteSingleFile(),
    svg({
      plugins: ['preset-default', 'removeDimensions'],
    }),
  ],
  build: {
    outDir: '../dist',
  },
  // let Vite's SSR pipeline (used by Vitest) resolve svelte & the UI3 kit
  // to their client builds, so mount() is available in jsdom tests
  resolve: {
    conditions: mode === 'test' || process.env.VITEST ? ['browser'] : [],
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    server: {
      // svelte packages ship uncompiled sources & need the browser build
      // for mount()/render(); keep them in vite's module graph (not Node SSR)
      deps: {
        inline: [/svelte/, /figma-ui3-kit-svelte/, /@testing-library/],
      },
    },
  },
}));
