import { PaintTransforms } from '@theemo-figma/core/transforms';
import { Colord, colord } from 'colord';

export function hasBoundVariable(style: PaintStyle) {
  const paints: Paint[] = Array.isArray(style.paints) ? style.paints : Object.values(style.paints);

  return Boolean(
    paints.length > 0 &&
    paints[0].type === 'SOLID' &&
    (paints[0] as SolidPaint).boundVariables !== undefined &&
    ((paints[0] as SolidPaint).boundVariables as BoundVariables)['color']
  );
}

export function findBoundVariable(style: PaintStyle) {
  if (style.paints.length === 1 && style.paints[0].type === 'SOLID') {
    (style.paints[0] as SolidPaint).boundVariables?.color
  }
}

type BoundVariables = Record<'color', VariableAlias>;

export function findVariableAlias(style: PaintStyle) {
  if (hasBoundVariable(style)) {
    return ((style.paints[0] as SolidPaint).boundVariables as BoundVariables)['color'];
  }
}

export function copyPaintStyle(from: PaintStyle, to: PaintStyle) {
  to.paints = from.paints;
}

export function RGBAtoPaint(value: RGBA, paint: SolidPaint) {
  const out = { ...paint };
  out.color = {
    r: value.r / 255,
    g: value.g / 255,
    b: value.b / 255
  };
  out.opacity = value.a;

  return out;
}

function valueToColord(value: RGB | RGBA): Colord {
  const alpha = (value as RGBA).a ? `, ${(value as RGBA).a}` : '';
  return colord(`rgb(${value.r * 255}, ${value.g * 255}, ${value.b * 255}${alpha})`);
}

export function getValueAsHex(value: RGB | RGBA) {
  const color = valueToColord(value);

  return color.toHex().toUpperCase();
}

export function applyTransforms(value: RGBA, transforms: PaintTransforms): RGBA {
  let color = valueToColord(value);
  
  if (transforms.opacity) {
    color = color.alpha(color.alpha() + transforms.opacity / 100)
  }

  if (transforms.hue) {
    color = color.rotate(transforms.hue / 100);
  }

  if (transforms.saturation) {
    color = color.saturate(transforms.saturation / 100);
  }

  if (transforms.lightness) {
    color = color.lighten(transforms.lightness / 100);
  }

  return {
    r: color.rgba.r / 255,
    g: color.rgba.g / 255,
    b: color.rgba.b / 255,
    a: color.rgba.a
  };
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
