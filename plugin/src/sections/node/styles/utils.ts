import { COLLECTION } from './types';
// @ts-ignore
import cc from 'color-converter';

export function createOrFindStyle(name: string, type: COLLECTION): BaseStyle {
  switch (type) {
    case 'paint':
      let paint = figma.getLocalPaintStyles().find(style => style.name === name);
      if (!paint) {
        paint = figma.createPaintStyle();
        paint.name = name;
      }
      return paint;

    case 'effect':
      let effect = figma.getLocalEffectStyles().find(style => style.name === name);
      if (!effect) {
        effect = figma.createEffectStyle();
        effect.name = name;
      }
      return effect;
    
    case 'text':
      let text = figma.getLocalTextStyles().find(style => style.name === name);
      if (!text) {
        text = figma.createTextStyle();
        text.name = name;
      }
      return text;
  }
}

export function copyPaintStyle(from: PaintStyle, to: PaintStyle) {
  to.paints = from.paints;
}

export interface PaintTransforms {
  hue?: number;
  saturation?: number;
  lightness?: number;
  opacity?: number;
}

export function applyPaintTransforms(paint: SolidPaint, transforms: PaintTransforms) {
  const out = { ...paint };
  const c = cc.fromRGBA(out.color.r * 255, out.color.g * 255, out.color.b * 255, out.opacity);
  
  if (transforms.hue) {
    c.rotate(transforms.hue);
  }

  if (transforms.saturation) {
    c.saturate(transforms.saturation);
  }

  if (transforms.lightness) {
    c.lighten(transforms.lightness);
  }

  if (transforms.opacity) {
    c.fade(transforms.opacity);
  }

  out.color = {
    r: c.red / 255,
    g: c.green / 255,
    b: c.blue / 255
  };
  out.opacity = c.alpha;

  return out;
}

export function copyEffectStyle(from: EffectStyle, to: EffectStyle) {
  if (Array.isArray(from.effects)) {
    to.effects = from.effects;
  } else if (typeof from.effects === 'object') {
    to.effects = Object.values(from.effects);
  }
}

export function copyGridStyle(from: GridStyle, to: GridStyle) {
  to.layoutGrids = from.layoutGrids;
}

export function copyTextStyle(from: TextStyle, to: TextStyle) {
  try {
    to.fontSize = from.fontSize;
    to.letterSpacing = from.letterSpacing;
    to.lineHeight = from.lineHeight;
    to.paragraphIndent = from.paragraphIndent;
    to.paragraphSpacing = from.paragraphSpacing;
    to.textCase = from.textCase;
    to.textDecoration = from.textDecoration;
    to.fontName = from.fontName;
  } catch (e) {
    figma.loadFontAsync(from.fontName).then(() => {
      to.fontName = from.fontName;
    });
  }
}
