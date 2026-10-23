import type { Config } from '@core/styles/index';

const CONFIG = '.theemo/config';

async function findStyle(): Promise<GridStyle | undefined> {
  const styles = await figma.getLocalGridStylesAsync();

  return styles.find((style) => style.name === CONFIG);
}

async function findOrCreateStyle() {
  let style = await findStyle();

  if (!style) {
    style = figma.createGridStyle();
    style.name = CONFIG;
  }

  return style;
}

export async function readConfig(): Promise<Config> {
  const refStore = await findStyle();

  if (refStore) {
    return JSON.parse(refStore.description ?? {});
  }

  return {
    styles: [],
    variables: []
  };
}

export async function storeConfig(config: Config) {
  const refStore = await findOrCreateStyle();
  refStore.description = JSON.stringify(config);
}
