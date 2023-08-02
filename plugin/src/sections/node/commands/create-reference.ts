import { RefNode } from '../types';
import NodeCommand from './command';

export default class CreateReferenceCommand extends NodeCommand {
  NAME = 'create-reference';

  execute(data) {
    if (data.node.id) {
      const node = figma.getNodeById(data.node.id);

      if (!node) {
        return;
      }

      const handler = this.container.registry.get(node as RefNode);
      handler.createReference(data);

      this.emitter.sendEvent('reference-created', { style: data.style, data: handler.data.styles[data.style] });
    }
  }
}