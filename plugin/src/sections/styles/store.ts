import type { Config } from '@theemo-figma/core/styles/index';

const CONFIG = '.theemo/config';

function findStyle(): GridStyle | undefined {
  return figma.getLocalGridStyles().find(style => style.name === CONFIG);
}

function findOrCreateStyle() {
  let style = findStyle();
  if (!style) {
    style = figma.createGridStyle();
    style.name = CONFIG;
  }
  return style;
}

export function readConfig(): Config {
  const refStore = findStyle();
  if (refStore) {
    return JSON.parse(refStore.description ?? {});
  }

  return {
    styles: [],
    variables: []
  };
}

export function storeConfig(config: Config) {
  let refStore = findOrCreateStyle();
  refStore.description = JSON.stringify(config);
}