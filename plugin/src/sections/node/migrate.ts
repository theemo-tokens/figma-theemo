import { Infrastructure } from '../../infrastructure';
import { STYLES, StyleTypes } from './styles/types';
export const NON_PAINT_STYLES = [StyleTypes.Text, StyleTypes.Effect];
import Container from './container';
import { NAMESPACE } from '../../config';

export function migratePluginData() {
  // migrate from plugin data to shared plugin data
  const nodes = figma.root.getPluginData('nodes');
  if (nodes !== '') {
    for (const nodeId of JSON.parse(nodes)) {
      const node = figma.getNodeById(nodeId);
      if (node) {
        for (const style of STYLES) {
          node.setSharedPluginData(NAMESPACE, style, node.getPluginData(style));
          node.setPluginData(style, '');
        }
      }
    }

    figma.root.setSharedPluginData(NAMESPACE, 'nodes', nodes);
    figma.root.setPluginData('nodes', '');
  }
}

export function migrateNonPaintReferences(infrastructure: Infrastructure) {
  const container = new Container(infrastructure);
  const references = new Map(JSON.parse(figma.root.getPluginData('references') || '{}'));

  container.references.eachWithHandler((handler) => {
    for (const style of NON_PAINT_STYLES) {
      const data = handler.styles[style];
      if (data && data.from && data.to) {
        references.set(data.to.id, { value: data.from.id });
      }
    }
    handler.delete();
    container.registry.removeById(handler.node.id);
  });

  figma.root.setPluginData('references', JSON.stringify(Object.fromEntries(references)));
}

