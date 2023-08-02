import Command from '../../../infrastructure/command';
import { migratePluginData } from '../../node/migrate';

export default class MigrateCommand extends Command {
  NAME = 'migrate';

  execute() {
    migratePluginData();

    // migrateNonColorReferences()
  }
}