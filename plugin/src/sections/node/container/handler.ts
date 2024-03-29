import Container from '../container';
import StyleAdapter from '../styles/adapter';
import StyleFactory from '../styles/factory';
import { COLLECTION, STYLES, StyleTypes } from '../styles/types';
import { PaintTransforms } from '../styles/utils';
import { RefNode } from '../types';

interface Reference {
  from?: { id: string; name: string; };
  to?: { id: string; name: string; };
  local: { id: string; name: string; };
}

interface ColorReference extends Reference {
  transforms: PaintTransforms;
}

interface StylesData {
  [StyleTypes.Fill]?: ColorReference;
  [StyleTypes.Stroke]?: ColorReference;
  [StyleTypes.Effect]?: Reference;
  [StyleTypes.Text]?: Reference;
}

interface CollectionData {
  [StyleTypes.Fill]?: COLLECTION;
  [StyleTypes.Stroke]?: COLLECTION;
  [StyleTypes.Effect]?: COLLECTION;
  [StyleTypes.Text]?: COLLECTION;
}

export default class NodeHandler {
  
  private adapters: Map<StyleTypes, StyleAdapter> = new Map();

  node: RefNode;
  
  constructor(node: RefNode, private container: Container) {
    const styles = new Set(STYLES);
    if (node.type !== 'TEXT') {
      styles.delete(StyleTypes.Text);
    }

    for (const style of styles) {
      // if there is a nice check whether the this.node[`${style}StyleId`]
      // property exists, then there can be a dynamical exploration of which
      // styles are available to the given node (ie. for adding typo and grid
      // styles)
      const adapter = StyleFactory.create(style, node, container);

      adapter.read();
      adapter.load();

      this.adapters.set(style, adapter);

      if (adapter.needsUnlink()) {
        this.unlinkReference({ style });
      }
    }

    this.node = node;
  }

  /**
   * ATTENTION!!!
   * 
   * This is a super costly call. Do NOT! run this in a thread or similar, this
   * will stop Figma from working! Be wise with its usage
   */
  get repo() {
    return {
      paint: figma.getLocalPaintStyles().map(style => { return { id: style.id, name: style.name } }),
      effect: figma.getLocalEffectStyles().map(style => { return { id: style.id, name: style.name } }),
      text: figma.getLocalTextStyles().map(style => { return { id: style.id, name: style.name } })
    };
  }

  get data() {
    const data = {
      node: {
        id: this.node.id
      },
      styles: this.styles,
      collection: this.collection,
      repo: this.repo
    };

    return data;
  }

  get styles() {
    const data: StylesData = {};
    for (const [style, adapter] of this.adapters.entries()) {
      data[style] = adapter.compile();
    }
    return data;
  }

  get collection() {
    const data: CollectionData = {};
    for (const [style, adapter] of this.adapters.entries()) {
      data[style] = adapter.collection;
    }
    return data;
  }

  managesStyles() {
    return Object.values(this.styles).filter(Boolean).length > 0;
  }

  hasReference(style: string | StyleTypes) {
    const adapter = this.adapters.get(style as StyleTypes);
    if (adapter) {
      return adapter.hasReference();
    }

    return false;
  }

  each(callback: (adapter: StyleAdapter) => void) {
    for (const adapter of this.adapters.values()) {
      callback(adapter);
    }
  }

  //
  // internal housekeeping
  //

  delete() {
    for (const adapter of this.adapters.values()) {
      adapter.delete();
    }

    this.deleteNode();
  }

  //
  // Commands
  //

  linkOrigin({ style, name }: { style: StyleTypes, name: string }) {
    const adapter = this.adapters.get(style);
    if (adapter) {
      adapter.linkOrigin(name);
      adapter.read();
    }
  }

  migrateOrigin({ style, target }: { style: StyleTypes, target: string }) {
    const adapter = this.adapters.get(style);
    if (adapter) {
      adapter.migrateOrigin(target);
      adapter.save();
      adapter.read();
    }
  }

  unlinkOrigin({ style }: { style: StyleTypes }) {
    const adapter = this.adapters.get(style);
    if (adapter && !adapter.hasReference()) {
      adapter.unlinkOrigin();
      adapter.read();
    }
  }

  createReference({ from, name, style }: { from: string, name: string, style: StyleTypes }) {
    const adapter = this.adapters.get(style);
    if (adapter) {
      adapter.createReference(from, name);
      adapter.applyForContext(this.container.contexts.context);
      adapter.save();
      adapter.read();
    }

    // store node in document
    this.storeNode();
  }

  unlinkReference({ style }: { style: StyleTypes }) {
    const adapter = this.adapters.get(style);
    if (adapter) {
      adapter.unlinkReference();
      adapter.save();
      adapter.read();
    }

    const hasReferences = Array.from(this.adapters.values()).some(adapter => adapter.hasReference());
    if (!hasReferences) {
      this.deleteNode();
    }
  }

  saveTransforms({ style, transforms }: { style: StyleTypes, transforms: object }) {
    const adapter = this.adapters.get(style);
    if (adapter) {
      adapter.saveTransforms(transforms);
      adapter.save();
      adapter.read();
    }
  }

  private storeNode() {
    this.container.references.addNode(this.node);
  }

  private deleteNode() {
    this.container.references.deleteNode(this.node);
  }

  applyForContext(context: string) {
    for (const adapter of this.adapters.values()) {
      if (adapter.isContextual(context)) {
        adapter.applyForContext(context);
      }
    }
  }

  updateStyles() {
    for (const adapter of this.adapters.values()) {
      adapter.updateStyle();
      adapter.applyForContext(this.container.contexts.context);
    }
  }
}