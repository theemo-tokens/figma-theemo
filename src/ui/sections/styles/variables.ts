import { writable, get } from 'svelte/store';
import { isColorValue } from '@core/colors';
import { messenger } from '../../infrastructure';
import { colord } from 'colord';

export const variables = writable<Variable[]>([]);
export const collections = writable<VariableCollection[]>([]);

messenger.addListener('variables-collected', (payload: Variable[]) => {
  variables.set(payload);
});

messenger.addListener('collections-collected', (payload: VariableCollection[]) => {
  collections.set(payload);
});

export function findVariableById(id: string) {
  return get(variables).find((variable) => variable.id === id);
}

export function findVariableFromAlias(alias: VariableAlias) {
  return get(variables).find((variable) => variable.id === alias.id);
}

export function findCollection(variable: Variable) {
  return get(collections).find((collection) => collection.id === variable.variableCollectionId);
}

export function getValue(variable: Variable, mode?: string) {
  const collection = findCollection(variable);
  const usedMode = mode ?? collection?.defaultModeId;

  return usedMode === undefined ? undefined : variable.valuesByMode[usedMode];
}

export function isAlias(value: VariableValue | null | undefined): value is VariableAlias {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as VariableAlias).type === 'VARIABLE_ALIAS'
  );
}

/** Resolves a chain of variable aliases. Returns null when the chain ends at a
 *  variable that isn't in the collected list (deleted or published-library
 *  variables are not reported to the plugin UI). */
export function getResolvedValue(
  variable: Variable | undefined | null,
  mode?: string
): VariableValue | null {
  if (!variable) {
    return null;
  }

  const value = getValue(variable, mode);

  if (isAlias(value)) {
    return getResolvedValue(findVariableFromAlias(value), mode);
  }

  return value ?? null;
}

export function getValueAsHex(value: RGB | RGBA) {
  const alpha = (value as RGBA).a ? `, ${(value as RGBA).a}` : '';
  const color = colord(`rgb(${value.r * 255}, ${value.g * 255}, ${value.b * 255}${alpha})`);

  return color.toHex().toUpperCase();
}

export function findColorForVariable(variable: Variable, mode?: string) {
  const value = getResolvedValue(variable, mode);

  if (!isColorValue(value)) {
    return 'transparent';
  }

  return getValueAsHex(value);
}
