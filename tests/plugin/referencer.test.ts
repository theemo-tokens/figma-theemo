import { describe, test, expect, afterEach, vi } from 'vitest';
import { EventName } from '@core/styles/events';
import Emitter from '../../src/plugin/infrastructure/emitter';
import { listen } from '../../src/plugin/sections/styles/referencer';
import { storeConfig } from '../../src/plugin/sections/styles/store';
import { applyTransforms } from '../../src/plugin/styles';

const INTER = { family: 'Inter', style: 'Regular' };
const ROBOTO = { family: 'Roboto Mono', style: 'Regular' };

const fontKey = (font: FontName | undefined) => `${font?.family}/${font?.style}`;

/** A TextStyle stand-in that enforces Figma's real rule: writing any text
 *  property throws while the style's current font isn't loaded, and assigning
 *  a fontName throws while that incoming font isn't loaded. loadFontAsync is
 *  mocked to register into `loaded`. */
function createGuardedTextStyle(id: string, name: string, fontName: FontName, loaded: Set<string>) {
  const state: Record<string, unknown> = {
    id,
    name,
    type: 'TEXT',
    fontName,
    fontSize: 12,
    letterSpacing: { value: 0, unit: 'PIXELS' },
    lineHeight: { value: 16, unit: 'PIXELS' },
    paragraphIndent: 0,
    paragraphSpacing: 0,
    textCase: 'ORIGINAL',
    textDecoration: 'NONE'
  };

  return new Proxy(state, {
    set(target, prop, value) {
      const needs =
        prop === 'fontName' ? fontKey(value as FontName) : fontKey(target.fontName as FontName);

      if (typeof prop === 'string' && !loaded.has(needs)) {
        throw new Error(`Cannot write to node with unloaded font "${needs}"`);
      }

      target[prop as string] = value;
      return true;
    }
  }) as unknown as TextStyle;
}

function mockFonts(loaded: Set<string>) {
  vi.spyOn(figma, 'loadFontAsync').mockImplementation((font: FontNameInput) => {
    loaded.add(`${font.family}/${font.style ?? '*'}`);
    return Promise.resolve();
  });
}

// the referencer awaits font loading before writing, let that settle
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

afterEach(() => {
  vi.restoreAllMocks();
});

describe('referencer | text style references', () => {
  test('propagates a text style update to the referencing style', async () => {
    const loaded = new Set<string>();
    mockFonts(loaded);

    const emitter = new Emitter();
    listen(emitter);

    const prose = createGuardedTextStyle('S:prose,', 'prose', INTER, loaded);
    const body = createGuardedTextStyle('S:body,', 'body', INTER, loaded);
    vi.spyOn(figma, 'getLocalTextStyles').mockReturnValue([prose, body]);

    storeConfig({ styles: [{ styleId: 'S:body,', referenceId: 'S:prose,' }], variables: [] });

    // prose is edited: font size and line height change (observer emits the
    // serialized descriptor - `body` starts out as an exact copy of prose)
    emitter.sendEvent(EventName.StyleUpdated, {
      id: 'S:prose,',
      name: 'prose',
      style: {
        id: 'S:prose,',
        name: 'prose',
        type: 'TEXT',
        fontName: INTER,
        fontSize: 20,
        letterSpacing: { value: 1, unit: 'PIXELS' },
        lineHeight: { value: 30, unit: 'PIXELS' },
        paragraphIndent: 0,
        paragraphSpacing: 8,
        textCase: 'UPPER',
        textDecoration: 'UNDERLINE'
      }
    } as never);

    await flush();

    // previously this threw on the first write (unloaded font) and only the
    // catch fallback re-applied fontName - the style stayed visually identical
    expect(body.fontSize).toBe(20);
    expect(body.lineHeight).toEqual({ value: 30, unit: 'PIXELS' });
    expect(body.letterSpacing).toEqual({ value: 1, unit: 'PIXELS' });
    expect(body.paragraphSpacing).toBe(8);
    expect(body.textCase).toBe('UPPER');
    expect(body.textDecoration).toBe('UNDERLINE');
    expect(loaded.has(fontKey(INTER))).toBe(true);
  });

  test('loads both fonts before copying a changed fontName', async () => {
    const loaded = new Set<string>();
    mockFonts(loaded);

    const emitter = new Emitter();
    listen(emitter);

    const prose = createGuardedTextStyle('S:prose,', 'prose', INTER, loaded);
    const body = createGuardedTextStyle('S:body,', 'body', ROBOTO, loaded);
    vi.spyOn(figma, 'getLocalTextStyles').mockReturnValue([prose, body]);

    storeConfig({ styles: [{ styleId: 'S:body,', referenceId: 'S:prose,' }], variables: [] });

    emitter.sendEvent(EventName.StyleUpdated, {
      id: 'S:prose,',
      name: 'prose',
      style: {
        id: 'S:prose,',
        name: 'prose',
        type: 'TEXT',
        fontName: INTER,
        fontSize: 20,
        letterSpacing: { value: 0, unit: 'PIXELS' },
        lineHeight: { value: 24, unit: 'PIXELS' },
        paragraphIndent: 0,
        paragraphSpacing: 0,
        textCase: 'ORIGINAL',
        textDecoration: 'NONE'
      }
    } as never);

    await flush();

    // the style's own (old) font and the incoming font both need loading,
    // otherwise no property can be written
    expect(loaded.has(fontKey(ROBOTO))).toBe(true);
    expect(loaded.has(fontKey(INTER))).toBe(true);
    expect(body.fontName).toEqual(INTER);
    expect(body.fontSize).toBe(20);
    expect(body.lineHeight).toEqual({ value: 24, unit: 'PIXELS' });
  });

  test('keeps updating live references when one points to a deleted style', async () => {
    const loaded = new Set<string>();
    mockFonts(loaded);

    const emitter = new Emitter();
    listen(emitter);

    const prose = createGuardedTextStyle('S:prose,', 'prose', INTER, loaded);
    const body = createGuardedTextStyle('S:body,', 'body', INTER, loaded);
    vi.spyOn(figma, 'getLocalTextStyles').mockReturnValue([prose, body]);

    storeConfig({
      styles: [
        { styleId: 'S:deleted,', referenceId: 'S:prose,' },
        { styleId: 'S:body,', referenceId: 'S:prose,' }
      ],
      variables: []
    });

    emitter.sendEvent(EventName.StyleUpdated, {
      id: 'S:prose,',
      name: 'prose',
      style: {
        id: 'S:prose,',
        name: 'prose',
        type: 'TEXT',
        fontName: INTER,
        fontSize: 24,
        letterSpacing: { value: 0, unit: 'PIXELS' },
        lineHeight: { value: 32, unit: 'PIXELS' },
        paragraphIndent: 0,
        paragraphSpacing: 0,
        textCase: 'ORIGINAL',
        textDecoration: 'NONE'
      }
    } as never);

    await flush();

    expect(body.fontSize).toBe(24);
  });
});

describe('referencer | paint variable references', () => {
  test('re-derives consuming variables when the origin style updates', () => {
    const setValueForMode = vi.fn();

    const origin = {
      id: 'V:origin',
      name: 'base/red',
      resolvedType: 'COLOR',
      variableCollectionId: 'C:base',
      valuesByMode: { '0:1': { r: 1, g: 0, b: 0 } }
    };
    const consuming = {
      id: 'V:consuming',
      name: 'brand/red',
      resolvedType: 'COLOR',
      variableCollectionId: 'C:brand',
      valuesByMode: {},
      setValueForMode
    };

    (globalThis as any).figma.variables = {
      getVariableById: (id: string) => [origin, consuming].find((v) => v.id === id),
      getLocalVariables: () => [origin, consuming],
      getLocalVariableCollections: () => [
        {
          id: 'C:base',
          name: 'Base',
          defaultModeId: '0:1',
          modes: [{ modeId: '0:1', name: 'Light' }],
          variableIds: [origin.id]
        },
        {
          id: 'C:brand',
          name: 'Brand',
          defaultModeId: '0:1',
          modes: [{ modeId: '0:1', name: 'Light' }],
          variableIds: [consuming.id]
        }
      ]
    };

    storeConfig({
      styles: [],
      variables: [
        // the pair under test, plus an orphan whose target no longer exists
        {
          variableId: 'V:consuming',
          modeId: '0:1',
          referenceId: 'V:origin',
          transforms: { lightness: 20 }
        },
        {
          variableId: 'V:gone',
          modeId: '0:1',
          referenceId: 'V:origin',
          transforms: { lightness: 20 }
        }
      ]
    });

    const emitter = new Emitter();
    listen(emitter);

    // StyleUpdated of a paint style bound to the origin - what the observer
    // emits when the origin's resolved color changes
    emitter.sendEvent(EventName.StyleUpdated, {
      id: 'S:origin,',
      name: 'Base Red',
      style: {
        id: 'S:origin,',
        name: 'Base Red',
        type: 'PAINT',
        paints: [
          {
            type: 'SOLID',
            color: { r: 1, g: 0, b: 0 },
            boundVariables: { color: { type: 'VARIABLE_ALIAS', id: 'V:origin' } }
          }
        ]
      }
    } as never);

    const expected = applyTransforms({ r: 1, g: 0, b: 0, a: 1 }, { lightness: 20 });
    expect(setValueForMode).toHaveBeenCalledWith('0:1', expected);
  });
});
