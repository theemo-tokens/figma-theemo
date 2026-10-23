import type { PaintTransforms } from '@core/transforms';
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

type BoundVariables = Record<'color', VariableAlias>;

export function findVariableAlias(style: PaintStyle) {
  if (hasBoundVariable(style)) {
    return ((style.paints[0] as SolidPaint).boundVariables as BoundVariables)['color'];
  }
}

function valueToColord(value: RGB | RGBA): Colord {
  const alpha = (value as RGBA).a ? `, ${(value as RGBA).a}` : '';
  return colord(`rgb(${value.r * 255}, ${value.g * 255}, ${value.b * 255}${alpha})`);
}

export function getValueAsHex(value: RGB | RGBA) {
  const color = valueToColord(value);

  return color.toHex().toUpperCase();
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** Only apply finite, real transform amounts - garbage in the config
 *  (strings, null, Infinity, NaN via 1e999 JSON literals) would otherwise
 *  propagate NaN through the colord chain into setValueForMode. */
const numeric = (amount: number | undefined): number =>
  typeof amount === 'number' && Number.isFinite(amount) ? amount : 0;

/** Applies a PaintTransforms set in theemo's units:
 *  - hue: degrees, shifted directly (theemo's CSS output: `calc(h + hue)`)
 *  - saturation, lightness, opacity: percentage points (-100..100), which
 *    is why they divide by 100 for colord's 0..1 HSL channels. */
export function applyTransforms(value: RGBA, transforms: PaintTransforms): RGBA {
  let color = valueToColord(value);

  const opacity = numeric(transforms.opacity);
  const hue = numeric(transforms.hue);
  const saturation = numeric(transforms.saturation);
  const lightness = numeric(transforms.lightness);

  if (opacity) {
    color = color.alpha(color.alpha() + opacity / 100);
  }

  if (hue) {
    color = color.rotate(hue);
  }

  if (saturation) {
    color = color.saturate(saturation / 100);
  }

  if (lightness) {
    color = color.lighten(lightness / 100);
  }

  const rgba = color.rgba;

  // Figma validates variable values against 0..1 per channel; never write
  // anything else (out-of-gamut P3 channels are clamped here, NaN is 0)
  return {
    r: clamp01(rgba.r / 255) || 0,
    g: clamp01(rgba.g / 255) || 0,
    b: clamp01(rgba.b / 255) || 0,
    a: clamp01(rgba.a) || 0
  };
}

export function copyEffectStyle(from: EffectStyle, to: EffectStyle) {
  if (Array.isArray(from.effects)) {
    to.effects = from.effects;
  } else if (typeof from.effects === 'object') {
    to.effects = Object.values(from.effects);
  }
}

/**
 * Figma rejects every write on a text style whose fonts aren't loaded into
 * the plugin ("Cannot write to node with unloaded font") - not just the
 * `fontName` itself, but also `fontSize`, `lineHeight`, etc. So both the
 * style's current font and the incoming one must be loaded before copying,
 * otherwise the referenced style keeps its old values. Loading is cached and
 * an unavailable font rejects; that must not abort the copy of the styles
 * that do work, so settle instead of all.
 */
export async function copyTextStyle(from: TextStyle, to: TextStyle) {
  await Promise.allSettled([figma.loadFontAsync(from.fontName), figma.loadFontAsync(to.fontName)]);

  try {
    // fontName first: every following write validates against the style's
    // (now loaded) font
    to.fontName = from.fontName;
    to.fontSize = from.fontSize;
    to.letterSpacing = from.letterSpacing;
    to.lineHeight = from.lineHeight;
    to.paragraphIndent = from.paragraphIndent;
    to.paragraphSpacing = from.paragraphSpacing;
    to.textCase = from.textCase;
    to.textDecoration = from.textDecoration;
    to.leadingTrim = from.leadingTrim;
    to.textWrapStyle = from.textWrapStyle;
    to.listSpacing = from.listSpacing;
    to.hangingPunctuation = from.hangingPunctuation;
    to.hangingList = from.hangingList;
  } catch {
    // best effort: a style carrying a font we couldn't load stays untouched
    console.log('could not copy text style', to.name);
  }
}
