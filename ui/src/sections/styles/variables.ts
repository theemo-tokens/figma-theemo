import { writable, get } from 'svelte/store';
import { messenger } from '../../infrastructure';
import { colord } from 'colord';

export const variables = writable<Variable[]>([]);
export const collections = writable<VariableCollection[]>([]);

messenger.addListener('variables-collected', (payload: Variable[]) => {
  console.log(payload);
  
  variables.set(payload);
});

messenger.addListener('collections-collected', (payload: VariableCollection[]) => {
  console.log(payload);

  collections.set(payload);
});

export function findVariableFromAlias(alias: VariableAlias) {
  return get(variables).find((variable) => variable.id === alias.id);
}

export function findCollection(variable: Variable) {
  return get(collections).find(collection => collection.id === variable.variableCollectionId);
}

export function getValue(variable: Variable, mode?: string) {
  const collection = findCollection(variable);
  const usedMode = mode ?? collection.defaultModeId;
  return variable.valuesByMode[usedMode];
}

export function isAlias(value: VariableValue): value is VariableAlias {
  return (value as VariableAlias).type !== undefined && (value as VariableAlias).type === 'VARIABLE_ALIAS';
}

export function getValueAsHex(value: RGB | RGBA) {
  const alpha = (value as RGBA).a ? `, ${(value as RGBA).a}` : '';
  const color = colord(`rgb(${value.r * 255}, ${value.g * 255}, ${value.b * 255}${alpha})`);

  return color.toHex().toUpperCase();
}

export function findColorForVariable(variable: Variable, mode?: string) {
  const value = getValue(variable, mode);

  if (isAlias(value)) {
    return findColorForVariable(findVariableFromAlias(value));
  }

  return getValueAsHex(value as RGBA);
}