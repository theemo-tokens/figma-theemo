declare module 'makeup-listbox' {
  export default class Listbox {
    constructor(root: HTMLElement, options?: Record<string, unknown>);
    select(index: number): void;
    destroy(): void;
  }
}
