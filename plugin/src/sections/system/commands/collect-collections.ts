import Command from '../../../infrastructure/command';
import { serialize } from '../../../utils';

export default class CollectCollectionsCommand extends Command {
  NAME = 'collect-collections';

  execute() {
    this.emitter.sendEvent('collections-collected', figma.variables.getLocalVariableCollections().map(serialize));
  }
}