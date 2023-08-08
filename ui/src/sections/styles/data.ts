import { get, writable, derived } from 'svelte/store';
import { messenger } from '../../infrastructure';
import { EventName, type Events } from '@theemo-figma/core/styles/events';
import { type Config, type StyleDescriptor } from '@theemo-figma/core/styles';

const styles = writable<StyleDescriptor[]>([]);

export const colors = derived(styles, $styles => $styles.filter(desc => desc.style.type === 'PAINT'));
export const texts = derived(styles, $styles => $styles.filter(desc => desc.style.type === 'TEXT'));
export const effects = derived(styles, $styles => $styles.filter(desc => desc.style.type === 'EFFECT'));

const config = writable<Config>({ styles: [], variables: []});

export const references = derived(config, $config => $config.styles);
export const variables = derived(config, $config => $config.variables);

function findIndex(id: string) {
  return get(styles).findIndex(token => token.id === id);
}

messenger.addListener(EventName.StylesInitiated, (initialStyles: StyleDescriptor[]) => {
  styles.set(initialStyles);
});

messenger.addListener(EventName.StyleCreated, (style: StyleDescriptor) => {
  styles.set([...get(styles), style]);
});

messenger.addListener(EventName.StyleUpdated, (style: StyleDescriptor) => {
  const index = findIndex(style.id);
  
  if (index !== -1) {
    const updated = get(styles);
    updated[index] = style;
    styles.set(updated);
  }
});

messenger.addListener(EventName.StyleDeleted, (id: string) => {
  const index = findIndex(id);

  if (index !== -1) {
    const updated = get(styles);
    updated.splice(index, 1);
    styles.set(updated);
  }
});

messenger.addListener(EventName.ConfigArrived, (data: Events[EventName.ConfigArrived]) => {
  config.set(data);
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
