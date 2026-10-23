import { Infrastructure } from '../../infrastructure';
import CollectCollectionsCommand from './commands/collect-collections';
import CollectVariablesCommand from './commands/collect-variables';
import MaximizeCommand from './commands/maximize';
import MigrateCommand from './commands/migrate';
import MinimizeCommand from './commands/minimize';

export function setupSystem(infrastructure: Infrastructure) {
  setupCommands(infrastructure);
}

function setupCommands({ commander }: Infrastructure) {
  // ui
  commander.registerCommand(new MinimizeCommand());
  commander.registerCommand(new MaximizeCommand());

  // variables
  commander.registerCommand(new CollectVariablesCommand());
  commander.registerCommand(new CollectCollectionsCommand());

  // internal
  commander.registerCommand(new MigrateCommand());
}
