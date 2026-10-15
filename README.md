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

Then point Figma to the `manifest.json` in this repository to load the plugin.

More documentation is available at [theemo.io](https://theemo.io).
