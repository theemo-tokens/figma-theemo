import Command from './command';
import SettingsManager from '../settings-manager';



export default class ReadSettingsCommand extends Command {
  NAME = 'read-settings';

  execute() {
    (async () => {
      const manager = new SettingsManager();
      this.emitter.sendEvent('settings-arrived', await manager.read());
    })();
  }
}