import { NAMESPACE } from '../../../config';
import { RefNode } from '../types';
import NodeHandler from './handler';
import Container from './index';

export default class ReferencesManager {

  constructor(private container: Container) {}

  readNodes(): Set<string> {
    return new Set<string>(Array.from(JSON.parse(figma.root.getSharedPluginData(NAMESPACE, 'nodes') || '[]')));
  }

  storeNodes(nodes: Set<string>) {
    figma.root.setSharedPluginData(NAMESPACE, 'nodes', JSON.stringify(Array.from(nodes.values())));
  }

  each(callback: (node: RefNode) => void) {
    const nodes = this.readNodes();
    for (const id of nodes.values()) {
      const node = figma.getNodeById(id) as RefNode;
      if (node) {
        callback(node);
      } else {
        nodes.delete(id);
        this.container.registry.removeById(id);
      }
    }
    this.storeNodes(nodes);
  }

  eachWithHandler(callback: (handler: NodeHandler) => void) {
    this.each((node) => {
      callback(this.container.registry.get(node));
    });
  }

  addNode(node: BaseNode) {
    const nodes = this.readNodes();
    nodes.add(node.id);
    this.storeNodes(nodes);
  }

  deleteNode(node: BaseNode) {
    const nodes = this.readNodes();
    nodes.delete(node.id);
    this.storeNodes(nodes);
  }

  findPaintStyleReferences(): PaintStyle[] {
    const styles: PaintStyle[] = [];
    const nodes = this.readNodes();

    for (const nodeId of nodes) {
      const node = figma.getNodeById(nodeId) as RefNode;
      const styleIds = [node.fillStyleId ?? undefined, node.strokeStyleId ?? undefined, (node as TextNode).textStyleId ?? undefined]
        .filter(styleId => styleId !== undefined);
      
      styles.push(...styleIds.map(styleId => figma.getStyleById(styleId as string) as PaintStyle));
    }

    return styles;
  }
}