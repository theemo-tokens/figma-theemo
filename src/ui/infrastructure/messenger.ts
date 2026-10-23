export default class Messenger {
  private listener: Map<string, Set<Function>> = new Map();

  constructor() {
    window.addEventListener('message', (event: MessageEvent) => {
      this.readMessage(event);
    });
  }

  addListener(event: string, listener: Function) {
    let listeners = this.listener.get(event);

    if (!listeners) {
      listeners = new Set();
      this.listener.set(event, listeners);
    }

    listeners.add(listener);
  }

  removeListener(event: string, listener: Function) {
    const listeners = this.listener.get(event);

    if (listeners) {
      listeners.delete(listener);
    }
  }

  private readMessage(event: MessageEvent) {
    const message = event.data.pluginMessage;

    if (message.event) {
      const listeners = this.listener.get(message.event);

      if (listeners) {
        for (const listener of listeners) {
          listener.call({}, message.data);
        }
      }
    }
  }

  send(command: string, data?: any) {
    parent.postMessage({ pluginMessage: { command, data } }, '*');
  }
}
