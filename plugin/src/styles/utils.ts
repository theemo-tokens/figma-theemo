import { COLLECTION } from './types';
import { colord } from 'colord';

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

interface PaintTransforms {
  hue?: number;
  saturation?: number;
  lightness?: number;
  opacity?: number;
}

export function applyPaintTransforms(paint: SolidPaint, transforms: PaintTransforms) {
  const out = { ...paint };
  // const rgba = `rgba(${out.color.r * 255} ${out.color.g * 255} ${out.color.b * 255}, out.opacity)`;
  // const c = cc.fromRGBA(out.color.r * 255, out.color.g * 255, out.color.b *
  // 255, out.opacity);
  // const c = new Color();
  const c = colord({r: out.color.r * 255, g: out.color.g * 255, b: out.color.b * 255, alpha: out.opacity});
  
  if (transforms.hue) {
    c.rotate(transforms.hue);
  }

  if (transforms.saturation) {
    c.saturate(transforms.saturation / 10);
  }

  if (transforms.lightness) {
    c.lighten(transforms.lightness / 10);
  }

  if (transforms.opacity) {
    c.alpha(transforms.opacity / 10);
  }

  out.color = {
    r: c.rgba.r / 255,
    g: c.rgba.g / 255,
    b: c.rgba.b / 255
  };
  out.opacity = c.rgba.a;

  return out;
}

export function copyEffectStyle(from: EffectStyle, to: EffectStyle) {
  to.effects = from.effects;
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
