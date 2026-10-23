import { defineConfig } from 'vitest/config';
import type { PluginOption } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { viteSingleFile } from 'vite-plugin-singlefile';
import svg from 'vite-plugin-svgo';
import { fileURLToPath } from 'node:url';

// Vite environments: `client` builds the UI iframe (index.html entry) and
// `plugin` builds the Figma main-thread bundle (src/plugin/main.ts).
// Vitest maps its projects to the same names ('plugin', 'ui').
const UI_ENVIRONMENTS = ['client', 'ui'];

// Scope a plugin to the named environments. Without this the singlefile
// plugin would rewrite the plugin env's IIFE output as if it were an HTML
// app; svelte() stays unscoped (it must transform in the 'ui' test project
// too). Nested arrays are walked; plain sync objects are the only shape the
// plugins used here resolve to.
type ScopeTarget = { name: string } & Record<string, unknown>;

function isScopeable(entry: unknown): entry is ScopeTarget {
  return !!entry && typeof entry === 'object' && 'name' in entry && !Array.isArray(entry);
}

function onlyIn(names: string[], plugins: PluginOption[]): PluginOption[] {
  return plugins.map((entry) => {
    if (Array.isArray(entry)) return onlyIn(names, entry);
    if (isScopeable(entry)) {
      return { ...entry, applyToEnvironment: (env: { name: string }) => names.includes(env.name) };
    }
    return entry;
  });
}

export default defineConfig(({ command }) => ({
  // plain `vite build` builds all environments (equivalent to `vite build --app`);
  // the keys are build-only so Vitest (command 'serve') stays untouched by them
  ...(command === 'build' && {
    // build exactly the two artifacts the manifest consumes — skipping the
    // implicit `ssr` environment that app mode would otherwise build
    builder: {
      buildApp: async (builder) => {
        await builder.build(builder.environments.client);
        await builder.build(builder.environments.plugin);
      }
    },
    environments: {
      plugin: {
        // bundler-style resolution conditions, like the previous standalone build
        consumer: 'client',
        build: {
          outDir: 'dist',
          emptyOutDir: false,
          target: 'es2015',
          minify: false,
          rolldownOptions: {
            input: { main: 'src/plugin/main.ts' },
            output: {
              format: 'iife',
              entryFileNames: 'main.js'
            }
          }
        }
      }
    }
  }),

  plugins: [
    svelte(),
    ...onlyIn(UI_ENVIRONMENTS, [
      viteSingleFile(),
      svg({ plugins: ['preset-default', 'removeDimensions'] })
    ])
  ],

  resolve: {
    alias: {
      '@core': fileURLToPath(new URL('./src/core/', import.meta.url))
    }
  },

  build: {
    outDir: 'dist',
    // dist holds one artifact per realm (main.js / index.html); each
    // environment must not wipe the other's file
    emptyOutDir: false
  },

  test: {
    projects: [
      {
        name: 'plugin',
        extends: true,
        test: {
          environment: 'node',
          include: ['tests/plugin/**/*.test.ts'],
          setupFiles: ['tests/plugin/setup.ts']
        }
      },
      {
        name: 'ui',
        extends: true,
        // Vitest's SSR-style pipeline would resolve Svelte to its server
        // build (no mount()); pin the browser build here. An explicit list
        // *replaces* Vite's defaults under rolldown-vite — production
        // builds must keep the defaults (tests-only, hence not at root).
        resolve: { conditions: ['browser'] },
        test: {
          environment: 'jsdom',
          include: ['tests/ui/**/*.test.ts'],
          setupFiles: ['tests/ui/setup.ts'],
          server: {
            // svelte packages ship uncompiled sources; keep them in vite's
            // module graph (not Node SSR) so the browser build applies
            deps: {
              inline: [/svelte/, /figma-ui3-kit-svelte/, /@testing-library/]
            }
          }
        }
      }
    ]
  }
}));
