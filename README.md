<img src="assets/artwork.png">

# Figma Plugin: Theemo

Theemo automates your design tokens by connecting your existing tools and make
them work together, from design to framework integration.

## Manual

The plugin UI has two tabs: **Styles** and **About**. The Styles section works
on top of Figma's local styles and variables:

- **Colors**: paint styles that are bound to a color variable can define
  transforms - Hue, Saturation, Lightness and Opacity - per mode. The
  transformed value is derived from the aliased origin and kept applied
  automatically.
- **Text & Effect**: styles can reference another local style. The reference
  is kept in sync whenever the origin style changes.

The configuration lives inside the document (a dedicated `.theemo/config` grid
style), so it travels with the file.

## Development

First, install the dependencies:

```bash
pnpm install
```

Build the plugin (bundles into `dist/`):

```bash
pnpm build
```

Or run the watch servers:

```bash
pnpm dev
```

Lint and format (orchestrated by Vite+ at the workspace root, installed
locally as a devDependency — no global CLI required; the packages themselves
run plain `vite` / `vitest` / `oxlint` / `oxfmt`):

```bash
pnpm test        # Vitest: plugin logic + UI (bus contract & panels)
pnpm lint        # Oxlint + type checks (tsc, svelte-check) per project
pnpm fmt         # Oxfmt over the whole workspace
```

Each check has an auto-fixing sibling: `pnpm lint:fix` and `pnpm fmt:fix`.
Within a package the umbrella scripts fan out via pnpm's script-pattern
runner (`lint` = `lint:js` + `lint:types`; `lint:fix` = every `lint:*:fix`).

Then point Figma to the `manifest.json` in this repository to load the plugin.

More documentation is available at [theemo.io](https://theemo.io).
