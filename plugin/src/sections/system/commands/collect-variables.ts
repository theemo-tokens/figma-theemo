import Command from '../../../infrastructure/command';
import { serialize } from '../../../utils';

export default class CollectVariablesCommand extends Command {
  NAME = 'collect-variables';

  execute() {
    this.emitter.sendEvent('variables-collected', figma.variables.getLocalVariables().map(serialize));
  }
}