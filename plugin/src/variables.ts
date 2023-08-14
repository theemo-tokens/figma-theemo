import { getValueAsHex } from './styles';

export function findVariableFromAlias(alias: VariableAlias) {
  return figma.variables.getLocalVariables().find((variable) => variable.id === alias.id);
}

export function findCollection(variable: Variable) {
  return figma.variables.getLocalVariableCollections().find(collection => collection.id === variable.variableCollectionId);
}

export function getValue(variable: Variable, mode?: string) {
  const collection = findCollection(variable) as VariableCollection;
  const usedMode = mode && collection.modes.find(collMode => collMode.modeId === mode) 
    ? mode 
    : collection.defaultModeId;
  return variable.valuesByMode[usedMode];
}

export function isAlias(value: VariableValue): value is VariableAlias {
  return (value as VariableAlias).type !== undefined && (value as VariableAlias).type === 'VARIABLE_ALIAS';
}

export function getResolvedValue(variable: Variable, mode?: string) {
  const value = getValue(variable, mode);

  if (isAlias(value)) {
    return getResolvedValue(findVariableFromAlias(value) as Variable, mode);
  }

  return value;
}

export function findColorForVariable(variable: Variable, mode?: string) {
  const value = getResolvedValue(variable, mode);

  return getValueAsHex(value as RGBA);
}