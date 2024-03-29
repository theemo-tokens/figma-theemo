import { RefNode } from '../types';
import NodeCommand from './command';

export default class SaveTransformsCommand extends NodeCommand {
  NAME = 'save-transforms';

  execute(data) {
    if (data.node.id) {
      const node = figma.getNodeById(data.node.id);

      if (!node) {
        return;
      }

      const handler = this.container.registry.get(node as RefNode);
      handler.saveTransforms(data);

      this.emitter.sendEvent('transforms-saved', { style: data.style, data: handler.data.styles[data.style] });
    }
  }
}