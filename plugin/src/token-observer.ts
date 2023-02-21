import Container from './container/index';
import { Token } from '@theemo/figma-shared';

type TokenMap = Map<string, Token>;

const SKIPPED_SERIALIZATION_FIELDS = ['consumers'];

function serialize(object: Object) {
  const ret = {};

  for (const prop in object) {
    if (SKIPPED_SERIALIZATION_FIELDS.indexOf(prop) !== -1) {
      continue;
    }

    if (typeof object[prop] === 'object') {
      ret[prop] = serialize(object[prop]);
    } else {
      ret[prop] = object[prop];
    }
  }

  return ret;
}

function getIdFromChange(change: StyleCreateChange | StylePropertyChange | StyleDeleteChange) {
  const { id } = change;
  const parts = id.split(',');
  return `${parts[0]},`;
}

export default class TokenObserver {

  private static NAMESPACE = 'theemo';
  private tokens: TokenMap = new Map();

  constructor(private container: Container) {
    figma.on('documentchange', this.listen.bind(this));

    this.init();
  }

  private init() {
    // const tokensRaw = figma.root.getSharedPluginData(TokenObserver.NAMESPACE, 'tokens') ?? '{}';
    // const tokens = JSON.parse(tokensRaw);

    for (const paint of figma.getLocalPaintStyles()) {
      this.tokens.set(paint.id, {
        id: paint.id,
        name: paint.name,
        style: paint
      });
    }

    for (const effect of figma.getLocalEffectStyles()) {
      this.tokens.set(effect.id, {
        id: effect.id,
        name: effect.name,
        style: effect
      });
    }

    for (const text of figma.getLocalTextStyles()) {
      this.tokens.set(text.id, {
        id: text.id,
        name: text.name,
        style: text
      });
    }

    this.container.emitter.sendEvent('token-initiated', [...this.tokens.values()].map(serialize));
  }

  private listen(e: DocumentChangeEvent) {
    for (const change of e.documentChanges) {
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
    if (change.style) {
      const id = getIdFromChange(change);
      this.tokens.set(id, {
        id,
        style: change.style,
        name: change.style.name
      });

      this.container.emitter.sendEvent('token-created', serialize(this.tokens.get(id)));
    }
  }

  private update(change: StylePropertyChange) {
    const id = getIdFromChange(change);

    if (change.style && this.tokens.has(id)) {
      this.tokens.set(id, {
        ...this.tokens.get(id),
        style: change.style
      });

      this.container.emitter.sendEvent('token-updated', serialize(this.tokens.get(id)));
    }
  }

  private delete(change: StyleDeleteChange) {
    const id = getIdFromChange(change);

    if (this.tokens.has(id)) {
      this.tokens.delete(id);
      this.container.emitter.sendEvent('token-deleted', id);
    }
  }
}