import Emitter from '../../../infrastructure/emitter';
import SettingsManager from '../../../infrastructure/settings-manager';
import ContextManager from './context-manager';
import NodeRegistry from './node-registry';
import ReferencesManager from './references-manager';

export default class Container {
  emitter: Emitter;
  settings: SettingsManager;
  registry: NodeRegistry;
  references: ReferencesManager;
  contexts: ContextManager;

  constructor(container?: Partial<Container>) {
    this.emitter = container?.emitter ?? new Emitter();
    this.settings = container?.settings ?? new SettingsManager();
    this.registry = container?.registry ?? new NodeRegistry(this);
    this.references = container?.references ?? new ReferencesManager(this);
    this.contexts = container?.contexts ?? new ContextManager(this);
  }
}