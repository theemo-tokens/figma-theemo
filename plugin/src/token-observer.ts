import Container from './container/index';

interface Token extends BaseStyleChange {
  // more here
}

function serialize(object: Object) {
  const ret = {};

  for (const prop in object) {
    if (typeof object[prop] === 'object') {
      ret[prop] = serialize(object[prop]);
    } else {
      ret[prop] = object[prop];
    }
  }

  return ret;
}

export default class TokenObserver {

  private colors: Map<string, Token> = new Map();
  private effects: Map<string, Token> = new Map();
  private texts: Map<string, Token> = new Map();

  constructor(private container: Container) {
    figma.on('documentchange', this.listen.bind(this));

    this.init();
  }

  private init() {
    for (const paint of figma.getLocalPaintStyles()) {
      this.colors.set(paint.id, {
        id: paint.id,
        origin: 'LOCAL',
        style: paint
      });
    }

    for (const effect of figma.getLocalEffectStyles()) {
      this.colors.set(effect.id, {
        id: effect.id,
        origin: 'LOCAL',
        style: effect
      });
    }

    for (const text of figma.getLocalTextStyles()) {
      this.colors.set(text.id, {
        id: text.id,
        origin: 'LOCAL',
        style: text
      });
    }

    this.container.emitter.sendEvent('token-initiated', {
      colors: [...this.colors.values()].map(serialize),
      effects: [...this.effects.values()].map(serialize),
      texts: [...this.texts.values()].map(serialize)
    });
  }

  private listen(e: DocumentChangeEvent) {
    for (const change of e.documentChanges) {
      console.log('changes', change);
      
      if (change.type.startsWith('STYLE')) {
        console.log('change event', change);
      }

      if (change.type === 'STYLE_CREATE') {
        this.create(change);
      }

      if (change.type === 'STYLE_PROPERTY_CHANGE') {
        this.update(change);
      }

      if (change.type === 'STYLE_DELETE') {
        this.delete(change);
      }
    }
  }

  private create(change: StyleCreateChange) {
    this.container.emitter.sendEvent('token-created', {
      style: change.style
    });
  }

  private update(change: StylePropertyChange) {
    this.container.emitter.sendEvent('token-updated', {
      style: change.style
    });
  }

  private delete(change: StyleDeleteChange) {
    this.container.emitter.sendEvent('token-deleted', {
      style: change.style
    });
  }
}