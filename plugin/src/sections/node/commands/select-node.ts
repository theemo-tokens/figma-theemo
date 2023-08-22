import NodeCommand from './command';
import { findPageForNode } from '../nodes';

export default class SelectNodeCommand extends NodeCommand {
  NAME = 'select-node';

  execute(nodeId: string) {
    const node = figma.getNodeById(nodeId) as SceneNode;
    
    if (node) {
      const page = findPageForNode(node);

      if (page) {
        if (figma.currentPage !== page) {
          figma.currentPage = page;
        }

        // @ts-ignore
        figma.currentPage.selection = [node];
      }
    }
  }
}