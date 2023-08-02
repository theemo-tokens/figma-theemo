import { Settings } from '@theemo-figma/core/config';
import Command from '../../../infrastructure/command';
import SettingsManager from '../../../infrastructure/settings-manager';

export default class SaveSettingsCommand extends Command {
  NAME = 'save-settings';

  execute(data: Settings) {
    (async () => {
      try {
        const settings = new SettingsManager();

        this.emitter.sendEvent('settings-arrived', await settings.save(data));
        figma.notify('Style Reference settings saved');
      } catch (e) {
        console.warn(e);
      }
    })();
  }
}
