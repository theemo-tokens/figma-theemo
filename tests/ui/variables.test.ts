import { describe, test, expect } from 'vitest';
import { get } from 'svelte/store';
import { isColorValue } from '@core/colors';
import {
  findColorForVariable,
  getResolvedValue,
  variables,
  collections
} from '../../src/ui/sections/styles/variables';
import { brandCollection, MODE_LIGHT } from './fixtures';

function linkVar(id: string, targetId: string) {
  return {
    id,
    name: 'link',
    variableCollectionId: 'C:1',
    resolvedType: 'COLOR',
    valuesByMode: { [MODE_LIGHT]: { type: 'VARIABLE_ALIAS', id: targetId } }
  } as unknown as Variable;
}

function colorVar(id: string, value = { r: 1, g: 0, b: 0 }) {
  return {
    id,
    name: 'solid',
    variableCollectionId: 'C:1',
    resolvedType: 'COLOR',
    valuesByMode: { [MODE_LIGHT]: value }
  } as unknown as Variable;
}

function seed(store: Variable[]) {
  variables.set(store);
  collections.set([brandCollection()]);
}

describe('ui variable helpers', () => {
  test('getResolvedValue resolves a local chain', () => {
    const origin = colorVar('V:origin');
    const link = linkVar('V:link', 'V:origin');
    seed([origin, link]);

    expect(getResolvedValue(link, MODE_LIGHT)).toEqual({ r: 1, g: 0, b: 0 });
  });

  test('getResolvedValue is null for a published-library alias', () => {
    seed([linkVar('V:link', 'VariableID:9999:9999')]);

    const link = get(variables)[0];

    expect(getResolvedValue(link, MODE_LIGHT)).toBeNull();
    expect(findColorForVariable(link, MODE_LIGHT)).toBe('transparent');
  });

  test('findColorForVariable never throws on non-color resolutions', () => {
    const floaty = {
      id: 'V:float',
      name: 'width',
      variableCollectionId: 'C:1',
      resolvedType: 'FLOAT',
      valuesByMode: { [MODE_LIGHT]: 55 }
    } as unknown as Variable;
    const link = linkVar('V:link', 'V:float');
    seed([floaty, link]);

    expect(findColorForVariable(link, MODE_LIGHT)).toBe('transparent');
  });

  test('isColorValue distinguishes colors from aliases and primitives', () => {
    expect(isColorValue({ r: 0.5, g: 0.5, b: 0.5, a: 1 })).toBe(true);
    expect(isColorValue({ type: 'VARIABLE_ALIAS', id: 'V:x' })).toBe(false);
    expect(isColorValue(55)).toBe(false);
    expect(isColorValue(null)).toBe(false);
  });
});
