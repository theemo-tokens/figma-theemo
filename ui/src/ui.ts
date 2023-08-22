import { writable } from 'svelte/store';

export const section = writable('styles');

export function hackSelectOffset(target: HTMLElement, offset: number) {
  const menu = target.querySelector('ul.menu');
  let observer: MutationObserver;

  if (menu) {
    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const elem = (mutation.target as HTMLElement);

          const marginTop = Math.abs(Number.parseInt(elem.style.top, 10));
          const offsetTop = (elem.parentNode as HTMLElement).offsetTop;
          const gap = offsetTop - marginTop;

          if (elem.classList.contains('hidden')) {
            elem.style.translate = '';
          } else if (gap < offset) {
            elem.style.translate = `0 ${offset - gap}px`;

            if (elem.clientHeight + offset > document.documentElement.clientHeight) {
              elem.style.height = `${document.documentElement.clientHeight - offset - 8}px`;
            }
          }
        }
      }
    });

    observer.observe(menu, { attributes: true});
  }

  return {
    destroy() {
      if (observer) {
        observer.disconnect();
      }
    }
  }
}