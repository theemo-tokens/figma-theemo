import { copyPaintStyle, createOrFindStyle, applyPaintTransforms } from './utils';
import StyleAdapter from './adapter';
import BaseStyleAdapter from './base';
import { StyleTypes } from './types';

export class StrokeStyleAdapter extends BaseStyleAdapter implements StyleAdapter {
  type: StyleTypes.Stroke = StyleTypes.Stroke;
  collection: 'paint' = 'paint';

  local?: PaintStyle;
  from?: PaintStyle;
  to?: PaintStyle;
  context?: PaintStyle;

  getPool() {
    return figma.getLocalPaintStyles();
  }

  // --- UI commands

  linkOrigin(name) {
    const style = figma.getLocalPaintStyles().find(style => style.name === name);
    if (style) {
      this.node.strokeStyleId = style.id;
      this.local = style;
    }
  }

  migrateOrigin(targetId: string) {
    this.from = figma.getStyleById(targetId) as PaintStyle;
    copyPaintStyle(this.from, this.to);
    this.applyTransforms();
    this.node.strokeStyleId = this.to.id;
  }

  unlinkOrigin() {
    this.node.strokeStyleId = '';
    this.local = undefined;
  }

  createReference(fromId: string, name: string) {
    const origin = figma.getStyleById(fromId) as PaintStyle;
    const to = createOrFindStyle(name, 'paint') as PaintStyle;
    copyPaintStyle(origin, to);
    this.applyTransforms();

    this.node.strokeStyleId = to.id;
    this.local = to;

    this.from = origin;
    this.to = to;
  }

  unlinkReference() {
    this.node.strokeStyleId = this.from.id;
    this.local = this.from;
    this.from = undefined;
    this.to = undefined;
  }

  saveTransforms(transforms) {
    this.transforms = transforms;
  }

  // --- commands

  updateStyle() {
    if (!this.hasReference()) {
      return;
    }

    copyPaintStyle(this.from, this.to);
    this.applyTransforms();
  }

  // --- helper

  private applyTransforms() {
    if (this.to && this.to.paints.length === 1 && this.transforms) {
      this.to.paints = [applyPaintTransforms(this.to.paints[0] as SolidPaint, this.transforms)];
    }
  }

  private createOrFindContextStyle() {
    if (!this.context && this.to) {
      this.context = createOrFindStyle(this.getContextFreeName(), this.collection) as PaintStyle;
    }

    return this.context;
  }

  protected updateContextStyle() {
    const contextFree = this.createOrFindContextStyle();
    if (contextFree) {
      contextFree.name = this.getContextFreeName();
      copyPaintStyle(this.to, contextFree);
    }
  }
}