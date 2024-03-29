import { RefNode } from '../types';
import NodeCommand from './command';

export default class UnlinkOriginCommand extends NodeCommand {
  NAME = 'unlink-origin';

  execute(data) {
    if (data.node.id) {
      const node = figma.getNodeById(data.node.id);

      if (!node) {
        return;
      }

      const handler = this.container.registry.get(node as RefNode);
      handler.unlinkOrigin(data);

      this.emitter.sendEvent('origin-unlinked', { style: data.style, data: handler.data.styles[data.style] });
    }
  }
}