import { Transforms } from '@theemo-figma/core/transforms';
import { Events } from '@theemo-figma/core/styles/events';
import { filterObject, getIdFromChange } from './utils';
import { serialize } from '../../utils';
import Emitter from '../../infrastructure/emitter';
import { StyleConfig, readConfig } from './store';

interface StyleDescriptor {
  id: string;
  name: string;
  style: BaseStyle;
  reference?: string;
  transforms?: Transforms;
}

const SKIPPED_SERIALIZATION_FIELDS = ['consumers'];

type StyleMap = Map<string, StyleDescriptor>;

export class StylesObserver {
  private descriptors: StyleMap = new Map();
  private config: StyleConfig[];

  constructor(private emitter: Emitter) {
    figma.on('documentchange', this.listen.bind(this));

    this.config = readConfig();

    this.init();
  }

  private init() {
    const localStyles = [...figma.getLocalPaintStyles(), ...figma.getLocalEffectStyles(), ...figma.getLocalTextStyles()];

    for (const style of localStyles) {
      const config = this.config.find(config => config.id === style.id) ?? {};
      this.descriptors.set(style.id, {
        id: style.id,
        name: style.name,
        style,
        ...filterObject(config, ['id'])
      });
    }

    this.emitter.sendEvent(Events.Initiated, [...this.descriptors.values()].map(serialize));
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
      this.descriptors.set(id, {
        id,
        style: change.style,
        name: change.style.name
      });

      this.emitter.sendEvent(Events.Created, this.serialize(id));
    }
  }

  private update(change: StylePropertyChange) {
    const id = getIdFromChange(change);

    if (change.style && this.descriptors.has(id)) {
      this.descriptors.set(id, {
        ...this.descriptors.get(id) as StyleDescriptor,
        style: change.style
      });

      this.emitter.sendEvent(Events.Updated, this.serialize(id));
    }
  }

  private delete(change: StyleDeleteChange) {
    const id = getIdFromChange(change);

    if (this.descriptors.has(id)) {
      this.descriptors.delete(id);
      this.emitter.sendEvent(Events.Deleted, id);
    }
  }

  private serialize(id: string) {
    return serialize(filterObject(this.descriptors.get(id) as unknown as Record<string, unknown>, SKIPPED_SERIALIZATION_FIELDS));
  }
}