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
      plugins: ['preset-default', 'removeDimensions']
    })
  ],
  build: {
    outDir: '../dist'
  },
  // Vitest's SSR-style pipeline would resolve Svelte to its server build
  // (no mount()); pin the browser build there. Production builds must keep
  // Vite's default conditions — an explicit list here *replaces* the
  // defaults under rolldown-vite, which previously bundled the server build.
  resolve: mode === 'test' ? { conditions: ['browser'] } : {},
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    server: {
      // svelte packages ship uncompiled sources; keep them in vite's module
      // graph (not Node SSR) so the browser build above gets used
      deps: {
        inline: [/svelte/, /figma-ui3-kit-svelte/, /@testing-library/]
      }
    }
  }
}));
