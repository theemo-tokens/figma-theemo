import Command from '../../../infrastructure/command';
import { CommandName, type Commands } from '@core/styles/commands';
import { readConfig, storeConfig } from '../store';

export default class LinkReferenceCommand extends Command {
  NAME = CommandName.LinkReference;

  async execute(data: Commands[CommandName.LinkReference]) {
    const config = await readConfig();
    const existing = config.styles.find((style) => style.styleId === data.styleId);

    if (existing) {
      existing.referenceId = data.referenceId;
    } else {
      config.styles.push(data);
    }

    await storeConfig(config);
    this.commander.run(CommandName.ReadConfig);
  }
}
