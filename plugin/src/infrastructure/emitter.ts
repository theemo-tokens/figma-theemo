type Listener = (data: unknown) => void;

export default class Emitter {

  observers: Map<string, Set<Listener>> = new Map();

  sendEvent(name: string, data: unknown) {
    figma.ui.postMessage({ event: name, data });

    if (this.observers.has(name)) {
      [...this.observers.get(name)?.values() ?? []].forEach((listener) => listener(data));
    }
  }

  on(name: string, listener: Listener) {
    if (!this.observers.has(name)) {
      this.observers.set(name, new Set());
    }

    this.observers.get(name)?.add(listener);
  }
}