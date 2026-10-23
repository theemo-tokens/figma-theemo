import { describe, test, expect } from 'vitest';
import { colord } from 'colord';
import { isColorValue } from '@core/colors';
import { applyTransforms } from '../../src/plugin/styles';
import { getResolvedValue } from '../../src/plugin/variables';
const rgb = { r: 0.8, g: 0.1, b: 0.1, a: 1 };

// applyTransforms hands out 0..1 channels, colord wants 0..255 rgb
const toHsl = (c: RGBA) => colord({ r: c.r * 255, g: c.g * 255, b: c.b * 255, a: c.a }).toHsl();

describe('applyTransforms', () => {
  test('keeps ordinary transforms within 0..1', () => {
    const out = applyTransforms(rgb, { hue: 45, saturation: 20, lightness: -10, opacity: 50 });

    for (const channel of Object.values(out)) {
      expect(channel).toBeGreaterThanOrEqual(0);
      expect(channel).toBeLessThanOrEqual(1);
    }
  });

  test('garbage transform values never produce NaN/out-of-range channels', () => {
    // e.g. `1e999` in a config JSON parses to Infinity; strings/objects/null
    // can appear from older plugin versions or hand-edited configs
    const garbage = ['45', null, undefined, NaN, Infinity, -Infinity, 1e308, {}, [1, 2], -999999];

    for (const a of garbage) {
      for (const b of garbage) {
        const out = applyTransforms(rgb, {
          hue: a,
          saturation: a,
          lightness: b,
          opacity: b
        } as never);

        for (const channel of Object.values(out)) {
          expect(typeof channel).toBe('number');
          expect(Number.isFinite(channel)).toBe(true);
          expect(channel).toBeGreaterThanOrEqual(0);
          expect(channel).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  test('clamps out-of-gamut (display-p3) origin colors', () => {
    const out = applyTransforms({ r: -0.08, g: 0.42, b: 1.03, a: 0.5 }, { hue: 10 });

    for (const channel of Object.values(out)) {
      expect(channel).toBeGreaterThanOrEqual(0);
      expect(channel).toBeLessThanOrEqual(1);
    }
  });

  test('hue shifts by degrees, matching theemo CSS calc(h + hue)', () => {
    const red = { r: 1, g: 0, b: 0, a: 1 };
    const rotated = applyTransforms(red, { hue: 180 });

    // red is hsl(0, 100%, 50%) -> hsl(180, ...) = cyan; the earlier /100
    // made this a 1.8-degree (invisible) nudge
    expect(rotated.r).toBeCloseTo(0, 2);
    expect(rotated.g).toBeCloseTo(1, 2);
    expect(rotated.b).toBeCloseTo(1, 2);

    const hsl45 = toHsl(applyTransforms(red, { hue: 45 }));
    expect(hsl45.h).toBeCloseTo(45, 0);
  });

  test('saturation shifts HSL percentage points', () => {
    const desaturated = applyTransforms({ r: 1, g: 0, b: 0, a: 1 }, { saturation: -50 });

    expect(toHsl(desaturated).s).toBeCloseTo(50, 0);
  });
});

describe('isColorValue', () => {
  test('accepts rgb and rgba objects', () => {
    expect(isColorValue({ r: 0.5, g: 0.5, b: 0.5 })).toBe(true);
    expect(isColorValue({ r: 0.5, g: 0.5, b: 0.5, a: 1 })).toBe(true);
  });

  test('rejects non-color values', () => {
    expect(isColorValue(55)).toBe(false);
    expect(isColorValue('brand')).toBe(false);
    expect(isColorValue(true)).toBe(false);
    expect(isColorValue(null)).toBe(false);
    expect(isColorValue(undefined)).toBe(false);
    expect(isColorValue({ type: 'VARIABLE_ALIAS', id: 'V:1' })).toBe(false);
    expect(isColorValue({ r: NaN, g: 0, b: 0 })).toBe(false);
  });
});

describe('getResolvedValue', () => {
  test('returns null for aliases ending at a non-local variable', async () => {
    // published-library / deleted variable: not listed by getLocalVariablesAsync()
    ((globalThis as any).figma as any).variables = {
      getLocalVariablesAsync: () => Promise.resolve([]),
      getLocalVariableCollectionsAsync: () =>
        Promise.resolve([
          {
            id: 'C:1',
            name: 'coll',
            defaultModeId: 'm1',
            modes: [{ modeId: 'm1', name: 'Mode 1' }],
            variableIds: []
          }
        ])
    };

    const link = {
      id: 'V:link',
      variableCollectionId: 'C:1',
      valuesByMode: { m1: { type: 'VARIABLE_ALIAS', id: 'V:gone' } }
    } as unknown as Variable;

    expect(await getResolvedValue(link, 'm1')).toBeNull();
  });

  test('resolves a local alias chain', async () => {
    const target = {
      id: 'V:origin',
      variableCollectionId: 'C:1',
      valuesByMode: { m1: { r: 1, g: 0, b: 0 } }
    } as unknown as Variable;
    const link = {
      id: 'V:link',
      variableCollectionId: 'C:1',
      valuesByMode: { m1: { type: 'VARIABLE_ALIAS', id: 'V:origin' } }
    } as unknown as Variable;

    ((globalThis as any).figma as any).variables = {
      getLocalVariablesAsync: () => Promise.resolve([target, link]),
      getLocalVariableCollectionsAsync: () =>
        Promise.resolve([
          {
            id: 'C:1',
            name: 'coll',
            defaultModeId: 'm1',
            modes: [{ modeId: 'm1', name: 'Mode 1' }],
            variableIds: ['V:origin', 'V:link']
          }
        ])
    };

    expect(await getResolvedValue(link, 'm1')).toEqual({ r: 1, g: 0, b: 0 });
  });
});
