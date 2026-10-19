import type { StyleDescriptor } from '@theemo-figma/core/styles/index';
import { EventName } from '@theemo-figma/core/styles/events';

/** Drive the UI exactly like the plugin's Emitter does:
 *  figma.ui.postMessage({ event, data }) -> window 'message' with pluginMessage envelope */
export function emit(event: string, data?: unknown) {
  window.dispatchEvent(new MessageEvent('message', { data: { pluginMessage: { event, data } } }));
}

export function solidColor(
  id: string,
  name: string,
  color = { r: 1, g: 0, b: 0 },
  paintExtra: Record<string, unknown> = {},
): StyleDescriptor {
  return {
    id,
    name,
    style: {
      type: 'PAINT',
      paints: [{ type: 'SOLID', color, opacity: 1, ...paintExtra }],
    },
  } as unknown as StyleDescriptor;
}

export function textColor(id: string, name: string): StyleDescriptor {
  return {
    id,
    name,
    style: { type: 'TEXT', fontSize: 16 },
  } as unknown as StyleDescriptor;
}

export function effectColor(id: string, name: string): StyleDescriptor {
  return {
    id,
    name,
    style: { type: 'EFFECT', effects: [] },
  } as unknown as StyleDescriptor;
}

export const VARIABLE_ID = 'VariableID:42:1';
export const ALIAS_TARGET_ID = 'VariableID:42:2';
export const COLLECTION_ID = 'VariableCollectionId:1:1';
export const MODE_LIGHT = '0:1';
export const MODE_DARK = '0:2';

export function colorVariable(id = VARIABLE_ID, name = 'brand/red'): Variable {
  return {
    id,
    name,
    variableCollectionId: COLLECTION_ID,
    resolvedType: 'COLOR',
    valuesByMode: {
      [MODE_LIGHT]: { r: 0.8, g: 0.1, b: 0.1 },
      [MODE_DARK]: { r: 0.4, g: 0.05, b: 0.05 },
    },
  } as unknown as Variable;
}

export function aliasVariable(id = ALIAS_TARGET_ID, name = 'base/red'): Variable {
  return {
    id,
    name,
    variableCollectionId: COLLECTION_ID,
    resolvedType: 'COLOR',
    valuesByMode: {
      [MODE_LIGHT]: { r: 1, g: 0, b: 0 },
      [MODE_DARK]: { r: 0.5, g: 0, b: 0 },
    },
  } as unknown as Variable;
}

export function brandCollection(): VariableCollection {
  return {
    id: COLLECTION_ID,
    name: 'Brand',
    defaultModeId: MODE_LIGHT,
    modes: [
      { modeId: MODE_LIGHT, name: 'Light' },
      { modeId: MODE_DARK, name: 'Dark' },
    ],
    variableIds: [VARIABLE_ID, ALIAS_TARGET_ID],
  } as unknown as VariableCollection;
}

/** A paint style bound to VARIABLE_ID through a VARIABLE_ALIAS */
export function aliasedColor(id = '1:1', name = 'Brand Red'): StyleDescriptor {
  return solidColor(
    id,
    name,
    { r: 0.8, g: 0.1, b: 0.1 },
    {
      boundVariables: { color: { type: 'VARIABLE_ALIAS', id: VARIABLE_ID } },
    },
  );
}

export function resetBus(
  styles: StyleDescriptor[] = [],
  config: unknown = { styles: [], variables: [] },
) {
  emit(EventName.StylesInitiated, styles);
  emit('variables-collected', []);
  emit('collections-collected', []);
  emit(EventName.ConfigArrived, config);
}
