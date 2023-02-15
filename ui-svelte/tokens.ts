import { get, Writable, writable } from 'svelte/store';
import { messenger } from './ui';

export interface Token {
  id: string;
  origin: 'LOCAL' | 'REMOTE';
  style: PaintStyle | TextStyle | GridStyle | EffectStyle | null;
}

export const colors = writable<Token[]>([]);
export const effects = writable<Token[]>([]);
export const texts = writable<Token[]>([]);

function findStore(token: Token): Writable<Token[]> | undefined {
  if (!token.style) {
    return;
  }

  if (token.style.type === 'PAINT') {
    return colors;
  }

  if (token.style.type === 'EFFECT') {
    return effects;
  }

  if (token.style.type === 'TEXT') {
    return texts;
  }
}

export function getColorAsCSS(token: Token) {
  if (token.style.type === 'PAINT') {
    if (token.style.paints[0].type === 'SOLID') {
      const color = token.style.paints[0].color;
      const opacity = token.style.paints[0].opacity ? `, ${token.style.paints[0].opacity}` : '';
      return `rgb(${color.r * 255}, ${color.g * 255}, ${color.b * 255}${opacity})`;
    }
  }
}

get(messenger).addListener('token-initiated', (tokens: { colors: Token[], effects: Token[], texts: Token[]}) => {
  colors.set(tokens.colors);
  effects.set(tokens.effects);
  texts.set(tokens.texts);
});

get(messenger).addListener('token-created', (token: Token) => {
  const store = findStore(token);

  if (store) {
    console.log('set store', [...get(store), token]);
    
    store.set([...get(store), token]);
  }
});


