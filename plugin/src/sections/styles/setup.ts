import { Infrastructure } from '../../infrastructure';
import DeleteTransformsCommand from './commands/delete-transforms';
import LinkReferenceCommand from './commands/link-reference';
import ReadConfigCommand from './commands/read-config';
import SaveTransformsCommand from './commands/save-transforms';
import UnlinkReferenceCommand from './commands/unlink-reference';
import UpdateVariablesCommand from './commands/update-variables';
import { StylesObserver } from './observer';
import { listen } from './referencer';

export function setupStyles(infrastructure: Infrastructure) {
  new StylesObserver(infrastructure.emitter);

  setupCommands(infrastructure);
  listen(infrastructure.emitter);
}

function setupCommands({ commander }: Infrastructure) {
  commander.registerCommand(new SaveTransformsCommand());
  commander.registerCommand(new DeleteTransformsCommand());
  commander.registerCommand(new ReadConfigCommand());
  commander.registerCommand(new LinkReferenceCommand());
  commander.registerCommand(new UnlinkReferenceCommand());
  commander.registerCommand(new UpdateVariablesCommand());
}
