import { get, writable, derived } from 'svelte/store';
import { messenger } from '../../infrastructure';
import { Events } from '@theemo-figma/core/styles/events';
import type { StyleDescriptor } from '@theemo-figma/core/styles';

const styles = writable<StyleDescriptor[]>([]);

export const colors = derived(styles, $styles => $styles.filter(desc => desc.style.type === 'PAINT'));
export const texts = derived(styles, $styles => $styles.filter(desc => desc.style.type === 'TEXT'));
export const effects = derived(styles, $styles => $styles.filter(desc => desc.style.type === 'EFFECT'));

function findIndex(id: string) {
  return get(styles).findIndex(token => token.id === id);
}

messenger.addListener(Events.Initiated, (initialStyles: StyleDescriptor[]) => {
  styles.set(initialStyles);
});

messenger.addListener(Events.Created, (style: StyleDescriptor) => {
  styles.set([...get(styles), style]);
});

messenger.addListener(Events.Updated, (style: StyleDescriptor) => {
  const index = findIndex(style.id);
  
  if (index !== -1) {
    const updated = get(styles);
    updated[index] = style;
    styles.set(updated);
  }
});

messenger.addListener(Events.Deleted, (id: string) => {
  const index = findIndex(id);

  if (index !== -1) {
    const updated = get(styles);
    updated.splice(index, 1);
    styles.set(updated);
  }
});

export function getColorAsCSS(style: PaintStyle) {
  if (style.type === 'PAINT' && style.paints[0].type === 'SOLID') {
    const color = style.paints[0].color;
    const opacity = style.paints[0].opacity
      ? `, ${style.paints[0].opacity}`
      : '';
    return `rgb(${color.r * 255}, ${color.g * 255}, ${
      color.b * 255
    }${opacity})`;
  }
}

export function getModeValueAsCss(value: RGB | RGBA) {
  const alpha = (value as RGBA).a ? `, ${(value as RGBA).a}` : '';
  return `rgb(${value.r * 255}, ${value.g * 255}, ${value.b * 255}${alpha})`;
}
