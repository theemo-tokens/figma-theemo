import { EventName, type Events } from '@theemo-figma/core/styles/events';
import Emitter from '../../infrastructure/emitter';
import { readConfig } from './store';
import { Config, StyleDescriptor } from '@theemo-figma/core/styles';
import { RGBAtoPaint, applyTransforms, copyEffectStyle, copyTextStyle, findVariableAlias, hasBoundVariable } from '../../styles';
import { findCollection, findColorForVariable, findVariableFromAlias, getResolvedValue, isAlias } from '../../variables';

export function listen(emitter: Emitter) {
  // @ts-ignore
  emitter.on(EventName.StyleUpdated, updateStyle);
  // @ts-ignore
  emitter.on(EventName.StyleDeleted, deleteStyle);
}

type CopyStyle<S extends BaseStyle = BaseStyle> = (from: S, to: S) => void;

function updateStyle(data: Events[EventName.StyleUpdated]) {
  // effect + text styles
  if (data.style.type === 'EFFECT' || data.style.type === 'TEXT') {
    updateTextAndEffectStyle(data);
  }

  // paint styles
  if (data.style.type === 'PAINT') {
    updatePaintStyle(data);
  }
}

function updateTextAndEffectStyle(data: StyleDescriptor) {
  const config = readConfig();
  const references = findReferencesConfig(data, config);
  // @ts-ignore
  const copy: CopyStyle<TextStyle | EffectStyle> = data.style.type === 'EFFECT' ? copyEffectStyle : copyTextStyle;
  const locals: BaseStyle[] = data.style.type === 'EFFECT' ? figma.getLocalEffectStyles() : figma.getLocalTextStyles();
  if (references.length > 0) {
    references
      // find styles to update
      .map((ref) => locals.find(style => style.id === ref.styleId))
      // update them
      .forEach(to => copy(data.style as EffectStyle | TextStyle, to  as EffectStyle | TextStyle));
  }
}

export function updatePaintStyle(data: StyleDescriptor) {
  const config = readConfig();
  const style = data.style as PaintStyle;

  if (hasBoundVariable(style)) {
    const alias = findVariableAlias(style);
    const variable = alias && findVariableFromAlias(alias);
    const collection = variable && findCollection(variable);

    if (variable && collection) {
      // find references to that variable
      const references = findReferencesTo(variable);

      // and check if the reference uses a transform, then apply them
      for (const reference of references) {
        const refCollection = findCollection(reference) as VariableCollection;
        for (const mode of refCollection.modes) {
          // we found config for a reference
          const conf = findVariableConfig(reference, mode.modeId, config);

          if (conf) {
            const modeId = collection.id === refCollection.id ? mode.modeId : collection.defaultModeId;

            // find the original value
            const originValue = getResolvedValue(variable, modeId) as RGBA;

            // transform it
            const transformedValue = applyTransforms(originValue, conf.transforms);

            // apply it back
            reference.setValueForMode(mode.modeId, transformedValue);
          }
        }
      }
    }
  }
}

function findReferencesTo(variable: Variable): Variable[] {
  const config = readConfig();
  const variables = figma.variables.getLocalVariables();

  return config.variables
    .filter(varConf => varConf.referenceId === variable.id)
    .map(varConf => variables.find(variable => variable.id === varConf.variableId) as Variable)
    .filter(Boolean);
}

function deleteStyle(data: Events[EventName.StyleDeleted]) {
  console.log('style deleted', data);
}

function findReferencesConfig(desc: StyleDescriptor, config: Config) {
  return config.styles.filter(style => style.referenceId === desc.id);
}

function findVariableConfig(variable: Variable, mode: string, config: Config) {
  return config.variables.find((conf) => conf.variableId === variable.id && conf.modeId === mode && conf.transforms !== undefined); 
}
