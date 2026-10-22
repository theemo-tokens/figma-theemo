import { describe, test, expect, vi, beforeEach } from 'vitest';
import { createFigma } from 'figma-api-stub';
import SaveTransformsCommand from '../src/sections/styles/commands/save-transforms';
import Commander from '../src/infrastructure/commander';
import Emitter from '../src/infrastructure/emitter';
import { readConfig } from '../src/sections/styles/store';
import { applyTransforms } from '../src/styles';

// fresh stub per test: the `.theemo/config` grid style would leak state
beforeEach(() => {
  (globalThis as any).figma = createFigma({});
});

const ORIGIN = {
  id: 'V:origin',
  name: 'base/red',
  resolvedType: 'COLOR',
  variableCollectionId: 'C:base',
  valuesByMode: { '0:1': { r: 1, g: 0, b: 0 }, '0:2': { r: 0.5, g: 0, b: 0 } }
};

function installVariablesStub() {
  const consuming = {
    id: 'V:consuming',
    name: 'brand/red',
    resolvedType: 'COLOR',
    variableCollectionId: 'C:brand',
    valuesByMode: { '0:1': { type: 'VARIABLE_ALIAS', id: 'V:origin' } },
    setValueForMode: vi.fn(function (this: any, mode: string, value: unknown) {
      this.valuesByMode[mode] = value;
    })
  };

  // same-collection pair: mode ids are shared with the origin
  const consumingSame = {
    id: 'V:consumingSame',
    name: 'brand/red-2',
    resolvedType: 'COLOR',
    variableCollectionId: 'C:base',
    valuesByMode: { '0:2': { type: 'VARIABLE_ALIAS', id: 'V:origin' } },
    setValueForMode: vi.fn(function (this: any, mode: string, value: unknown) {
      this.valuesByMode[mode] = value;
    })
  };

  (globalThis as any).figma.variables = {
    getVariableById: (id: string) => [ORIGIN, consuming, consumingSame].find((v) => v.id === id),
    getLocalVariables: () => [ORIGIN, consuming, consumingSame],
    getLocalVariableCollections: () => [
      {
        id: 'C:base',
        name: 'Base',
        defaultModeId: '0:1',
        modes: [
          { modeId: '0:1', name: 'Light' },
          { modeId: '0:2', name: 'Dark' }
        ],
        variableIds: [ORIGIN.id, consumingSame.id]
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

  return { consuming, consumingSame };
}

function command() {
  const commander = new Commander(new Emitter());
  const cmd = new SaveTransformsCommand();
  commander.registerCommand(cmd);
  return cmd;
}

describe('SaveTransformsCommand', () => {
  test('applies saved transforms to the consuming variable right away', () => {
    const { consuming } = installVariablesStub();

    // no paint style at all: an earlier version only applied the transform by
    // walking styles bound to the reference, so nothing ever landed
    command().execute({ variableId: consuming.id, modeId: '0:1', transforms: { lightness: 20 } });

    const expected = applyTransforms({ r: 1, g: 0, b: 0, a: 1 }, { lightness: 20 });
    const consumingCalls = consuming.setValueForMode.mock.calls;
    const lastCall = consumingCalls[consumingCalls.length - 1];

    expect(lastCall).toBeDefined();
    expect(lastCall![0]).toBe('0:1');
    expect(lastCall![1]).toEqual(expected);
  });

  test('stores the reference from the alias and keeps the config in shape', () => {
    const { consuming } = installVariablesStub();

    command().execute({ variableId: consuming.id, modeId: '0:1', transforms: { hue: 10 } });

    const config = readConfig();

    expect(config.variables).toHaveLength(1);
    expect(config.variables[0]).toEqual({
      variableId: consuming.id,
      modeId: '0:1',
      transforms: { hue: 10 },
      referenceId: ORIGIN.id
    });
  });

  test('re-applies with the updated transforms when an entry already exists', () => {
    const { consuming } = installVariablesStub();
    const cmd = command();

    cmd.execute({ variableId: consuming.id, modeId: '0:1', transforms: { lightness: 20 } });
    consuming.setValueForMode.mockClear();
    cmd.execute({ variableId: consuming.id, modeId: '0:1', transforms: { lightness: 50 } });

    const expected = applyTransforms({ r: 1, g: 0, b: 0, a: 1 }, { lightness: 50 });
    const consumingCalls = consuming.setValueForMode.mock.calls;
    const lastCall = consumingCalls[consumingCalls.length - 1];

    // only the transform write - no second unlink on an existing entry
    expect(consuming.setValueForMode).toHaveBeenCalledTimes(1);
    expect(lastCall![1]).toEqual(expected);
    expect(readConfig().variables[0].transforms).toEqual({ lightness: 50 });
  });

  test('reads the origin value from the matching mode of a shared collection', () => {
    const { consumingSame } = installVariablesStub();

    command().execute({
      variableId: consumingSame.id,
      modeId: '0:2',
      transforms: { lightness: 20 }
    });

    const expected = applyTransforms({ r: 0.5, g: 0, b: 0, a: 1 }, { lightness: 20 });
    const sameCalls = consumingSame.setValueForMode.mock.calls;
    const lastCall = sameCalls[sameCalls.length - 1];

    expect(lastCall![0]).toBe('0:2');
    expect(lastCall![1]).toEqual(expected);
  });
});
