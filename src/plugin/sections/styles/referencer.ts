import { EventName, type Events } from '@core/styles/events';
import Emitter from '../../infrastructure/emitter';
import { readConfig } from './store';
import { Config, StyleDescriptor } from '@core/styles';
import { copyEffectStyle, copyTextStyle, findVariableAlias, hasBoundVariable } from '../../styles';
import { findVariableFromAlias, updateVariable } from '../../variables';

export function listen(emitter: Emitter) {
  // @ts-ignore
  emitter.on(EventName.StyleUpdated, updateStyle);
  // @ts-ignore
  emitter.on(EventName.StyleDeleted, deleteStyle);
}

type CopyStyle<S extends BaseStyle = BaseStyle> = (from: S, to: S) => void | Promise<void>;

function updateStyle(data: Events[EventName.StyleUpdated]) {
  // effect + text styles
  if (data.style.type === 'EFFECT' || data.style.type === 'TEXT') {
    updateTextAndEffectStyle(data).catch((e) => console.log('style update failed', e));
  }

  // paint styles
  if (data.style.type === 'PAINT') {
    updatePaintStyle(data).catch((e) => console.log('style update failed', e));
  }
}

async function updateTextAndEffectStyle(data: StyleDescriptor) {
  const config = await readConfig();
  const references = findReferencesConfig(data, config);
  // @ts-ignore
  const copy: CopyStyle<TextStyle | EffectStyle> =
    data.style.type === 'EFFECT' ? copyEffectStyle : copyTextStyle;
  const locals: BaseStyle[] =
    data.style.type === 'EFFECT'
      ? await figma.getLocalEffectStylesAsync()
      : await figma.getLocalTextStylesAsync();

  await Promise.all(
    references
      // find styles to update - skip references pointing at deleted styles
      .map((ref) => locals.find((style) => style.id === ref.styleId))
      .filter((style): style is TextStyle | EffectStyle => style !== undefined)
      // update them (the text copy loads fonts asynchronously)
      .map((to) => copy(data.style as EffectStyle | TextStyle, to))
  );
}

async function updatePaintStyle(data: StyleDescriptor) {
  const style = data.style as PaintStyle;

  if (hasBoundVariable(style)) {
    const alias = findVariableAlias(style);
    const variable = alias && (await findVariableFromAlias(alias));
    const config = await readConfig();

    if (variable) {
      // every consuming variable that references the changed origin gets
      // its transformed value re-derived
      for (const conf of config.variables.filter((c) => c.referenceId === variable.id)) {
        await updateVariable(conf);
      }
    }
  }
}

function deleteStyle(data: Events[EventName.StyleDeleted]) {
  console.log('style deleted', data);
}

function findReferencesConfig(desc: StyleDescriptor, config: Config) {
  return config.styles.filter((style) => style.referenceId === desc.id);
}
