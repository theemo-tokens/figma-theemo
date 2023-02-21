import { get, writable, derived } from 'svelte/store';
import { messenger } from './ui';
import type { Token } from '@theemo/figma-shared';

const tokens = writable<Token[]>([]);

export const colors = derived(tokens, $tokens => $tokens.filter(token => token.style.type === 'PAINT'));
export const texts = derived(tokens, $tokens => $tokens.filter(token => token.style.type === 'TEXT'));
export const effects = derived(tokens, $tokens => $tokens.filter(token => token.style.type === 'EFFECT'));
export const numerics = derived(tokens, $tokens => $tokens.filter(token => token.type === 'numeric'));
export const strokes = derived(tokens, $tokens => $tokens.filter(token => token.type === 'stroke'));

export function getColorAsCSS(token: Token) {
  if (token.style.type === 'PAINT') {
    if (token.style.paints[0].type === 'SOLID') {
      const color = token.style.paints[0].color;
      const opacity = token.style.paints[0].opacity ? `, ${token.style.paints[0].opacity}` : '';
      return `rgb(${color.r * 255}, ${color.g * 255}, ${color.b * 255}${opacity})`;
    }
  }
}

function findIndex(id: string) {
  return get(tokens).findIndex(token => token.id === id);
}

get(messenger).addListener('token-initiated', (initialTokens: Token[]) => {
  tokens.set(initialTokens);
});

get(messenger).addListener('token-created', (token: Token) => {
  tokens.set([...get(tokens), token]);
});

get(messenger).addListener('token-updated', (token: Token) => {
  const index = findIndex(token.id);
  
  if (index !== -1) {
    const updated = get(tokens);
    updated[index] = token;
    tokens.set(updated);
  }
});

get(messenger).addListener('token-deleted', (id: string) => {
  const index = findIndex(id);

  if (index !== -1) {
    const updated = get(tokens);
    updated.splice(index, 1);
    tokens.set(updated);
  }
});


