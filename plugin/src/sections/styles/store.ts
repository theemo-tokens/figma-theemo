import { Transforms } from '@theemo-figma/core/transforms';

export interface StyleConfig {
  id: string;
  reference?: string; // style id
  transforms?: Transforms;
}

const CONFIG = '.theemo/config';

function findStyle(name: string): GridStyle | undefined {
  return figma.getLocalGridStyles().find(style => style.name === CONFIG);
}

function findOrCreateStyle(name: string) {
  let style = findStyle(name);
  if (!style) {
    style = figma.createGridStyle();
    style.name = name;
  }
  return style;
}

export function readConfig(): StyleConfig[] {
  const refStore = findStyle(CONFIG);
  if (refStore) {
    return JSON.parse(refStore.description ?? {});
  }

  return [];
}

export function storeConfig(config: StyleConfig[]) {
  let refStore = findOrCreateStyle(CONFIG);
  refStore.description = JSON.stringify(config);
}