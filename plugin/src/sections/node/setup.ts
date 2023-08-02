import Container from './container';
import { canHandleNode } from './utils';
import { RefNode } from './types';
import { Infrastructure } from '../../infrastructure';
import CreateReferenceCommand from './commands/create-reference';
import LinkOriginCommand from './commands/link-origin';
import MigrateOriginCommand from './commands/migrate-origin';
import UnlinkOriginCommand from './commands/unlink-origin';
import UnlinkReferenceCommand from './commands/unlink-reference';
import SaveTransformsCommand from './commands/save-transforms';
import UpdateStylesCommand from './commands/update-styles';
import CollectReferencesCommand from './commands/collect-references';
import AddContextCommand from './commands/add-context';
import RemoveContextCommand from './commands/remove-context';
import SelectContextCommand from './commands/select-context';
import ImportCommand from './commands/import';
import CollectMigrationStylesCommand from './commands/collect-migration-styles';
import MigrateStylesCommand from './commands/migrate-styles';
import CollectStatsCommand from './commands/collect-stats';
import Emitter from '../../infrastructure/emitter';
import ReadSettingsCommand from './commands/read-settings';
import SaveSettingsCommand from './commands/save-settings';

export function setupNode(infrastructure: Infrastructure) {
  const container = new Container(infrastructure);
  
  setupCommands(infrastructure, container);
  setupSelection(infrastructure, container);
}

function setupCommands({ commander }: Infrastructure, container: Container) {
  // node commands
  commander.registerCommand(new CreateReferenceCommand(container));
  commander.registerCommand(new LinkOriginCommand(container));
  commander.registerCommand(new MigrateOriginCommand(container));
  commander.registerCommand(new UnlinkOriginCommand(container));
  commander.registerCommand(new UnlinkReferenceCommand(container));
  commander.registerCommand(new SaveTransformsCommand(container));

  // tools
  commander.registerCommand(new UpdateStylesCommand(container));
  commander.registerCommand(new CollectReferencesCommand(container));
  commander.registerCommand(new AddContextCommand(container));
  commander.registerCommand(new RemoveContextCommand(container));
  commander.registerCommand(new SelectContextCommand(container));
  commander.registerCommand(new ImportCommand(container));
  commander.registerCommand(new CollectStatsCommand(container));

  // migrate styles
  commander.registerCommand(new CollectMigrationStylesCommand(container));
  commander.registerCommand(new MigrateStylesCommand(container));

  // settings
  commander.registerCommand(new ReadSettingsCommand());
  commander.registerCommand(new SaveSettingsCommand());

  commander.run('read-settings');
}

function setupSelection({ emitter }: Infrastructure, container: Container) {
  // handle selection
  handleSelection(figma.currentPage.selection, container, emitter);

  figma.on('selectionchange', () => {
    if (!handleSelection(figma.currentPage.selection, container, emitter)) {
      emitter.sendEvent('selection-changed', null);
    }
  });
}

function handleSelection(selection: readonly SceneNode[], container: Container, emitter: Emitter) {
  if (selection.length > 0 && canHandleNode(selection[0])) {
    const manager = container.registry.get(selection[0] as RefNode);
    emitter.sendEvent('selection-changed', manager.data);
    return true;
  } else {
    return false;
  }
}