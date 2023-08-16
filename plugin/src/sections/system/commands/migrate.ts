import Command from '../../../infrastructure/command';
import SettingsManager from '../../../infrastructure/settings-manager';
import { migrateNonPaintReferences, migratePluginData } from '../../node/migrate';
import { figureAndSaveVersion } from '../version';

export default class MigrateCommand extends Command {
  NAME = 'migrate';

  execute() {
    migratePluginData();

    migrateNonPaintReferences({
      emitter: this.emitter,
      commander: this.commander,
      settings: new SettingsManager()
    });

    const version = figureAndSaveVersion();

    this.emitter.sendEvent('version-changed', version);
  }
}