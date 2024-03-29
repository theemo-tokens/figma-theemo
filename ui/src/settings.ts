import { get, writable } from 'svelte/store';
import { messenger } from './infrastructure';
import { DEFAULT_CONFIG, type Settings } from '@theemo-figma/core/config';

export const settings = writable<Settings>(DEFAULT_CONFIG);
export const version = writable();

messenger.addListener(
  'settings-arrived',
  (data: Record<string, unknown>) => {
    settings.set({
      ...get(settings),
      ...data
    });
  }
);

messenger.addListener('version-changed', (data) => {
  version.set(data);
});