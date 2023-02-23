import type { Theme } from '@theemo/core';
import { get, writable } from 'svelte/store';
import { messenger } from './ui';

export const theme = writable<Theme>();

get(messenger).addListener('themes.theme-loaded', (loadedTheme: Theme) => {
  theme.set(loadedTheme);
});

