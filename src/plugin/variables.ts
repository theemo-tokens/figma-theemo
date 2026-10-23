import type { VariableConfig } from '@core/styles';
import { isColorValue } from '@core/colors';
import { applyTransforms, getValueAsHex } from './styles';

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

/** The write-back primitive: derive the consuming variable's mode value from
 *  its referenced origin plus the transforms. Works only on variables - used
 *  by both the style event propagation (updatePaintStyle) and the
 *  save-transforms command, so no caller does its own math. */
export function updateVariable(conf: VariableConfig) {
  const variable = figma.variables.getVariableById(conf.variableId);
  const reference = figma.variables.getVariableById(conf.referenceId);

  // transformed values are colors - only COLOR variables accept them
  if (!variable || !reference || variable.resolvedType !== 'COLOR' || !conf.transforms) {
    return;
  }

  const collection = findCollection(variable);
  const referenceCollection = findCollection(reference);

  if (!collection || !referenceCollection) {
    return;
  }

  // same collection: the mode ids align; otherwise read the origin's default
  const modeId =
    collection.id === referenceCollection.id ? conf.modeId : referenceCollection.defaultModeId;
  const originValue = getResolvedValue(reference, modeId);

  // guard: aliases can resolve to non-color values (or disappear into
  // published-library variables) - writing a color to those is what Figma's
  // "newValue failed validation" error reported
  if (!isColorValue(originValue)) {
    return;
  }

  variable.setValueForMode(conf.modeId, applyTransforms(originValue, conf.transforms));
}
