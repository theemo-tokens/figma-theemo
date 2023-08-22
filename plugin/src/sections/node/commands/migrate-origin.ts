import { RefNode } from '../types';
import NodeCommand from './command';

export default class MigrateOriginCommand extends NodeCommand {
  NAME = 'migrate-origin';

  execute(data) {
    if (data.node.id) {
      const node = figma.getNodeById(data.node.id);

      if (!node) {
        return;
      }

      const handler = this.container.registry.get(node as RefNode);
      handler.migrateOrigin(data);

      this.emitter.sendEvent('origin-migrated', { style: data.style, data: handler.data.styles[data.style] });
    }
  }
}