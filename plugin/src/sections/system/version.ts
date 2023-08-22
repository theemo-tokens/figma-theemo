import { NAMESPACE } from '../../config';

export function figureTheemoVersion() {
  const nodes = Array.from(JSON.parse(figma.root.getSharedPluginData(NAMESPACE, 'nodes') || '[]'));

  if (nodes.length > 0) {
    return '1';
  }

  return '2';
}

export function figureAndSaveVersion() {
  let version: string = figma.root.getPluginData('version');

  version = figureTheemoVersion();

  figma.root.setPluginData('version', version);

  return version;
}