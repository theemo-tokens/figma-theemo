import { describe, test, expect } from 'vitest';
import { get } from 'svelte/store';
import {
  colors,
  texts,
  effects,
  references,
  variables,
  getColorAsCSS,
  hasReference,
  getVariableConfig
} from '../../src/ui/sections/styles/data';
import { EventName } from '@core/styles/events';
import {
  emit,
  solidColor,
  textColor,
  effectColor,
  resetBus,
  VARIABLE_ID,
  MODE_LIGHT
} from './fixtures';
import type { StyleDescriptor } from '@core/styles/index';

describe('message bus -> style stores', () => {
  test('StylesInitiated seeds styles, split by style type', () => {
    resetBus([
      solidColor('1:1', 'Red'),
      solidColor('1:2', 'Blue', { r: 0, g: 0, b: 1 }),
      textColor('2:1', 'Headline'),
      effectColor('3:1', 'Drop Shadow')
    ]);

    expect(get(colors).map((s) => s.name)).toEqual(['Red', 'Blue']);
    expect(get(texts).map((s) => s.name)).toEqual(['Headline']);
    expect(get(effects).map((s) => s.name)).toEqual(['Drop Shadow']);
  });

  test('StyleCreated appends a style', () => {
    resetBus([solidColor('1:1', 'Red')]);

    emit(EventName.StyleCreated, solidColor('1:2', 'Blue', { r: 0, g: 0, b: 1 }));

    expect(get(colors)).toHaveLength(2);
    expect(get(colors)[1].name).toBe('Blue');
  });

  test('StyleUpdated replaces the style in place', () => {
    resetBus([solidColor('1:1', 'Red'), solidColor('1:2', 'Blue')]);

    emit(EventName.StyleUpdated, solidColor('1:1', 'Crimson', { r: 0.6, g: 0, b: 0 }));

    expect(get(colors).map((s) => s.name)).toEqual(['Crimson', 'Blue']);
  });

  test('StyleUpdated for an unknown id is a no-op', () => {
    resetBus([solidColor('1:1', 'Red')]);

    emit(EventName.StyleUpdated, solidColor('9:9', 'Ghost'));

    expect(get(colors)).toHaveLength(1);
  });

  test('StyleDeleted removes the style by id', () => {
    resetBus([solidColor('1:1', 'Red'), solidColor('1:2', 'Blue')]);

    emit(EventName.StyleDeleted, '1:1');

    expect(get(colors).map((s) => s.name)).toEqual(['Blue']);
  });

  test('StyleDeleted for an unknown id is a no-op', () => {
    resetBus([solidColor('1:1', 'Red')]);

    emit(EventName.StyleDeleted, '9:9');

    expect(get(colors)).toHaveLength(1);
  });
});

describe('message bus -> config stores', () => {
  test('ConfigArrived feeds references and variables', () => {
    const config = {
      styles: [{ styleId: '1:1', referenceId: '2:1' }],
      variables: [
        {
          variableId: VARIABLE_ID,
          modeId: MODE_LIGHT,
          referenceId: 'VariableID:42:2',
          transforms: { hue: 10 }
        }
      ]
    };

    emit(EventName.ConfigArrived, config);

    expect(get(references)).toEqual(config.styles);
    expect(get(variables)).toEqual(config.variables);
  });

  test('hasReference and getVariableConfig resolve per mode', () => {
    emit(EventName.ConfigArrived, {
      styles: [],
      variables: [
        {
          variableId: VARIABLE_ID,
          modeId: MODE_LIGHT,
          referenceId: 'VariableID:42:2',
          transforms: { hue: 10 }
        }
      ]
    });

    const variable = { id: VARIABLE_ID } as Variable;

    expect(hasReference(variable, MODE_LIGHT)).toBeDefined();
    expect(hasReference(variable, '0:2')).toBeUndefined();
    expect(getVariableConfig(variable, MODE_LIGHT)?.transforms).toEqual({ hue: 10 });
  });
});

describe('getColorAsCSS', () => {
  function paint(style: StyleDescriptor) {
    return style.style as PaintStyle;
  }

  test('converts solid paints to rgb css with opacity', () => {
    expect(getColorAsCSS(paint(solidColor('1:1', 'Red')))).toBe('rgb(255, 0, 0, 1)');
    expect(getColorAsCSS(paint(solidColor('1:2', 'Blue', { r: 0, g: 0, b: 1 })))).toBe(
      'rgb(0, 0, 255, 1)'
    );
  });

  test('returns undefined for non-solid paints', () => {
    const gradient = {
      id: '1:1',
      name: 'Shine',
      style: { type: 'PAINT', paints: [{ type: 'GRADIENT_LINEAR' }] }
    } as unknown as StyleDescriptor;

    expect(getColorAsCSS(paint(gradient))).toBeUndefined();
  });
});
