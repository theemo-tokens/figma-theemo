import Command from '../../../infrastructure/command';
import { serialize } from '../../../utils';

export default class CollectCollectionsCommand extends Command {
  NAME = 'collect-collections';

  async execute() {
    const collections = await figma.variables.getLocalVariableCollectionsAsync();

    this.emitter.sendEvent('collections-collected', collections.map(serialize));
  }
}
