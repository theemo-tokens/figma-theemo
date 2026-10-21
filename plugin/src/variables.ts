import { isColorValue } from '@theemo-figma/core/colors';
import { getValueAsHex } from './styles';

export function findVariableFromAlias(alias: VariableAlias) {
  return figma.variables.getLocalVariables().find((variable) => variable.id === alias.id);
}

export function findCollection(variable: Variable) {
  return figma.variables
    .getLocalVariableCollections()
    .find((collection) => collection.id === variable.variableCollectionId);
}

export function getValue(variable: Variable, mode?: string) {
  const collection = findCollection(variable) as VariableCollection;
  const usedMode =
    mode && collection.modes.find((collMode) => collMode.modeId === mode)
      ? mode
      : collection.defaultModeId;
  return variable.valuesByMode[usedMode];
}

export function isAlias(value: VariableValue | null | undefined): value is VariableAlias {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as VariableAlias).type === 'VARIABLE_ALIAS'
  );
}

/** Resolves a chain of variable aliases. Returns null when the chain ends at a
 *  variable that isn't available locally (deleted or a published-library
 *  variable - `getLocalVariables()` never lists those). */
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

  return value;
}

export function findColorForVariable(variable: Variable, mode?: string) {
  const value = getResolvedValue(variable, mode);

  if (!isColorValue(value)) {
    return 'transparent';
  }

  return getValueAsHex(value);
}
