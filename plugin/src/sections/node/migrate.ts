import { Infrastructure } from '../../infrastructure';
import { STYLES, StyleTypes } from './styles/types';
export const NON_PAINT_STYLES = [StyleTypes.Text, StyleTypes.Effect];
import Container from './container';
import { NAMESPACE } from '../../config';
import { readConfig, storeConfig } from '../styles/store';

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
  const references = new Map<string, string>();
  const nodes = container.references.readNodes();

  container.references.eachWithHandler((handler) => {
    for (const style of NON_PAINT_STYLES) {
      const data = handler.styles[style];
      if (data && data.from && data.to) {
        references.set(data.to.id, data.from.id);
      }
    }

    if (!handler.managesStyles()) {
      handler.delete();
      container.registry.removeById(handler.node.id);

      // remove from nodes
      nodes.delete(handler.node.id);
    }
  });

  container.references.storeNodes(nodes);

  const config = readConfig();
  for (const [styleId, referenceId] of references.entries()) {
    config.styles.push({ styleId, referenceId });
  }
  storeConfig(config);
}

