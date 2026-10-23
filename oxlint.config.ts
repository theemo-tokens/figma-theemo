import { resolve } from 'node:path';
import { defineConfig } from 'oxlint';

// eslint-plugin-boundaries runs as an Oxlint JS plugin, recreating the
// import boundaries that the core/plugin/ui package split enforced
// physically through pnpm's isolated node_modules.
export default defineConfig({
  ignorePatterns: ['dist/**'],
  jsPlugins: ['eslint-plugin-boundaries'],
  settings: {
    'boundaries/root-path': resolve(import.meta.dirname),
    // only the source trees are classified; config files at the root are
    // left to plain oxlint
    'boundaries/include': ['src/**/*.ts', 'src/**/*.svelte', 'tests/**/*.ts'],
    'boundaries/elements': [
      { type: 'core', pattern: 'src/core/**' },
      { type: 'plugin', pattern: 'src/plugin/**' },
      { type: 'ui', pattern: 'src/ui/**' },
      { type: 'plugin-test', pattern: 'tests/plugin/**' },
      { type: 'ui-test', pattern: 'tests/ui/**' }
    ],
    // resolves extensionless TS imports, the '@core' tsconfig path alias,
    // and the .svelte/.css specifiers used by the UI
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        extensions: ['.ts', '.js', '.svelte', '.css']
      },
      node: true
    }
  },
  rules: {
    'boundaries/dependencies': [
      'error',
      {
        // anything not explicitly allowed below is a boundary violation —
        // including external packages (checkAllOrigins), mirroring which
        // dependencies each former package's package.json could resolve
        default: 'disallow',
        checkAllOrigins: true,
        checkUnknownLocals: true,
        policies: [
          {
            // the shared core is the only tree both realms may import
            from: { element: { type: ['plugin', 'ui'] } },
            allow: { to: { element: { type: 'core' } } }
          },
          {
            // tests see their own realm and the core, never the other realm
            from: { element: { type: 'plugin-test' } },
            allow: { to: { element: { type: ['plugin', 'core'] } } }
          },
          {
            from: { element: { type: 'ui-test' } },
            allow: { to: { element: { type: ['ui', 'core'] } } }
          },
          {
            // old @theemo-figma/plugin package.json: colord; test devDeps:
            // vitest, figma-api-stub
            from: { element: { type: ['plugin', 'plugin-test'] } },
            allow: {
              to: {
                module: { origin: 'external', source: ['colord', 'vitest', 'figma-api-stub'] }
              }
            }
          },
          {
            // old @theemo-figma/ui package.json: colord, figma-ui3-kit-svelte,
            // makeup-listbox, svelte; test devDeps: vitest, @testing-library/svelte
            from: { element: { type: ['ui', 'ui-test'] } },
            allow: {
              to: {
                module: {
                  origin: 'external',
                  source: [
                    'colord',
                    'figma-ui3-kit-svelte',
                    'makeup-listbox',
                    'svelte',
                    'vitest',
                    '@testing-library/svelte'
                  ]
                }
              }
            }
          },
          {
            // node builtins (node:fs / node:path in the bundle regression guard)
            from: { element: { type: ['plugin-test', 'ui-test'] } },
            allow: { to: { module: { origin: 'core' } } }
          }
        ]
      }
    ],
    // unresolvable local imports must not silently escape boundary checks
    'boundaries/no-unknown-dependencies': 'error',
    // new source directories need an explicit element classification
    'boundaries/no-unknown-files': 'error'
  }
});
