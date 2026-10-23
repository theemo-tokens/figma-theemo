import Command from '../../../infrastructure/command';
import { CommandName, type Commands } from '@core/styles/commands';
import { readConfig, storeConfig } from '../store';

export default class UnlinkReferenceCommand extends Command {
  NAME = CommandName.UnlinkReference;

  async execute(data: Commands[CommandName.UnlinkReference]) {
    const config = await readConfig();
    const existing = config.styles.find((style) => style.styleId === data.styleId);

    if (existing) {
      config.styles.splice(config.styles.indexOf(existing), 1);

      await storeConfig(config);
      this.commander.run(CommandName.ReadConfig);
    }
  }
}
