import { readable } from 'svelte/store';
import { messenger } from '../../infrastructure';

export const styles = readable(undefined, function start(set) {
  messenger.addListener('selection-changed', (data) => {
    if (data) {
      let styles = {};

      for (const style of Object.keys(data.styles)) {
        styles[style] = {
          node: data.node,
          section: style,
          collection: data.collection[style],
          data: data.styles[style],
          suggestions: data.repo[data.collection[style]]
        };
      }

      set(styles);
    } else {
      set(undefined);
    }
  });
});
