import { RefNode } from '../types';
import NodeCommand from './command';

export default class UnlinkReferenceCommand extends NodeCommand {
  NAME = 'unlink-reference';

  execute(data) {
    if (data.node.id) {
      const node = figma.getNodeById(data.node.id);

      if (!node) {
        return;
      }

      const handler = this.container.registry.get(node as RefNode);
      handler.unlinkReference(data);

      this.emitter.sendEvent('reference-unlinked', { style: data.style, data: handler.data.styles[data.style] });
    }
  }
}