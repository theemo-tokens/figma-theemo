import { describe, test, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Regression guard: a wrong resolve.conditions in vite.config.ts silently
// bundled Svelte's *server* build into dist/index.html, breaking mount()
// only at runtime inside Figma. The two runtimes carry distinct error
// strings, so the built bundle itself can be checked cheaply.
//
// CI builds before testing, so this runs there always; locally it engages
// once a build has happened.
// (process.cwd() is the repo root for vitest and vite build)
const bundlePath = resolve(process.cwd(), 'dist/index.html');

describe('built bundle (dist/index.html)', () => {
  const skip = !existsSync(bundlePath);

  test.skipIf(skip)('contains the Svelte client runtime', () => {
    const html = readFileSync(bundlePath, 'utf8');

    // client-only error code — proves the client runtime is bundled
    expect(html).toContain('effect_update_depth_exceeded');
    // server-only error strings — must never ship in the UI bundle
    expect(html).not.toContain('is not available on the server');
    expect(html).not.toContain('lifecycle_function_unavailable');
  });
});
