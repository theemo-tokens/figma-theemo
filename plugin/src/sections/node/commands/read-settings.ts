import Command from '../../../infrastructure/command';
import SettingsManager from '../../../infrastructure/settings-manager';

export default class ReadSettingsCommand extends Command {
  NAME = 'read-settings';

  execute() {
    const settings = new SettingsManager();
    settings.read().then(config => {
      this.emitter.sendEvent('settings-arrived', config);
    });
  }
}
