import Command from '../../../infrastructure/command';
import { serialize } from '../../../utils';

export default class CollectVariablesCommand extends Command {
  NAME = 'collect-variables';

  async execute() {
    const variables = await figma.variables.getLocalVariablesAsync();

    this.emitter.sendEvent('variables-collected', variables.map(serialize));
  }
}
