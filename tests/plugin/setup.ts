// figma-api-stub ships no usable type declarations
import { createFigma } from 'figma-api-stub';

const stub: any = createFigma({});

// figma-api-stub predates the dynamic-page async style APIs - back the ones
// the plugin calls with the stub's sync equivalents
for (const [asyncName, syncName] of [
  ['getLocalPaintStylesAsync', 'getLocalPaintStyles'],
  ['getLocalTextStylesAsync', 'getLocalTextStyles'],
  ['getLocalEffectStylesAsync', 'getLocalEffectStyles'],
  ['getLocalGridStylesAsync', 'getLocalGridStyles']
] as const) {
  stub[asyncName] = () => Promise.resolve(stub[syncName]());
}

(globalThis as any).figma = stub;
