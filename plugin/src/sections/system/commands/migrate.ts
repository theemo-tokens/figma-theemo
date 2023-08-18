import { Settings } from '@theemo-figma/core/config';
import Command from '../../../infrastructure/command';
import SettingsManager from '../../../infrastructure/settings-manager';
import { migrateNonPaintReferences, migratePluginData } from '../../node/migrate';
import { figureAndSaveVersion } from '../version';

export default class MigrateCommand extends Command {
  NAME = 'migrate';

  async execute() {
    migratePluginData();

    migrateNonPaintReferences({
      emitter: this.emitter,
      commander: this.commander,
      settings: new SettingsManager()
    });

    

    const settings = new SettingsManager();
    const data = await settings.read() as Settings;
    data['tools.auto-update-references'] = false;

    this.emitter.sendEvent('settings-arrived', await settings.save(data));

    const version = figureAndSaveVersion();
    this.emitter.sendEvent('version-changed', version);
  }
}