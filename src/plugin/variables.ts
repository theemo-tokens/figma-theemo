import type { VariableConfig } from '@core/styles';
import { isColorValue } from '@core/colors';
import { applyTransforms, getValueAsHex } from './styles';

export async function findVariableFromAlias(alias: VariableAlias) {
  const localVariables = await figma.variables.getLocalVariablesAsync();

  return localVariables.find((variable) => variable.id === alias.id);
}

export async function findCollection(variable: Variable) {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();

  return collections.find((collection) => collection.id === variable.variableCollectionId);
}

export async function getValue(variable: Variable, mode?: string) {
  const collection = (await findCollection(variable)) as VariableCollection;
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
 *  variable - `getLocalVariablesAsync()` never lists those). */
export async function getResolvedValue(
  variable: Variable | undefined | null,
  mode?: string
): Promise<VariableValue | null> {
  if (!variable) {
    return null;
  }

  const value = await getValue(variable, mode);

  if (isAlias(value)) {
    return getResolvedValue(await findVariableFromAlias(value), mode);
  }

  return value;
}

export async function findColorForVariable(variable: Variable, mode?: string) {
  const value = await getResolvedValue(variable, mode);

  if (!isColorValue(value)) {
    return 'transparent';
  }

  return getValueAsHex(value);
}

/** The write-back primitive: derive the consuming variable's mode value from
 *  its referenced origin plus the transforms. Works only on variables - used
 *  by both the style event propagation (updatePaintStyle) and the
 *  save-transforms command, so no caller does its own math. */
export async function updateVariable(conf: VariableConfig) {
  const variable = await figma.variables.getVariableByIdAsync(conf.variableId);
  const reference = await figma.variables.getVariableByIdAsync(conf.referenceId);

  // transformed values are colors - only COLOR variables accept them
  if (!variable || !reference || variable.resolvedType !== 'COLOR' || !conf.transforms) {
    return;
  }

  const collection = await findCollection(variable);
  const referenceCollection = await findCollection(reference);

  if (!collection || !referenceCollection) {
    return;
  }

  // same collection: the mode ids align; otherwise read the origin's default
  const modeId =
    collection.id === referenceCollection.id ? conf.modeId : referenceCollection.defaultModeId;
  const originValue = await getResolvedValue(reference, modeId);

  // guard: aliases can resolve to non-color values (or disappear into
  // published-library variables) - writing a color to those is what Figma's
  // "newValue failed validation" error reported
  if (!isColorValue(originValue)) {
    return;
  }

  variable.setValueForMode(conf.modeId, applyTransforms(originValue, conf.transforms));
}
