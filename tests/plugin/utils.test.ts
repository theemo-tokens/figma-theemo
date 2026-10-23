import { describe, test, expect } from 'vitest';
import { serialize } from '../../src/plugin/utils';

const MIXED = Symbol('figma.mixed');

describe('Utils | serialize', () => {
  test('drops symbol values like figma.mixed', () => {
    const descriptor = {
      id: '1:25',
      name: 'style',
      fontName: MIXED,
      fontSize: 16
    };

    expect(serialize(descriptor)).toStrictEqual({ id: '1:25', name: 'style', fontSize: 16 });
  });

  test('drops symbol values nested in objects', () => {
    const descriptor = {
      id: '1:25',
      style: {
        name: 'style',
        lineHeight: MIXED,
        letterSpacing: { value: 0, unit: 'PIXELS' }
      }
    };

    const result = serialize(descriptor) as { style: Record<string, unknown> };

    expect('lineHeight' in result.style).toBe(false);
    expect(result.style.letterSpacing).toStrictEqual({ value: 0, unit: 'PIXELS' });
  });

  test('drops symbol values in array entries', () => {
    const descriptor = {
      id: '1:25',
      paints: [
        { type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: MIXED },
        { type: 'SOLID', color: { r: 1, g: 1, b: 1 } }
      ]
    };

    const result = serialize(descriptor) as { paints: Record<string, unknown>[] };

    expect(result.paints).toHaveLength(2);
    expect('opacity' in result.paints[0]).toBe(false);
    expect(result.paints[0].type).toBe('SOLID');
    expect(result.paints[1].color).toStrictEqual({ r: 1, g: 1, b: 1 });
  });

  test('keeps non-symbol primitives and plain values intact', () => {
    const descriptor = {
      id: '1:25',
      name: 'style',
      description: '',
      remote: false,
      key: 'abc',
      type: 'PAINT'
    };

    expect(serialize(descriptor)).toStrictEqual(descriptor);
  });
});
