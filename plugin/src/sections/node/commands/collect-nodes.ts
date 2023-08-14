import NodeCommand from './command';
import { StyleTypes } from '../styles/types';
import { NodesPayload } from '@theemo-figma/core/node/events';

export default class CollectNodesCommand extends NodeCommand {
  NAME = 'collect-nodes';

  execute() {
    const nodes: NodesPayload  = [];

    this.container.references.each((node) => {
      const handler = this.container.registry.get(node);
      const types: StyleTypes[] = [];

      handler.each((adapter) => {
        if (adapter.hasReference()) {
          types.push(adapter.type);
        }
      });

      if (types.length > 0) {
        nodes.push({
          id: node.id,
          name: node.name,
          styles: types
        })
      }
    });

    this.emitter.sendEvent('nodes-collected', nodes);
  }
}