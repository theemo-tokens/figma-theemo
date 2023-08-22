import { STYLES } from '../styles/types';
import NodeCommand from './command';
import { CollectedReferencesPayload, CollectedReferencesNode } from '@theemo-figma/core/node/events';

export default class CollectReferencesCommand extends NodeCommand {
  NAME = 'collect-references';

  execute() {
    const nodes: CollectedReferencesNode[] = [];

    this.container.references.each((node) => {
      const handler = this.container.registry.get(node);
      nodes.push({
        node: {
          id: node.id
        }, ...this.filter(handler.data.styles)
      });
    });

    const data: CollectedReferencesPayload = {
      document: {
        id: figma.root.id,
        name: figma.root.name
      },
      nodes
    };

    this.emitter.sendEvent('references-collected', data);
  }

  filter(styles) {
    const filtered = {};

    for (const style of STYLES) {
      if (styles[style]) {
        if (styles[style].from && styles[style].to) {
          filtered[style] = styles[style];
          delete filtered[style].local;
        }
      }
    }

    return filtered;
  }
}